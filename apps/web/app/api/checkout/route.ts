import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSubscriptionCheckout } from '@/lib/lemonsqueezy/checkout'
import { z } from 'zod'
import { SubscriptionTier } from '@/lib/subscription/types'

const CheckoutSchema = z.object({
    tier: z.string().refine((val) => {
        return [
            'lifetime_launch',
            'basic_monthly',
            'pro_monthly',
            'business_monthly',
            'basic_annual',
            'pro_annual',
            'business_annual',
        ].includes(val)
    }, 'Invalid subscription tier'),
    redirectUrl: z.string().url().optional(),
})

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

        const body = await request.json()
        const { tier, redirectUrl } = CheckoutSchema.parse(body)

        const checkout = await createSubscriptionCheckout({
            tier: tier as SubscriptionTier,
            userEmail: user.email!,
            userId: user.id,
            redirectUrl,
        })

        if (!checkout.data) {
            console.error('Failed to create checkout:', checkout.error)
            return NextResponse.json(
                { error: 'Failed to create checkout session' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            url: checkout.data.data.attributes.url,
        })

    } catch (error) {
        console.error('Checkout error:', error)
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.issues },
                { status: 400 }
            )
        }
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        )
    }
}
