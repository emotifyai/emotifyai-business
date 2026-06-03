import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/server'
import { SubscriptionStatus, SubscriptionTier } from '@/types/database'
import type { LemonSqueezyWebhookPayload } from '@/types/api'
import { getCreditsForTier, isBundleTier } from '@/lib/pricing/credits'
import type { SubscriptionTier as AppSubscriptionTier } from '@/lib/subscription/types'
import { sendPaymentConfirmationEmail } from '@/lib/email/zeptomail'

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
function getSubscriptionTier(variantId: string): SubscriptionTier | null {
    if (variantId === process.env.LEMONSQUEEZY_LIFETIME_LAUNCH_VARIANT_ID) {
        return null
    }

    // Monthly Plans
    if (variantId === process.env.LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID) {
        return SubscriptionTier.BASIC_MONTHLY
    }
    if (variantId === process.env.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID) {
        return SubscriptionTier.PRO_MONTHLY
    }
    if (variantId === process.env.LEMONSQUEEZY_BUSINESS_MONTHLY_VARIANT_ID) {
        return SubscriptionTier.BUSINESS_MONTHLY
    }

    // Annual Plans
    if (variantId === process.env.LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID) {
        return SubscriptionTier.BASIC_ANNUAL
    }
    if (variantId === process.env.LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID) {
        return SubscriptionTier.PRO_ANNUAL
    }
    if (variantId === process.env.LEMONSQUEEZY_BUSINESS_ANNUAL_VARIANT_ID) {
        return SubscriptionTier.BUSINESS_ANNUAL
    }

    if (variantId === process.env.LEMONSQUEEZY_SMALL_BUNDLE_VARIANT_ID) {
        return SubscriptionTier.SMALL_BUNDLE
    }
    if (variantId === process.env.LEMONSQUEEZY_LARGE_BUNDLE_VARIANT_ID) {
        return SubscriptionTier.LARGE_BUNDLE
    }

    // Default to free plan for unknown variants
    return SubscriptionTier.FREE
}

function getBundleTierFromVariant(variantId: string): SubscriptionTier | null {
    if (variantId === process.env.LEMONSQUEEZY_SMALL_BUNDLE_VARIANT_ID) {
        return SubscriptionTier.SMALL_BUNDLE
    }
    if (variantId === process.env.LEMONSQUEEZY_LARGE_BUNDLE_VARIANT_ID) {
        return SubscriptionTier.LARGE_BUNDLE
    }
    return null
}

