import { NextRequest, NextResponse } from 'next/server'
import {
  getTierLabelsAr,
  RUNTIME_SUBSCRIPTION_DEFAULTS,
} from '@emotifyai/config/pricing'
import { createClient } from '@supabase/supabase-js'
import { SubscriptionTier, SubscriptionStatus } from '@/types/database'

/**
 * GET /api/extension/subscription
 * 
 * Extension-specific endpoint that accepts Bearer token authentication
 * Returns the current user's subscription information
 */
export async function GET(request: NextRequest) {
    try {
        // Get Bearer token from Authorization header
        const authHeader = request.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Bearer token required'
                }
            }, { status: 401 })
        }

        const token = authHeader.substring(7) // Remove 'Bearer ' prefix
        // Create Supabase client with the provided token
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        })
        
        // Verify the token by getting the user
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)
        if (authError || !user) {
            return NextResponse.json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Invalid or expired token'
                }
            }, { status: 401 })
        }
        // Get user's most recent active subscription
        const { data: subscription, error: subscriptionError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .in('status', ['active', 'trial'])
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
        if (subscriptionError) {
            // If no subscription found, return default trial plan
            if (subscriptionError.code === 'PGRST116') {
                const fallback = RUNTIME_SUBSCRIPTION_DEFAULTS.apiExtensionEmpty
                const now = new Date()
                const endDate = new Date(
                  Date.now() + fallback.validityDays * 24 * 60 * 60 * 1000
                )

                return NextResponse.json({
                    success: true,
                    data: {
                        tier: SubscriptionTier.TRIAL,
                        status: SubscriptionStatus.ACTIVE,
                        startDate: now.toISOString(),
                        endDate: endDate.toISOString(),
                        usageLimit: fallback.credits,
                        currentUsage: 0,
                        resetDate: null,
                        credits_limit: fallback.credits,
                        credits_used: 0,
                        credits_remaining: fallback.credits,
                        credits_reset_date: null,
                        validity_days: fallback.validityDays,
                        tier_name: 'تجربة',
                        current_period_end: endDate.toISOString(),
                    },
                })
            }
            
            throw subscriptionError
        }

        // Calculate remaining credits
        const creditsRemaining = Math.max(0, subscription.credits_limit - subscription.credits_used)

        const tierNames = getTierLabelsAr()

        // Ensure dates are valid ISO strings
        const now = new Date()
        const startDate = subscription.current_period_start 
            ? new Date(subscription.current_period_start).toISOString()
            : now.toISOString()
        
        const endDate = subscription.current_period_end 
            ? new Date(subscription.current_period_end).toISOString()
            : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
        
        const resetDate = subscription.credits_reset_date 
            ? new Date(subscription.credits_reset_date).toISOString()
            : null

        return NextResponse.json({
            success: true,
            data: {
                tier: subscription.tier,
                status: subscription.status,
                startDate: startDate,
                endDate: endDate,
                usageLimit: subscription.credits_limit,
                currentUsage: subscription.credits_used,
                resetDate: resetDate,
                // Legacy fields for backward compatibility
                credits_limit: subscription.credits_limit,
                credits_used: subscription.credits_used,
                credits_remaining: creditsRemaining,
                credits_reset_date: resetDate,
                validity_days: subscription.validity_days,
                tier_name: tierNames[subscription.tier as SubscriptionTier] || subscription.tier_name || 'خطة غير معروفة',
                current_period_end: endDate
            }
        })

    } catch (error) {
        console.error('Extension subscription API error:', error)
        return NextResponse.json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to fetch subscription data'
            }
        }, { status: 500 })
    }
}