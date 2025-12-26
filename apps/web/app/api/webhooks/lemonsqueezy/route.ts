import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/server'
import { SubscriptionStatus, SubscriptionTier } from '@/types/database'
import type { LemonSqueezyWebhookPayload } from '@/types/api'
import { webhookLog } from '@/lib/debug-logger'

/**
 * Verify webhook signature from Lemon Squeezy
 */
function verifySignature(payload: string, signature: string): boolean {
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET

    if (!secret) {
        webhookLog.error('LEMONSQUEEZY_WEBHOOK_SECRET is not set')
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
    // Lifetime Launch Offer
    if (variantId === process.env.LEMONSQUEEZY_LIFETIME_LAUNCH_VARIANT_ID) {
        return SubscriptionTier.LIFETIME_LAUNCH
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

    // Default to free plan for unknown variants
    return SubscriptionTier.FREE
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

        webhookLog.info('Lemon Squeezy webhook received', {
            hasSignature: !!signature,
            bodyLength: rawBody.length,
            timestamp: new Date().toISOString()
        })

        if (!signature) {
            webhookLog.error('Missing webhook signature')
            return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
        }

        // Verify the webhook signature
        if (!verifySignature(rawBody, signature)) {
            webhookLog.error('Invalid webhook signature')
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }

        // Parse the webhook payload
        const payload: LemonSqueezyWebhookPayload = JSON.parse(rawBody)
        const eventName = payload.meta.event_name

        webhookLog.info(`Processing Lemon Squeezy webhook: ${eventName}`, {
            eventName,
            dataId: payload.data.id,
            dataType: payload.data.type,
            fullPayload: payload
        })

        // Get admin Supabase client (bypasses RLS)
        const supabase = await createAdminClient()

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

                webhookLog.info(`Processing ${eventName}`, {
                    email: userEmail,
                    variantId: variantId,
                    eventName: eventName
                })

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

                    webhookLog.error(`User not found for email: ${userEmail}`, {
                        email: userEmail,
                        error: profileError?.message,
                        // @ts-ignore
                        allProfiles: allProfiles?.map(p => ({ id: p.id, email: p.email })) || [],
                        searchedEmail: userEmail,
                        emailLength: (userEmail as string)?.length,
                        emailTrimmed: (userEmail as string)?.trim()
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

                // Get credit limits based on tier
                const getCreditLimit = (tier: SubscriptionTier): number => {
                    switch (tier) {
                        case SubscriptionTier.FREE:
                            return 10  // Updated to match schema
                        case SubscriptionTier.LIFETIME_LAUNCH:
                            return 1000
                        case SubscriptionTier.BASIC_MONTHLY:
                        case SubscriptionTier.BASIC_ANNUAL:
                            return 350
                        case SubscriptionTier.PRO_MONTHLY:
                        case SubscriptionTier.PRO_ANNUAL:
                            return 700
                        case SubscriptionTier.BUSINESS_MONTHLY:
                        case SubscriptionTier.BUSINESS_ANNUAL:
                            return 1500
                        default:
                            return 10  // Updated to match schema
                    }
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
                    credits_limit: getCreditLimit(tier),
                    credits_used: 0,
                    credits_reset_date: tier === SubscriptionTier.FREE ? null :
                        (tier.includes('annual') ?
                            new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() :
                            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()),
                    validity_days: tier === SubscriptionTier.FREE ? 10 : null,
                }

                // For lifetime subscriptions, reserve a slot
                if (tier === SubscriptionTier.LIFETIME_LAUNCH && eventName === 'subscription_created') {
                    try {
                        // @ts-ignore
                        const { data: subscriberNumber, error: slotError } = await supabase
                            // @ts-ignore
                            .rpc('reserve_lifetime_subscriber_slot', { user_uuid: profile.id })
                            .single()

                        if (slotError) {
                            console.error('Error reserving lifetime slot:', slotError)
                            return NextResponse.json({ error: 'Lifetime slots exhausted' }, { status: 400 })
                        }

                        // @ts-ignore
                        console.log(`Reserved lifetime slot #${subscriberNumber} for user ${profile.id}`)

                        // Check if we've hit the limit (500 subscribers)
                        // Import the product manager at the top of the file
                        const { disableLifetimeProduct } = await import('@/lib/lemonsqueezy/product-manager')

                        if (subscriberNumber >= 500) {
                            console.log('[Lifetime Slots] SOLD OUT! Disabling lifetime product in Lemon Squeezy...')
                            const disabled = await disableLifetimeProduct()

                            if (disabled) {
                                console.log('[Lifetime Slots] Successfully disabled lifetime product')
                            } else {
                                console.error('[Lifetime Slots] Failed to disable lifetime product - manual intervention required!')
                            }
                        }
                    } catch (error) {
                        console.error('Error reserving lifetime slot:', error)
                        return NextResponse.json({ error: 'Lifetime slots exhausted' }, { status: 400 })
                    }
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
                    webhookLog.error('Error upserting subscription', {
                        error: error.message,
                        subscriptionData: subscriptionData
                    })
                    return NextResponse.json({ error: 'Database error' }, { status: 500 })
                }

                webhookLog.info(`Successfully processed ${eventName}`, {
                    email: userEmail,
                    tier: tier,
                    creditsLimit: subscriptionData.credits_limit
                })

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

                webhookLog.info('Processing order_created', {
                    email: userEmail,
                    // @ts-ignore
                    originalEmail: attrs.user_email,
                    variantId: variantId,
                    expectedVariantId: process.env.LEMONSQUEEZY_LIFETIME_LAUNCH_VARIANT_ID,
                    isLifetime: variantId === process.env.LEMONSQUEEZY_LIFETIME_LAUNCH_VARIANT_ID,
                    variantIdType: typeof variantId,
                    envVarType: typeof process.env.LEMONSQUEEZY_LIFETIME_LAUNCH_VARIANT_ID,
                    orderData: {
                        orderId: payload.data.id,
                        // @ts-ignore
                        status: attrs.status,
                        // @ts-ignore
                        total: attrs.total,
                        // @ts-ignore
                        currency: attrs.currency,
                        // @ts-ignore
                        userName: attrs.user_name
                    }
                })

                // Only process Lifetime Launch purchases
                const isLifetimeVariant = variantId === process.env.LEMONSQUEEZY_LIFETIME_LAUNCH_VARIANT_ID
                
                if (isLifetimeVariant) {
                    webhookLog.info(`Processing Lifetime Launch order for ${userEmail}`)

                    // Find the user by email - try multiple approaches
                    let foundProfile = null
                    
                    // Try case-insensitive search first
                    // @ts-ignore
                    const { data: profile1 } = await supabase
                        .from('profiles')
                        .select('id, email')
                        .ilike('email', userEmail as string)
                        .single()

                    if (profile1) {
                        foundProfile = profile1
                        webhookLog.info('Found user with case-insensitive search', {
                            searchedEmail: userEmail,
                            // @ts-ignore
                            foundEmail: profile1.email,
                            // @ts-ignore
                            userId: profile1.id
                        })
                    } else {
                        // Try exact match as fallback
                        // @ts-ignore
                        const { data: profile2 } = await supabase
                            .from('profiles')
                            .select('id, email')
                            // @ts-ignore
                            .eq('email', attrs.user_email)
                            .single()

                        if (profile2) {
                            foundProfile = profile2
                            webhookLog.info('Found user with exact match', {
                                searchedEmail: userEmail,
                                // @ts-ignore
                                originalEmail: attrs.user_email,
                                // @ts-ignore
                                foundEmail: profile2.email,
                                // @ts-ignore
                                userId: profile2.id
                            })
                        }
                    }

                    if (!foundProfile) {
                        // Try to get all profiles for debugging
                        // @ts-ignore
                        const { data: allProfiles } = await supabase
                            .from('profiles')
                            .select('id, email')
                            .limit(10)

                        webhookLog.error(`User not found for lifetime order: ${userEmail}`, {
                            email: userEmail,
                            // @ts-ignore
                            originalEmail: attrs.user_email,
                            // @ts-ignore
                            allProfiles: allProfiles?.map(p => ({ id: p.id, email: p.email })) || [],
                            searchedEmail: userEmail,
                            emailLength: (userEmail as string)?.length,
                            emailTrimmed: (userEmail as string)?.trim()
                        })
                        return NextResponse.json({ 
                            error: 'User not found', 
                            // @ts-ignore
                            details: `Please ensure user ${attrs.user_email} has signed up and has a profile in the system`,
                            // @ts-ignore
                            userEmail: attrs.user_email,
                            // @ts-ignore
                            availableEmails: allProfiles?.map(p => p.email) || []
                        }, { status: 404 })
                    }

                    // Reserve a lifetime subscriber slot
                    try {
                        // @ts-ignore
                        const { data: subscriberNumber, error: slotError } = await supabase
                            // @ts-ignore
                            .rpc('reserve_lifetime_subscriber_slot', { user_uuid: foundProfile.id })
                            .single()

                        if (slotError) {
                            console.error('Error reserving lifetime slot:', slotError)
                            return NextResponse.json({ error: 'Lifetime slots exhausted' }, { status: 400 })
                        }

                        // @ts-ignore
                        console.log(`Reserved lifetime slot #${subscriberNumber} for user ${foundProfile.id}`)

                        // Create subscription record for the lifetime purchase
                        const subscriptionData = {
                            // @ts-ignore
                            user_id: foundProfile.id,
                            lemon_squeezy_id: `order_${payload.data.id}`, // Prefix to distinguish from subscription IDs
                            status: SubscriptionStatus.ACTIVE,
                            tier: SubscriptionTier.LIFETIME_LAUNCH,
                            tier_name: SubscriptionTier.LIFETIME_LAUNCH,
                            current_period_start: new Date().toISOString(),
                            current_period_end: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 100 years
                            cancel_at: null,
                            credits_limit: 1000,
                            credits_used: 0,
                            credits_reset_date: null, // Lifetime = no reset
                            validity_days: null,
                        }

                        webhookLog.info('Creating lifetime subscription', {
                            // @ts-ignore
                            userId: foundProfile.id,
                            // @ts-ignore
                            userEmail: foundProfile.email,
                            subscriptionData: subscriptionData
                        })

                        // @ts-ignore
                        const { error: insertError } = await supabase
                            .from('subscriptions')
                            // @ts-ignore
                            .upsert(subscriptionData, {
                                onConflict: 'lemon_squeezy_id',
                            })

                        if (insertError) {
                            webhookLog.error('Error creating lifetime subscription', {
                                error: insertError.message,
                                subscriptionData: subscriptionData,
                                // @ts-ignore
                                userId: foundProfile.id
                            })
                            console.error('Error creating lifetime subscription:', insertError)
                            return NextResponse.json({ error: 'Database error', details: insertError.message }, { status: 500 })
                        }

                        webhookLog.info('Successfully created lifetime subscription', {
                            // @ts-ignore
                            userId: foundProfile.id,
                            // @ts-ignore
                            userEmail: foundProfile.email,
                            subscriberNumber: subscriberNumber
                        })

                        // Check if we've hit the limit and disable product
                        if (subscriberNumber >= 500) {
                            console.log('[Lifetime Slots] SOLD OUT! Disabling lifetime product in Lemon Squeezy...')
                            const { disableLifetimeProduct } = await import('@/lib/lemonsqueezy/product-manager')
                            const disabled = await disableLifetimeProduct()

                            if (disabled) {
                                console.log('[Lifetime Slots] Successfully disabled lifetime product')
                            } else {
                                console.error('[Lifetime Slots] Failed to disable lifetime product - manual intervention required!')
                            }
                        }
                    } catch (error) {
                        console.error('Error processing lifetime order:', error)
                        return NextResponse.json({ error: 'Failed to process order' }, { status: 500 })
                    }
                } else {
                    webhookLog.info(`Ignoring non-lifetime order`, {
                        variantId: variantId,
                        expectedLifetimeVariant: process.env.LEMONSQUEEZY_LIFETIME_LAUNCH_VARIANT_ID,
                        reason: 'Variant ID does not match lifetime launch variant',
                        userEmail: userEmail
                    })
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
                break
            }

            default:
                webhookLog.info(`Unhandled webhook event: ${eventName}`)
        }

        // Return 200 to acknowledge receipt
        webhookLog.info('Webhook processed successfully')
        return NextResponse.json({ received: true })
    } catch (error) {
        webhookLog.error('Webhook processing error', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        })
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}