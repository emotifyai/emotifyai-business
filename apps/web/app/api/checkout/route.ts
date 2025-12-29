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
        // LOUD DUCK ENV CHECK
        const envToCheck = {
            'LEMONSQUEEZY_API_KEY': !!process.env.LEMONSQUEEZY_API_KEY,
            'LEMONSQUEEZY_STORE_ID': !!process.env.LEMONSQUEEZY_STORE_ID,
            'LEMONSQUEEZY_WEBHOOK_SECRET': !!process.env.LEMONSQUEEZY_WEBHOOK_SECRET,
            'NEXT_PUBLIC_APP_URL': !!process.env.NEXT_PUBLIC_APP_URL,
            'LEMONSQUEEZY_LIFETIME_LAUNCH_VARIANT_ID': !!process.env.LEMONSQUEEZY_LIFETIME_LAUNCH_VARIANT_ID
        }
        const missing = Object.entries(envToCheck).filter(([_, exists]) => !exists).map(([key]) => key)

        if (missing.length > 0) {
            return NextResponse.json(
                {
                    error: 'Missing Configuration',
                    missing,
                },
                { status: 500 }
            )
        }
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
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
            return NextResponse.json(
                {
                    error: 'Lemon Squeezy Failed',
                    details: checkout.error,
                },
                { status: 500 }
            )
        }
        return NextResponse.json({
            url: checkout.data.data.attributes.url,
        })

    } catch (error) {
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Internal server error',
                stack: error instanceof Error ? error.stack : undefined
            },
            { status: 500 }
        )
    } finally {
    }
}
