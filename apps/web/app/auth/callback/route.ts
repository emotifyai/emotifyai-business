import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    // The `/auth/callback` route is required for the server-side auth flow implemented
    // by the SSR package. It exchanges an auth code for the user's session.
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const origin = requestUrl.origin
    const redirectTo = requestUrl.searchParams.get('redirect_to')?.toString()
    const source = requestUrl.searchParams.get('source')?.toString()
    const plan = requestUrl.searchParams.get('plan')?.toString()

    if (code) {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        // Ensure all authenticated users have proper setup (web app AND extension)
        if (data.user && !error) {
            try {
                // Check if user profile exists, create if not
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('id', data.user.id)
                    .single()

                if (!profile) {
                    console.log(`Creating profile for new user: ${data.user.email}`)

                    // Create user profile
                    const { error: profileError } = await (supabase.from('profiles') as any).insert({
                        id: data.user.id,
                        email: data.user.email!,
                        display_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
                        avatar_url: data.user.user_metadata?.avatar_url || null,
                    })

                    if (profileError) {
                        console.error('Error creating profile:', profileError)
                    }
                }

                // Check if user has subscription, create trial if not
                const { data: subscription } = await supabase
                    .from('subscriptions')
                    .select('id')
                    .eq('user_id', data.user.id)
                    .single()

                if (!subscription) {
                    console.log(`Creating trial subscription for new user: ${data.user.email}`)

                    // Create trial subscription for all new users
                    const trialDays = parseInt(process.env.TRIAL_ENHANCEMENT_LIMIT || '10')
                    const trialEndDate = new Date()
                    trialEndDate.setDate(trialEndDate.getDate() + trialDays)

                    const { error: subError } = await (supabase.from('subscriptions') as any).insert({
                        user_id: data.user.id,
                        lemon_squeezy_id: `free_${data.user.id}_${Date.now()}`,
                        tier: 'free',
                        tier_name: 'free',
                        status: 'trial',
                        credits_limit: parseInt(process.env.TRIAL_ENHANCEMENT_LIMIT || '10'),
                        credits_used: 0,
                        validity_days: trialDays,
                        current_period_start: new Date().toISOString(),
                        current_period_end: trialEndDate.toISOString(),
                    })

                    if (subError) {
                        console.error('Error creating subscription:', subError)
                    }
                }
            } catch (err) {
                console.error('Error setting up new user:', err)
                // Continue with redirect even if setup fails
            }
        }
    }


    if (redirectTo) {
        return NextResponse.redirect(`${origin}${redirectTo}`)
    }

    // Default redirect based on source
    if (source === 'extension') {
        return NextResponse.redirect(`${origin}/auth/extension-success`)
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(`${origin}/dashboard`)
}
