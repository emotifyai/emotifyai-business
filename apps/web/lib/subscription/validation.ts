import { createClient } from '@/lib/supabase/server'
import { SubscriptionStatus, SubscriptionTier } from '@/types/database'
import { SUBSCRIPTION_LIMITS, type SubscriptionInfo, type UsageInfo } from '@/types/subscription'

/**
 * Get the current subscription for a user
 */
export async function getUserSubscription(userId: string): Promise<SubscriptionInfo | null> {
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

    return {
        tier: subscription.tier,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start),
        currentPeriodEnd: new Date(subscription.current_period_end),
        cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at) : null,
        limits: SUBSCRIPTION_LIMITS[subscription.tier],
    }
}

/**
 * Check if a user has an active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
    const subscription = await getUserSubscription(userId)
    return subscription !== null && subscription.status === SubscriptionStatus.ACTIVE
}

/**
 * Get usage information for the current period
 */
export async function getUsageInfo(userId: string): Promise<UsageInfo | null> {
    const subscription = await getUserSubscription(userId)
    if (!subscription) return null

    const supabase = await createClient()

    const { count, error } = await supabase
        .from('usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', subscription.currentPeriodStart.toISOString())
        .lt('created_at', subscription.currentPeriodEnd.toISOString())
        .eq('success', true)

    if (error) {
        console.error('Error fetching usage:', error)
        return null
    }

    const enhancementsUsed = count || 0
    const enhancementsLimit = subscription.limits.enhancementsPerPeriod

    return {
        enhancementsUsed,
        enhancementsLimit,
        percentageUsed: enhancementsLimit === Infinity ? 0 : (enhancementsUsed / enhancementsLimit) * 100,
        resetDate: subscription.currentPeriodEnd,
    }
}

/**
 * Check if user can make an enhancement request
 */
export async function canMakeEnhancement(userId: string): Promise<{
    allowed: boolean
    reason?: string
}> {
    const subscription = await getUserSubscription(userId)

    if (!subscription) {
        return {
            allowed: false,
            reason: 'NO_SUBSCRIPTION',
        }
    }

    if (subscription.status !== SubscriptionStatus.ACTIVE && subscription.status !== SubscriptionStatus.TRIAL) {
        return {
            allowed: false,
            reason: 'SUBSCRIPTION_INACTIVE',
        }
    }

    const usage = await getUsageInfo(userId)
    if (!usage) {
        return {
            allowed: false,
            reason: 'USAGE_INFO_UNAVAILABLE',
        }
    }

    if (usage.enhancementsUsed >= usage.enhancementsLimit) {
        return {
            allowed: false,
            reason: 'USAGE_LIMIT_EXCEEDED',
        }
    }

    return {
        allowed: true,
    }
}

/**
 * Create a trial subscription for a new user
 */
export async function createTrialSubscription(userId: string): Promise<void> {
    const supabase = await createClient()

    const now = new Date()
    const trialEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days

    await supabase.from('subscriptions').insert({
        user_id: userId,
        lemon_squeezy_id: `trial_${userId}`,
        status: SubscriptionStatus.TRIAL,
        tier: SubscriptionTier.TRIAL,
        current_period_start: now.toISOString(),
        current_period_end: trialEnd.toISOString(),
    })
}

/**
 * Validate subscription tier has access to a feature
 */
export function hasFeatureAccess(
    tier: SubscriptionTier,
    feature: keyof typeof SUBSCRIPTION_LIMITS[SubscriptionTier.TRIAL]['features']
): boolean {
    return SUBSCRIPTION_LIMITS[tier].features[feature]
}
