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
    console.log('🦆 DUCK: [Checkout API] === START REQUEST ===')
    try {
        // LOUD DUCK ENV CHECK
        const envToCheck = {
            'LEMONSQUEEZY_API_KEY': !!process.env.LEMONSQUEEZY_API_KEY,
            'LEMONSQUEEZY_STORE_ID': !!process.env.LEMONSQUEEZY_STORE_ID,
            'LEMONSQUEEZY_WEBHOOK_SECRET': !!process.env.LEMONSQUEEZY_WEBHOOK_SECRET,
            'NEXT_PUBLIC_APP_URL': !!process.env.NEXT_PUBLIC_APP_URL,
            'LEMONSQUEEZY_LIFETIME_LAUNCH_VARIANT_ID': !!process.env.LEMONSQUEEZY_LIFETIME_LAUNCH_VARIANT_ID
        }

        console.log('🦆 DUCK: [Checkout API] Environment Check:', JSON.stringify(envToCheck, null, 2))

        const missing = Object.entries(envToCheck).filter(([_, exists]) => !exists).map(([key]) => key)

        if (missing.length > 0) {
            console.error('🦆 DUCK: [Checkout API] ❌ MISSING CONFIG:', missing)
            return NextResponse.json(
                {
                    error: 'Missing Configuration',
                    missing,
                    duck: '🦆 QUACK! Config is missing!'
                },
                { status: 500 }
            )
        }

        console.log('🦆 DUCK: [Checkout API] Initializing Supabase...')
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            console.error('🦆 DUCK: [Checkout API] ❌ AUTH ERROR:', authError)
            return NextResponse.json(
                { error: 'Unauthorized', duck: '🦆 QUACK! Who are you?' },
                { status: 401 }
            )
        }

        console.log('🦆 DUCK: [Checkout API] ✅ User:', user.email)

        const body = await request.json()
        console.log('🦆 DUCK: [Checkout API] Request body:', JSON.stringify(body))

        const { tier, redirectUrl } = CheckoutSchema.parse(body)
        console.log(`🦆 DUCK: [Checkout API] Creating checkout for tier: ${tier}`)

        console.log('🦆 DUCK: [Checkout API] Calling createSubscriptionCheckout...')
        const checkout = await createSubscriptionCheckout({
            tier: tier as SubscriptionTier,
            userEmail: user.email!,
            userId: user.id,
            redirectUrl,
        })

        if (!checkout.data) {
            console.error('🦆 DUCK: [Checkout API] ❌ LEMON SQUEEZY ERROR:', checkout.error)
            return NextResponse.json(
                {
                    error: 'Lemon Squeezy Failed',
                    details: checkout.error,
                    duck: '🦆 QUACK! Lemon Squeezy is angry!'
                },
                { status: 500 }
            )
        }

        console.log('🦆 DUCK: [Checkout API] ✅ SUCCESS! URL:', checkout.data.data.attributes.url)
        return NextResponse.json({
            url: checkout.data.data.attributes.url,
        })

    } catch (error) {
        console.error('🦆 DUCK: [Checkout API] 💥 EXPLOSION:', error)
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Internal server error',
                duck: '🦆 QUACK! Something exploded!',
                stack: error instanceof Error ? error.stack : undefined
            },
            { status: 500 }
        )
    } finally {
        console.log('🦆 DUCK: [Checkout API] === END REQUEST ===')
    }
}
