import { SubscriptionTier } from '@/lib/subscription/types'

export const LEMONSQUEEZY_CONFIG = {
    storeId: process.env.LEMONSQUEEZY_STORE_ID!,
    webhookSecret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET!,
    apiKey: process.env.LEMONSQUEEZY_API_KEY!,
}

export function getVariantId(tier: SubscriptionTier): string | undefined {
    switch (tier) {
        case 'lifetime_launch':
            return process.env.LEMONSQUEEZY_LIFETIME_LAUNCH_VARIANT_ID
        case 'basic_monthly':
            return process.env.LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID
        case 'pro_monthly':
            return process.env.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID
        case 'business_monthly':
            return process.env.LEMONSQUEEZY_BUSINESS_MONTHLY_VARIANT_ID
        case 'basic_annual':
            return process.env.LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID
        case 'pro_annual':
            return process.env.LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID
        case 'business_annual':
            return process.env.LEMONSQUEEZY_BUSINESS_ANNUAL_VARIANT_ID
        default:
            return undefined
    }
}
