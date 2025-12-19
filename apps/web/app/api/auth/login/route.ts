import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { ProfileInsert } from '@/types/database'

const LoginSchema = z.object({
    token: z.string().min(1, 'OAuth token is required'),
})

/**
 * POST /api/auth/login
 * Authenticates extension users with OAuth token
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { token } = LoginSchema.parse(body)

        const supabase = await createClient()

        // Exchange OAuth token for Supabase session
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Invalid authentication token' },
                { status: 401 }
            )
        }

        // Get or create user profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error fetching profile:', profileError)
            return NextResponse.json(
                { error: 'Failed to fetch user profile' },
                { status: 500 }
            )
        }

        // Create profile if it doesn't exist
        if (!profile) {
            const profileData: ProfileInsert = {
                id: user.id,
                email: user.email!,
                display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                avatar_url: user.user_metadata?.avatar_url || null,
            }
            
            const { data: newProfile, error: createError } = await (supabase
                .from('profiles') as any)
                .insert(profileData)
                .select()
                .single()

            if (createError) {
                console.error('Error creating profile:', createError)
                return NextResponse.json(
                    { error: 'Failed to create user profile' },
                    { status: 500 }
                )
            }
        }

        // Get subscription details
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .single()

        // If no subscription, create trial
        if (!subscription) {
            const { data: newSubscription, error: subError } = await (supabase
                .from('subscriptions') as any)
                .insert({
                    user_id: user.id,
                    lemon_squeezy_id: `trial-${user.id}`,
                    tier: 'trial',
                    status: 'active',
                    current_period_start: new Date().toISOString(),
                    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                })
                .select()
                .single()

            if (subError) {
                console.error('Error creating subscription:', subError)
            }

            return NextResponse.json({
                token,
                user: {
                    id: user.id,
                    email: user.email!,
                    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                    avatar: user.user_metadata?.avatar_url || null,
                },
                subscription: newSubscription || {
                    tier: 'trial',
                    status: 'active',
                    usage: 0,
                    limit: 10,
                },
            })
        }

        // Get usage count
        const { count: usageCount } = await (supabase
            .from('usage_logs') as any)
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', (subscription as any).current_period_start)

        return NextResponse.json({
            token,
            user: {
                id: user.id,
                email: user.email!,
                name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                avatar: user.user_metadata?.avatar_url || null,
            },
            subscription: {
                tier: (subscription as any).tier,
                status: (subscription as any).status,
                usage: usageCount || 0,
                limit: (subscription as any).tier === 'trial' ? 10 : -1,
            },
        })
    } catch (error) {
        console.error('Login error:', error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.errors },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
