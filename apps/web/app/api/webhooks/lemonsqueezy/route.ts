import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/server'
import { SubscriptionStatus, SubscriptionTier } from '@/types/database'
import type { LemonSqueezyWebhookPayload } from '@/types/api'

/**
 * Verify webhook signature from Lemon Squeezy
 */
function verifySignature(payload: string, signature: string): boolean {
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET

    if (!secret) {
        console.error('LEMONSQUEEZY_WEBHOOK_SECRET is not set')
        return false
    }

    const hmac = crypto.createHmac('sha256', secret)
    const digest = hmac.update(payload).digest('hex')

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
}

/**
 * Map Lemon Squeezy status to our subscription status
 */
function mapSubscriptionStatus(lsStatus: string): SubscriptionStatus {
    const statusMap: Record<string, SubscriptionStatus> = {
        active: SubscriptionStatus.ACTIVE,
        cancelled: SubscriptionStatus.CANCELLED,
        expired: SubscriptionStatus.EXPIRED,
        past_due: SubscriptionStatus.PAST_DUE,
        paused: SubscriptionStatus.PAUSED,
        on_trial: SubscriptionStatus.TRIAL,
    }

    return statusMap[lsStatus] || SubscriptionStatus.EXPIRED
}

/**
 * Determine subscription tier from variant ID
 */
function getSubscriptionTier(variantId: string): SubscriptionTier {
    const monthlyVariantId = process.env.LEMONSQUEEZY_MONTHLY_VARIANT_ID
    const lifetimeVariantId = process.env.LEMONSQUEEZY_LIFETIME_VARIANT_ID

    if (variantId === monthlyVariantId) {
        return SubscriptionTier.MONTHLY
    }

    if (variantId === lifetimeVariantId) {
        return SubscriptionTier.LIFETIME
    }

    return SubscriptionTier.TRIAL
}

export async function POST(request: NextRequest) {
    try {
        // Get the raw body for signature verification
        const rawBody = await request.text()
        const signature = request.headers.get('x-signature')

        if (!signature) {
            return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
        }

        // Verify the webhook signature
        if (!verifySignature(rawBody, signature)) {
            console.error('Invalid webhook signature')
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }

        // Parse the webhook payload
        const payload: LemonSqueezyWebhookPayload = JSON.parse(rawBody)
        const eventName = payload.meta.event_name

        console.log(`Received Lemon Squeezy webhook: ${eventName}`)

        // Get admin Supabase client (bypasses RLS)
        const supabase = await createAdminClient()

        // Handle different webhook events
        switch (eventName) {
            case 'subscription_created':
            case 'subscription_updated': {
                const attrs = payload.data.attributes as any

                // Extract user ID from custom data or email
                const userEmail = attrs.user_email
                const variantId = attrs.variant_id.toString()

                // Find the user by email
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('email', userEmail)
                    .single()

                if (!profile) {
                    console.error(`User not found for email: ${userEmail}`)
                    return NextResponse.json({ error: 'User not found' }, { status: 404 })
                }

                const subscriptionData = {
                    user_id: profile.id,
                    lemon_squeezy_id: payload.data.id,
                    status: mapSubscriptionStatus(attrs.status),
                    tier: getSubscriptionTier(variantId),
                    current_period_start: attrs.renews_at || new Date().toISOString(),
                    current_period_end: attrs.ends_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    cancel_at: attrs.ends_at || null,
                }

                // Upsert subscription
                const { error } = await supabase
                    .from('subscriptions')
                    .upsert(subscriptionData, {
                        onConflict: 'lemon_squeezy_id',
                    })

                if (error) {
                    console.error('Error upserting subscription:', error)
                    return NextResponse.json({ error: 'Database error' }, { status: 500 })
                }

                break
            }

            case 'subscription_cancelled': {
                const attrs = payload.data.attributes as any

                // Update subscription status
                const { error } = await supabase
                    .from('subscriptions')
                    .update({
                        status: SubscriptionStatus.CANCELLED,
                        cancel_at: attrs.ends_at,
                    })
                    .eq('lemon_squeezy_id', payload.data.id)

                if (error) {
                    console.error('Error updating subscription:', error)
                    return NextResponse.json({ error: 'Database error' }, { status: 500 })
                }

                break
            }

            case 'subscription_resumed': {
                const attrs = payload.data.attributes as any

                // Update subscription status
                const { error } = await supabase
                    .from('subscriptions')
                    .update({
                        status: SubscriptionStatus.ACTIVE,
                        cancel_at: null,
                        current_period_end: attrs.renews_at,
                    })
                    .eq('lemon_squeezy_id', payload.data.id)

                if (error) {
                    console.error('Error updating subscription:', error)
                    return NextResponse.json({ error: 'Database error' }, { status: 500 })
                }

                break
            }

            case 'subscription_expired': {
                // Update subscription status
                const { error } = await supabase
                    .from('subscriptions')
                    .update({
                        status: SubscriptionStatus.EXPIRED,
                    })
                    .eq('lemon_squeezy_id', payload.data.id)

                if (error) {
                    console.error('Error updating subscription:', error)
                    return NextResponse.json({ error: 'Database error' }, { status: 500 })
                }

                break
            }

            case 'subscription_paused':
            case 'subscription_unpaused': {
                const status = eventName === 'subscription_paused'
                    ? SubscriptionStatus.PAUSED
                    : SubscriptionStatus.ACTIVE

                const { error } = await supabase
                    .from('subscriptions')
                    .update({ status })
                    .eq('lemon_squeezy_id', payload.data.id)

                if (error) {
                    console.error('Error updating subscription:', error)
                    return NextResponse.json({ error: 'Database error' }, { status: 500 })
                }

                break
            }

            default:
                console.log(`Unhandled webhook event: ${eventName}`)
        }

        // Return 200 to acknowledge receipt
        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Webhook processing error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
