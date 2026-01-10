import { NextRequest, NextResponse } from 'next/server'
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
                    message: 'Authentication required'
                }
            }, { status: 401 })
        }

        // Get user's subscriptions (all of them) and select the best one
        const { data: subscriptions, error: subscriptionError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .in('status', ['active', 'trial'])
            .order('created_at', { ascending: false })

        if (subscriptionError) {
            throw subscriptionError
        }

        // If no active subscriptions found, return default free plan
        if (!subscriptions || subscriptions.length === 0) {
            return NextResponse.json({
                success: true,
                data: {
                    tier: SubscriptionTier.FREE,
                    status: SubscriptionStatus.TRIAL,
                    credits_limit: 10,
                    credits_used: 0,
                    credits_remaining: 10,
                    credits_reset_date: null,
                    validity_days: 10,
                    tier_name: 'Free Trial',
                    current_period_end: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
                }
            })
        }

        // Define subscription tier priority (higher number = higher priority)
        const tierPriority: Record<string, number> = {
            'free': 1,
            'trial': 2,
            'basic_monthly': 3,
            'basic_annual': 4,
            'pro_monthly': 5,
            'pro_annual': 6,
            'business_monthly': 7,
            'business_annual': 8,
            'lifetime_launch': 10, // Highest priority
        }

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

        // Format tier name for display
        const tierNames: Record<SubscriptionTier, string> = {
            [SubscriptionTier.TRIAL]: 'Trial',
            [SubscriptionTier.FREE]: 'Free Plan',
            [SubscriptionTier.LIFETIME_LAUNCH]: 'Lifetime Launch',
            [SubscriptionTier.BASIC_MONTHLY]: 'Basic Monthly',
            [SubscriptionTier.PRO_MONTHLY]: 'Pro Monthly',
            [SubscriptionTier.BUSINESS_MONTHLY]: 'Business Monthly',
            [SubscriptionTier.BASIC_ANNUAL]: 'Basic Annual',
            [SubscriptionTier.PRO_ANNUAL]: 'Pro Annual',
            [SubscriptionTier.BUSINESS_ANNUAL]: 'Business Annual',
        }

        return NextResponse.json({
            success: true,
            data: {
                tier: (subscription as any).tier,
                status: (subscription as any).status,
                credits_limit: (subscription as any).credits_limit,
                credits_used: (subscription as any).credits_used,
                credits_remaining: creditsRemaining,
                credits_reset_date: (subscription as any).credits_reset_date,
                validity_days: (subscription as any).validity_days,
                tier_name: tierNames[(subscription as any).tier as SubscriptionTier] || (subscription as any).tier_name || 'Unknown Plan',
                current_period_end: (subscription as any).current_period_end
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
