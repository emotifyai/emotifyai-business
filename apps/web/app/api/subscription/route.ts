import { NextRequest, NextResponse } from 'next/server'
import {
  getTierLabelsAr,
  getTierPriorityMap,
  REGISTERED_FREE_CREDIT_TOTAL,
  RUNTIME_SUBSCRIPTION_DEFAULTS,
} from '@emotifyai/config/pricing'
import { isBundleSubscriptionTier } from '@/lib/billing/tier-labels'
import { createClient } from '@/lib/supabase/server'
import { SubscriptionTier, SubscriptionStatus } from '@/types/database'

/**
 * GET /api/subscription
 * 
 * Returns the current user's subscription information
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        
        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
            return NextResponse.json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'يرجى تسجيل الدخول'
                }
            }, { status: 401 })
        }

        // Get user's subscriptions (all of them) and select the best one
        const { data: subscriptions, error: subscriptionError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .in('status', [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL])
            .order('created_at', { ascending: false })

        if (subscriptionError) {
            throw subscriptionError
        }

        // If no active subscriptions found, return default free plan
        if (!subscriptions || subscriptions.length === 0) {
            const empty = RUNTIME_SUBSCRIPTION_DEFAULTS.apiSubscriptionEmpty
            const periodEnd = empty.validityDays
                ? new Date(Date.now() + empty.validityDays * 24 * 60 * 60 * 1000).toISOString()
                : null
            return NextResponse.json({
                success: true,
                data: {
                    tier: SubscriptionTier.FREE,
                    status: SubscriptionStatus.ACTIVE,
                    credits_limit: REGISTERED_FREE_CREDIT_TOTAL,
                    credits_used: 0,
                    credits_remaining: REGISTERED_FREE_CREDIT_TOTAL,
                    credits_reset_date: null,
                    validity_days: empty.validityDays,
                    tier_name: 'مسجل',
                    current_period_end: periodEnd,
                    bundles: [],
                },
            })
        }

        const tierPriority = getTierPriorityMap()

        // Select the best subscription (highest priority, then latest)
        // @ts-ignore - Safe to ignore as we know subscriptions array is not empty at this point
        const bestSubscription = subscriptions.reduce((best, current) => {
            // @ts-ignore - Safe to ignore as we know these objects have tier property from database
            const currentPriority = tierPriority[current.tier] || 0
            // @ts-ignore - Safe to ignore as we know these objects have tier property from database
            const bestPriority = tierPriority[best.tier] || 0
            
            if (currentPriority > bestPriority) {
                return current
            } else if (currentPriority === bestPriority) {
                // Same priority, choose the latest one
                // @ts-ignore - Safe to ignore as we know these objects have created_at property from database
                return new Date(current.created_at) > new Date(best.created_at) ? current : best
            }
            return best
        })

        const subscription = bestSubscription

        // Calculate remaining credits
        const creditsRemaining = Math.max(0, (subscription as any).credits_limit - (subscription as any).credits_used)

        const tierNames = getTierLabelsAr()
        const primaryTier = (subscription as any).tier as SubscriptionTier

        const bundleRows = subscriptions
            .filter(
                (s: { tier: string; status: string }) =>
                    isBundleSubscriptionTier(s.tier) && s.status === 'active'
            )
            .map((s: { tier: string; credits_limit: number; credits_used: number }) => ({
                tier: s.tier,
                credits_limit: s.credits_limit,
                credits_used: s.credits_used,
                credits_remaining: Math.max(0, s.credits_limit - s.credits_used),
                label_ar: tierNames[s.tier as SubscriptionTier] ?? s.tier,
            }))

        console.log('[DUCK subscription] user', user.id, {
            primaryTier,
            bundleCount: bundleRows.length,
        })

        return NextResponse.json({
            success: true,
            data: {
                tier: primaryTier,
                status: (subscription as any).status,
                credits_limit: (subscription as any).credits_limit,
                credits_used: (subscription as any).credits_used,
                credits_remaining: creditsRemaining,
                credits_reset_date: (subscription as any).credits_reset_date,
                validity_days: (subscription as any).validity_days,
                tier_name: tierNames[primaryTier] || (subscription as any).tier_name || 'خطة غير معروفة',
                current_period_end: (subscription as any).current_period_end,
                bundles: bundleRows,
            }
        })

    } catch (error) {
        console.error('Subscription API error:', error)
        return NextResponse.json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to fetch subscription data'
            }
        }, { status: 500 })
    }
}
