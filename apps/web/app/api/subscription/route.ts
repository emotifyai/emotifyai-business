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

        // Get user's subscription
        const { data: subscription, error: subscriptionError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (subscriptionError) {
            // If no subscription found, return default free plan
            if (subscriptionError.code === 'PGRST116') {
                return NextResponse.json({
                    success: true,
                    data: {
                        tier: SubscriptionTier.FREE,
                        status: SubscriptionStatus.ACTIVE,
                        credits_limit: 50,
                        credits_used: 0,
                        credits_remaining: 50,
                        credits_reset_date: null,
                        validity_days: 10,
                        tier_name: 'Free Plan'
                    }
                })
            }
            
            throw subscriptionError
        }

        // Calculate remaining credits
        const creditsRemaining = Math.max(0, subscription.credits_limit - subscription.credits_used)

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
                tier: subscription.tier,
                status: subscription.status,
                credits_limit: subscription.credits_limit,
                credits_used: subscription.credits_used,
                credits_remaining: creditsRemaining,
                credits_reset_date: subscription.credits_reset_date,
                validity_days: subscription.validity_days,
                tier_name: tierNames[subscription.tier] || subscription.tier_name || 'Unknown Plan'
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