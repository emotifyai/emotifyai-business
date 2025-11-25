import { SubscriptionStatus, SubscriptionTier } from './database'

// =============================================================================
// SUBSCRIPTION TYPES
// =============================================================================

export interface SubscriptionLimits {
    enhancementsPerPeriod: number
    rateLimit: number // requests per minute
    features: {
        apiAccess: boolean
        prioritySupport: boolean
        advancedModes: boolean
    }
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
    [SubscriptionTier.TRIAL]: {
        enhancementsPerPeriod: 10,
        rateLimit: 5,
        features: {
            apiAccess: false,
            prioritySupport: false,
            advancedModes: false,
        },
    },
    [SubscriptionTier.MONTHLY]: {
        enhancementsPerPeriod: 1000,
        rateLimit: 10,
        features: {
            apiAccess: true,
            prioritySupport: false,
            advancedModes: true,
        },
    },
    [SubscriptionTier.LIFETIME]: {
        enhancementsPerPeriod: Infinity,
        rateLimit: 20,
        features: {
            apiAccess: true,
            prioritySupport: true,
            advancedModes: true,
        },
    },
}

export interface SubscriptionInfo {
    tier: SubscriptionTier
    status: SubscriptionStatus
    currentPeriodStart: Date
    currentPeriodEnd: Date
    cancelAt: Date | null
    limits: SubscriptionLimits
}

export interface UsageInfo {
    enhancementsUsed: number
    enhancementsLimit: number
    percentageUsed: number
    resetDate: Date
}

// =============================================================================
// PRICING
// =============================================================================

export interface PricingTier {
    tier: SubscriptionTier
    name: string
    description: string
    price: {
        amount: number
        currency: string
        interval?: 'month' | 'lifetime'
    }
    features: string[]
    highlighted?: boolean
    variantId: string
}

export const PRICING_TIERS: PricingTier[] = [
    {
        tier: SubscriptionTier.TRIAL,
        name: 'Trial',
        description: 'Try Verba for free',
        price: {
            amount: 0,
            currency: 'USD',
        },
        features: [
            '10 AI enhancements',
            'Basic enhancement modes',
            'English, Arabic, French support',
            'Browser extension access',
        ],
        variantId: '', // No variant for trial
    },
    {
        tier: SubscriptionTier.MONTHLY,
        name: 'Monthly',
        description: 'Perfect for regular users',
        price: {
            amount: 9.99,
            currency: 'USD',
            interval: 'month',
        },
        features: [
            '1,000 enhancements per month',
            'All enhancement modes',
            'API access',
            'Priority processing',
            'Email support',
        ],
        highlighted: true,
        variantId: process.env.LEMONSQUEEZY_MONTHLY_VARIANT_ID || '',
    },
    {
        tier: SubscriptionTier.LIFETIME,
        name: 'Lifetime',
        description: 'One-time payment, forever access',
        price: {
            amount: 99.99,
            currency: 'USD',
            interval: 'lifetime',
        },
        features: [
            'Unlimited enhancements',
            'All enhancement modes',
            'API access',
            'Priority support',
            'Early access to new features',
            'Lifetime updates',
        ],
        variantId: process.env.LEMONSQUEEZY_LIFETIME_VARIANT_ID || '',
    },
]
