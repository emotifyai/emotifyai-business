import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSubscription } from '@lemonsqueezy/lemonsqueezy.js'
import { configureLemonSqueezy } from '@/lib/lemonsqueezy/client'

configureLemonSqueezy()

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get user's active subscription
        const { data: subscription, error: subError } = await supabase
            .from('subscriptions')
            .select('lemon_squeezy_id')
            .eq('user_id', user.id)
            .in('status', ['active', 'past_due', 'paused'])
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (subError || !subscription) {
            return NextResponse.json(
                { error: 'No active subscription found' },
                { status: 404 }
            )
        }

        // Get subscription details from Lemon Squeezy to get the portal URL
        const { data: lsSubscription, error: lsError } = await getSubscription((subscription as any).lemon_squeezy_id)

        if (lsError || !lsSubscription) {
            console.error('Lemon Squeezy error:', lsError)
            return NextResponse.json(
                { error: 'Failed to fetch subscription details' },
                { status: 500 }
            )
        }

        const portalUrl = lsSubscription.data.attributes.urls.customer_portal

        return NextResponse.json({ url: portalUrl })

    } catch (error) {
        console.error('Billing portal error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
