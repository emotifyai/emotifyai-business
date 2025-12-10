import { createClient } from '@/lib/supabase/server'
import { 
    type Subscription, 
    type SubscriptionTier, 
    type SubscriptionStatus,
    type UsageQuota,
    getTierConfig,
    isSubscriptionActive
} from './types'

/**
 * Credit status for a user
 */
export interface CreditStatus {
    tier_name: SubscriptionTier
    credits_limit: number
    credits_used: number
    credits_remaining: number
    credits_reset_date: string | null
    validity_days: number | null
    is_expired: boolean
    can_use: boolean
}

/**
 * Get the current subscription for a user
 */
export async function getUserSubscription(userId: string): Promise<Subscription | null> {
    const supabase = await createClient()

    const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['active', 'trial'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    if (error || !subscription) {
        return null
    }

    return subscription as Subscription
}

/**
 * Check if a user has an active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
    const subscription = await getUserSubscription(userId)
    return subscription !== null && isSubscriptionActive(subscription)
}

/**
 * Get credit status for a user using database function
 */
export async function getUserCreditStatus(userId: string): Promise<CreditStatus | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .rpc('get_user_credit_status', { user_uuid: userId })
        .single()

    if (error) {
        console.error('Error fetching credit status:', error)
        return null
    }

    return data as CreditStatus
}

/**
 * Get usage quota information (legacy compatibility)
 */
export async function getUsageInfo(userId: string): Promise<UsageQuota | null> {
    const creditStatus = await getUserCreditStatus(userId)
    if (!creditStatus) return null

    return {
        quota: creditStatus.credits_limit,
        used: creditStatus.credits_used,
        remaining: creditStatus.credits_remaining,
        reset_at: creditStatus.credits_reset_date,
        percentage_used: creditStatus.credits_limit > 0 
            ? Math.round((creditStatus.credits_used / creditStatus.credits_limit) * 100)
            : 0
    }
}

/**
 * Check if user can make an enhancement request using database function
 */
export async function canMakeEnhancement(userId: string): Promise<{
    allowed: boolean
    reason?: string
    creditStatus?: CreditStatus
}> {
    const supabase = await createClient()

    // Use database function to check if user can use credits
    const { data: canUse, error } = await supabase
        .rpc('can_use_credits', { user_uuid: userId })
        .single()

    if (error) {
        console.error('Error checking credit usage:', error)
        return {
            allowed: false,
            reason: 'CREDIT_CHECK_ERROR',
        }
    }

    // Get detailed credit status for more specific error messages
    const creditStatus = await getUserCreditStatus(userId)
    if (!creditStatus) {
        return {
            allowed: false,
            reason: 'NO_SUBSCRIPTION',
        }
    }

    if (!canUse) {
        if (creditStatus.is_expired) {
            return {
                allowed: false,
                reason: 'SUBSCRIPTION_EXPIRED',
                creditStatus,
            }
        }

        if (creditStatus.credits_used >= creditStatus.credits_limit) {
            return {
                allowed: false,
                reason: 'CREDIT_LIMIT_EXCEEDED',
                creditStatus,
            }
        }

        return {
            allowed: false,
            reason: 'SUBSCRIPTION_INACTIVE',
            creditStatus,
        }
    }

    return {
        allowed: true,
        creditStatus,
    }
}

/**
 * Create a free plan subscription for a new user
 */
export async function createFreeSubscription(userId: string): Promise<void> {
    const supabase = await createClient()

    const now = new Date()
    const freeEnd = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000) // 10 days

    await supabase.from('subscriptions').insert({
        user_id: userId,
        lemon_squeezy_id: `free_${userId}`,
        status: 'trial' as SubscriptionStatus,
        tier: 'free' as any, // Will be handled by tier_name
        tier_name: 'free',
        credits_limit: 50,
        credits_used: 0,
        validity_days: 10,
        current_period_start: now.toISOString(),
        current_period_end: freeEnd.toISOString(),
    })
}

/**
 * Consume credits for a user
 */
export async function consumeCredits(userId: string, creditsToConsume: number = 1): Promise<boolean> {
    const supabase = await createClient()

    const { data: success, error } = await supabase
        .rpc('consume_credits', { 
            user_uuid: userId, 
            credits_to_consume: creditsToConsume 
        })
        .single()

    if (error) {
        console.error('Error consuming credits:', error)
        return false
    }

    return success as boolean
}

/**
 * Reserve a lifetime subscriber slot
 */
export async function reserveLifetimeSlot(userId: string): Promise<number | null> {
    const supabase = await createClient()

    try {
        const { data: subscriberNumber, error } = await supabase
            .rpc('reserve_lifetime_subscriber_slot', { user_uuid: userId })
            .single()

        if (error) {
            console.error('Error reserving lifetime slot:', error)
            return null
        }

        return subscriberNumber as number
    } catch (error) {
        console.error('Error reserving lifetime slot:', error)
        return null
    }
}

/**
 * Check if lifetime offer is available
 */
export async function isLifetimeOfferAvailable(): Promise<boolean> {
    const supabase = await createClient()

    const { data: available, error } = await supabase
        .rpc('is_lifetime_offer_available')
        .single()

    if (error) {
        console.error('Error checking lifetime offer availability:', error)
        return false
    }

    return available as boolean
}

/**
 * Get lifetime offer status
 */
export async function getLifetimeOfferStatus() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .rpc('get_lifetime_offer_status')
        .single()

    if (error) {
        console.error('Error getting lifetime offer status:', error)
        return null
    }

    return data
}

/**
 * Validate subscription tier has access to a feature
 */
export function hasFeatureAccess(_tier: SubscriptionTier, _feature: string): boolean {
    // For now, all tiers have access to basic features
    // This can be expanded based on specific feature requirements
    return true
}
