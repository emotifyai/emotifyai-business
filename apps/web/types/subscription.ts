import { SubscriptionStatus, SubscriptionTier } from './database'

// =============================================================================
// SUBSCRIPTION TYPES
// =============================================================================

export interface SubscriptionLimits {
    enhancementsPerPeriod: number
    rateLimit: number // requests per minute
    features: {
        advancedFeatures: boolean
        prioritySupport: boolean
        fastProcessing: boolean
    }
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
    [SubscriptionTier.TRIAL]: {
        enhancementsPerPeriod: 10,
        rateLimit: 5,
        features: {
            advancedFeatures: false,
            prioritySupport: false,
            fastProcessing: true,
        },
    },
    [SubscriptionTier.FREE]: {
        enhancementsPerPeriod: 10,
        rateLimit: 5,
        features: {
            advancedFeatures: false,
            prioritySupport: false,
            fastProcessing: true,
        },
    },
    [SubscriptionTier.LIFETIME_LAUNCH]: {
        enhancementsPerPeriod: 1000,
        rateLimit: 20,
        features: {
            advancedFeatures: true,
            prioritySupport: true,
            fastProcessing: true,
        },
    },
    [SubscriptionTier.BASIC_MONTHLY]: {
        enhancementsPerPeriod: 350,
        rateLimit: 10,
        features: {
            advancedFeatures: false,
            prioritySupport: false,
            fastProcessing: true,
        },
    },
    [SubscriptionTier.PRO_MONTHLY]: {
        enhancementsPerPeriod: 700,
        rateLimit: 15,
        features: {
            advancedFeatures: true,
            prioritySupport: true,
            fastProcessing: true,
        },
    },
    [SubscriptionTier.BUSINESS_MONTHLY]: {
        enhancementsPerPeriod: 1500,
        rateLimit: 20,
        features: {
            advancedFeatures: true,
            prioritySupport: true,
            fastProcessing: true,
        },
    },
    [SubscriptionTier.BASIC_ANNUAL]: {
        enhancementsPerPeriod: 350,
        rateLimit: 10,
        features: {
            advancedFeatures: false,
            prioritySupport: false,
            fastProcessing: true,
        },
    },
    [SubscriptionTier.PRO_ANNUAL]: {
        enhancementsPerPeriod: 700,
        rateLimit: 15,
        features: {
            advancedFeatures: true,
            prioritySupport: true,
            fastProcessing: true,
        },
    },
    [SubscriptionTier.BUSINESS_ANNUAL]: {
        enhancementsPerPeriod: 1500,
        rateLimit: 20,
        features: {
            advancedFeatures: true,
            prioritySupport: true,
            fastProcessing: true,
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
