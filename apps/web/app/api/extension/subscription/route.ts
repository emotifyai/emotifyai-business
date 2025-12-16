import { NextRequest, NextResponse } from 'next/server'
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
        console.log('🦆 DUCK: Extension subscription API called');
        
        // Get Bearer token from Authorization header
        const authHeader = request.headers.get('Authorization')
        console.log('🦆 DUCK: Authorization header:', authHeader ? 'present' : 'missing');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('🦆 DUCK: ❌ No Bearer token in request');
            return NextResponse.json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Bearer token required'
                }
            }, { status: 401 })
        }

        const token = authHeader.substring(7) // Remove 'Bearer ' prefix
        console.log('🦆 DUCK: Token extracted (first 20 chars):', token.substring(0, 20) + '...');
        
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
        console.log('🦆 DUCK: Verifying token with Supabase');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)
        console.log('🦆 DUCK: Token verification result - user:', !!user, 'error:', authError);
        
        if (authError || !user) {
            console.log('🦆 DUCK: ❌ Token verification failed');
            return NextResponse.json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Invalid or expired token'
                }
            }, { status: 401 })
        }
        
        console.log('🦆 DUCK: ✅ Token verified, user ID:', user.id);

        // Get user's subscription
        const { data: subscription, error: subscriptionError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (subscriptionError) {
            // If no subscription found, return default trial plan
            if (subscriptionError.code === 'PGRST116') {
                const now = new Date()
                const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                
                return NextResponse.json({
                    success: true,
                    data: {
                        tier: SubscriptionTier.TRIAL,
                        status: SubscriptionStatus.ACTIVE,
                        startDate: now.toISOString(),
                        endDate: endDate.toISOString(),
                        usageLimit: 10,
                        currentUsage: 0,
                        resetDate: null,
                        // Legacy fields for backward compatibility
                        credits_limit: 10,
                        credits_used: 0,
                        credits_remaining: 10,
                        credits_reset_date: null,
                        validity_days: 30,
                        tier_name: 'Trial',
                        current_period_end: endDate.toISOString()
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
                startDate: subscription.current_period_start,
                endDate: subscription.current_period_end,
                usageLimit: subscription.credits_limit,
                currentUsage: subscription.credits_used,
                resetDate: subscription.credits_reset_date,
                // Legacy fields for backward compatibility
                credits_limit: subscription.credits_limit,
                credits_used: subscription.credits_used,
                credits_remaining: creditsRemaining,
                credits_reset_date: subscription.credits_reset_date,
                validity_days: subscription.validity_days,
                tier_name: tierNames[subscription.tier as SubscriptionTier] || subscription.tier_name || 'Unknown Plan',
                current_period_end: subscription.current_period_end
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