export async function POST(request: NextRequest) {
    try {
        // Get the raw body for signature verification
        const rawBody = await request.text()
        const signature = request.headers.get('x-signature')

        console.log('Webhook received:', {
            hasSignature: !!signature,
            bodyLength: rawBody.length,
            timestamp: new Date().toISOString()
        })

        if (!signature) {
            console.error('Missing webhook signature')
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

        console.log(`Processing Lemon Squeezy webhook: ${eventName}`, {
            eventName,
            dataId: payload.data.id,
            dataType: payload.data.type
        })

        // Get admin Supabase client (bypasses RLS)
        const supabase = await createAdminClient()

        // Test Supabase connection
        try {
            // @ts-ignore
            const { data: testData, error: testError } = await supabase
                .from('profiles')
                .select('count')
                .limit(1)

            if (testError) {
                console.error('Supabase connection test failed:', {
                    error: testError.message,
                    code: testError.code,
                    details: testError.details,
                    hint: testError.hint
                })
            } else {
                console.log('Supabase connection test successful')
            }
        } catch (error) {
            console.error('Supabase connection failed:', {
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            })
        }

        // Handle different webhook events
        switch (eventName) {
            case 'subscription_created':
            case 'subscription_updated': {
                // @ts-ignore
                const attrs = payload.data.attributes

                // Extract user ID from custom data or email
                // @ts-ignore
                const userEmail = attrs.user_email
                // @ts-ignore
                const variantId = attrs.variant_id.toString()

                console.log(`Processing ${eventName} for email: ${userEmail}, variant: ${variantId}`)

                // Find the user by email (case-insensitive)
                // @ts-ignore
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('id, email')
                    .ilike('email', userEmail as string)
                    .single()

                if (!profile || profileError) {
                    // Try to get all profiles for debugging
                    // @ts-ignore
                    const { data: allProfiles } = await supabase
                        .from('profiles')
                        .select('id, email')
                        .limit(10)

                    console.error(`User not found for email: ${userEmail}`, {
                        email: userEmail,
                        error: profileError?.message,
                        // @ts-ignore
                        allProfiles: allProfiles?.map(p => ({ id: p.id, email: p.email })) || []
                    })
                    return NextResponse.json({ 
                        error: 'User not found', 
                        details: `Please ensure user ${userEmail} has signed up and has a profile in the system`,
                        userEmail,
                        // @ts-ignore
                        availableEmails: allProfiles?.map(p => p.email) || []
                    }, { status: 404 })
                }

                const tier = getSubscriptionTier(variantId)
                if (!tier) {
                    console.warn(
                        `[Webhook] Ignoring ${eventName} — lifetime offer retired (variant ${variantId})`
                    )
                    return NextResponse.json({ received: true, ignored: 'lifetime_retired' })
                }

                const subscriptionData = {
                    // @ts-ignore
                    user_id: profile.id,
                    lemon_squeezy_id: payload.data.id,
                    // @ts-ignore
                    status: mapSubscriptionStatus(attrs.status),
                    tier: tier,
                    tier_name: tier,
                    // @ts-ignore
                    current_period_start: attrs.renews_at || new Date().toISOString(),
                    // @ts-ignore
                    current_period_end: attrs.ends_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    // @ts-ignore
                    cancel_at: attrs.ends_at || null,
                    credits_limit: getCreditsForTier(tier as AppSubscriptionTier),
                    credits_used: 0,
                    credits_reset_date:
                        tier === SubscriptionTier.FREE || isBundleTier(tier as AppSubscriptionTier)
                            ? null
                            : tier.includes('annual')
                              ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
                              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    validity_days: null,
                }

                // Upsert subscription
                // @ts-ignore
                const { error } = await supabase
                    .from('subscriptions')
                    // @ts-ignore
                    .upsert(subscriptionData, {
                        onConflict: 'lemon_squeezy_id',
                    })

                if (error) {
                    console.error('Error upserting subscription:', {
                        error: error.message,
                        subscriptionData: subscriptionData
                    })
                    return NextResponse.json({ error: 'Database error' }, { status: 500 })
                }

                console.log(`Successfully processed ${eventName} for ${userEmail}, tier: ${tier}`)

                break
            }

            case 'order_created': {
                // @ts-ignore
                const attrs = payload.data.attributes
                // @ts-ignore
                const firstOrderItem = attrs.first_order_item
                // @ts-ignore
                const variantId = firstOrderItem?.variant_id?.toString()
                // @ts-ignore
                const userEmail = attrs.user_email?.trim()?.toLowerCase() // Normalize email

                console.log(`Processing order_created for email: ${userEmail}, variant: ${variantId}`)

                const bundleTier = variantId ? getBundleTierFromVariant(variantId) : null
                if (variantId === process.env.LEMONSQUEEZY_LIFETIME_LAUNCH_VARIANT_ID) {
                    console.warn(
                        `[Webhook] Ignoring order_created — lifetime offer retired (variant ${variantId})`
                    )
                    return NextResponse.json({ received: true, ignored: 'lifetime_retired' })
                }

                if (bundleTier) {
                    // @ts-ignore
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('id, email')
                        .ilike('email', userEmail as string)
                        .single()

                    if (!profile || profileError) {
                        console.error(`User not found for bundle order: ${userEmail}`, profileError)
                        return NextResponse.json({ error: 'User not found' }, { status: 404 })
                    }

                    const bundleCredits = getCreditsForTier(bundleTier as AppSubscriptionTier)
                    const farFuture = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString()

                    const bundleData = {
                        // @ts-ignore
                        user_id: profile.id,
                        lemon_squeezy_id: `order_${payload.data.id}`,
                        status: SubscriptionStatus.ACTIVE,
                        tier: bundleTier,
                        tier_name: bundleTier,
                        current_period_start: new Date().toISOString(),
                        current_period_end: farFuture,
                        cancel_at: null,
                        credits_limit: bundleCredits,
                        credits_used: 0,
                        credits_reset_date: null,
                        validity_days: null,
                    }

                    // @ts-ignore
                    const { error: insertError } = await supabase
                        .from('subscriptions')
                        // @ts-ignore
                        .upsert(bundleData, { onConflict: 'lemon_squeezy_id' })

                    if (insertError) {
                        console.error('Error creating bundle subscription:', insertError)
                        return NextResponse.json({ error: 'Database error' }, { status: 500 })
                    }

                    console.log(`Bundle order processed: ${bundleTier} for ${userEmail}`)

                    try {
                        const { data: status } = await (supabase as any).rpc('get_user_credit_status', { user_uuid: profile.id }).single()
                        if (status) {
                            await sendPaymentConfirmationEmail(userEmail, status.credits_remaining)
                        }
                    } catch (emailError) {
                        console.error('Failed to send payment confirmation email:', emailError)
                    }
                } else {
                    console.log(`Ignoring order - variant ${variantId} not configured`)
                }

                break
            }

            case 'subscription_cancelled': {
                // @ts-ignore
                const attrs = payload.data.attributes

                // Update subscription status
                // @ts-ignore
                const { error } = await supabase
                    .from('subscriptions')
                    // @ts-ignore
                    .update({
                        status: SubscriptionStatus.CANCELLED,
                        // @ts-ignore
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
                // @ts-ignore
                const attrs = payload.data.attributes

                // Update subscription status
                // @ts-ignore
                const { error } = await supabase
                    .from('subscriptions')
                    // @ts-ignore
                    .update({
                        status: SubscriptionStatus.ACTIVE,
                        cancel_at: null,
                        // @ts-ignore
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
                // @ts-ignore
                const { error } = await supabase
                    .from('subscriptions')
                    // @ts-ignore
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

                // @ts-ignore
                const { error } = await supabase
                    .from('subscriptions')
                    // @ts-ignore
                    .update({ status })
                    .eq('lemon_squeezy_id', payload.data.id)

                if (error) {
                    console.error('Error updating subscription:', error)
                    return NextResponse.json({ error: 'Database error' }, { status: 500 })
                }

                break
            }

            case 'order_refunded': {
                // @ts-ignore
                const attrs = payload.data.attributes
                const orderId = payload.data.id
                // @ts-ignore
                const refundedAmount = attrs.refunded_amount
                // @ts-ignore
                const totalAmount = attrs.total

                console.log(`Processing refund for order ${orderId}: ${refundedAmount}/${totalAmount}`)

                // Find subscription by lemon_squeezy_id (order ID)
                // @ts-ignore
                const { data: subscription } = await supabase
                    .from('subscriptions')
                    .select('*')
                    .eq('lemon_squeezy_id', orderId)
                    .single()

                if (!subscription) {
                    console.warn(`No subscription found for refunded order: ${orderId}`)
                    return NextResponse.json({ received: true })
                }

                // Revoke access immediately
                // @ts-ignore
                const { error } = await supabase
                    .from('subscriptions')
                    // @ts-ignore
                    .update({
                        status: SubscriptionStatus.EXPIRED,
                        cancel_at: new Date().toISOString(),
                    })
                    .eq('lemon_squeezy_id', orderId)

                if (error) {
                    console.error('Error revoking access for refunded order:', error)
                    return NextResponse.json({ error: 'Database error' }, { status: 500 })
                }

                console.log(`Access revoked for refunded order ${orderId}`)
                break
            }

            case 'subscription_payment_failed': {
                // @ts-ignore
                const attrs = payload.data.attributes
                const subscriptionId = payload.data.id

                console.log(`Payment failed for subscription ${subscriptionId}`)

                // Update subscription to PAST_DUE status
                // Don't immediately revoke access - give grace period for payment retry
                // @ts-ignore
                const { error } = await supabase
                    .from('subscriptions')
                    // @ts-ignore
                    .update({
                        status: SubscriptionStatus.PAST_DUE,
                    })
                    .eq('lemon_squeezy_id', subscriptionId)

                if (error) {
                    console.error('Error updating subscription to PAST_DUE:', error)
                    return NextResponse.json({ error: 'Database error' }, { status: 500 })
                }

                console.log(`Subscription ${subscriptionId} marked as PAST_DUE`)
                break
            }

            case 'subscription_payment_success': {
                // @ts-ignore
                const attrs = payload.data.attributes
                const subscriptionId = payload.data.id

                console.log(`Payment successful for subscription ${subscriptionId}`)

                // Get the subscription to determine tier
                // @ts-ignore
                const { data: subscription } = await supabase
                    .from('subscriptions')
                    .select('tier')
                    .eq('lemon_squeezy_id', subscriptionId)
                    .single()

                if (!subscription) {
                    console.warn(`No subscription found for payment success: ${subscriptionId}`)
                    return NextResponse.json({ received: true })
                }

                // Reset credits for the new billing cycle
                // @ts-ignore
                const tier = subscription.tier as SubscriptionTier
                const isAnnual = tier.includes('annual')
                const nextResetDate = new Date(Date.now() + (isAnnual ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString()

                // @ts-ignore
                const { error } = await supabase
                    .from('subscriptions')
                    // @ts-ignore
                    .update({
                        status: SubscriptionStatus.ACTIVE,
                        credits_used: 0,
                        credits_reset_date: nextResetDate,
                        current_period_start: new Date().toISOString(),
                        current_period_end: nextResetDate,
                    })
                    .eq('lemon_squeezy_id', subscriptionId)

                if (error) {
                    console.error('Error resetting credits after payment:', error)
                    return NextResponse.json({ error: 'Database error' }, { status: 500 })
                }

                console.log(`Credits reset for subscription ${subscriptionId}`)

                try {
                    // Fetch profile to get email
                    const { data: subData } = await supabase
                        .from('subscriptions')
                        .select('user_id, profiles(email)')
                        .eq('lemon_squeezy_id', subscriptionId)
                        .single()
                    
                    // @ts-ignore
                    const userEmail = subData?.profiles?.email
                    const userId = subData?.user_id

                    if (userEmail && userId) {
                        const { data: status } = await (supabase as any).rpc('get_user_credit_status', { user_uuid: userId }).single()
                        if (status) {
                            await sendPaymentConfirmationEmail(userEmail, status.credits_remaining)
                        }
                    }
                } catch (emailError) {
                    console.error('Failed to send payment confirmation email:', emailError)
                }
                break
            }

            default:
                console.log(`Unhandled webhook event: ${eventName}`)
        }

        // Return 200 to acknowledge receipt
        console.log('Webhook processed successfully')
        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Webhook processing error:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        })
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}