import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js'
import { getVariantId, LEMONSQUEEZY_CONFIG } from './config'
import { SubscriptionTier } from '@/lib/subscription/types'
import { configureLemonSqueezy } from './client'
import { buildCheckoutThankYouUrl } from '@/lib/checkout/thank-you-redirect'

// Ensure Lemon Squeezy is initialized
configureLemonSqueezy()

interface CreateCheckoutOptions {
    tier: SubscriptionTier
    userEmail: string
    userId: string
    redirectUrl?: string
}

export async function createSubscriptionCheckout({
    tier,
    userEmail,
    userId,
    redirectUrl,
}: CreateCheckoutOptions) {
    const variantId = getVariantId(tier)

    if (!variantId) {
        throw new Error(`No variant ID found for tier: ${tier}`)
    }

    const checkout = await createCheckout(
        LEMONSQUEEZY_CONFIG.storeId,
        variantId,
        {
            checkoutOptions: {
                embed: true,
                media: false,
                logo: true,
            },
            checkoutData: {
                email: userEmail,
                custom: {
                    user_id: userId,
                    tier,
                },
            },
            productOptions: {
                enabledVariants: [parseInt(variantId)],
                redirectUrl:
                    redirectUrl ||
                    buildCheckoutThankYouUrl(
                        process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
                        tier
                    ),
                receiptButtonText: 'Go to Dashboard',
                receiptThankYouNote: 'Thank you for subscribing to EmotifyAI!',
            },
        }
    )

    return checkout
}
