import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSubscriptionCheckout } from '@/lib/lemonsqueezy/checkout'
import { getVariantId } from '@/lib/lemonsqueezy/config'
import { z } from 'zod'
import { SubscriptionTier } from '@/lib/subscription/types'

const CHECKOUT_TIERS = [
    'lifetime_launch',
    'basic_monthly',
    'pro_monthly',
    'business_monthly',
    'basic_annual',
    'pro_annual',
    'business_annual',
    'small_bundle',
    'large_bundle',
] as const

const CheckoutSchema = z.object({
    tier: z.enum(CHECKOUT_TIERS),
    redirectUrl: z.string().url().optional(),
})

export async function POST(request: NextRequest) {
    try {
        const coreEnv = {
            LEMONSQUEEZY_API_KEY: !!process.env.LEMONSQUEEZY_API_KEY,
            LEMONSQUEEZY_STORE_ID: !!process.env.LEMONSQUEEZY_STORE_ID,
            NEXT_PUBLIC_APP_URL: !!process.env.NEXT_PUBLIC_APP_URL,
        }
        const missingCore = Object.entries(coreEnv)
            .filter(([, exists]) => !exists)
            .map(([key]) => key)

        if (missingCore.length > 0) {
            return NextResponse.json(
                { error: 'Missing Configuration', missing: missingCore },
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

        if (!getVariantId(tier)) {
            return NextResponse.json(
                {
                    error: 'Missing Configuration',
                    missing: [`LEMONSQUEEZY variant for tier: ${tier}`],
                },
                { status: 500 }
            )
        }

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
