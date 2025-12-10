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
        enhancementsPerPeriod: 50,
        rateLimit: 5,
        features: {
            apiAccess: false,
            prioritySupport: false,
            advancedModes: false,
        },
    },
    [SubscriptionTier.FREE]: {
        enhancementsPerPeriod: 50,
        rateLimit: 5,
        features: {
            apiAccess: false,
            prioritySupport: false,
            advancedModes: false,
        },
    },
    [SubscriptionTier.LIFETIME_LAUNCH]: {
        enhancementsPerPeriod: 500,
        rateLimit: 20,
        features: {
            apiAccess: true,
            prioritySupport: true,
            advancedModes: true,
        },
    },
    [SubscriptionTier.BASIC_MONTHLY]: {
        enhancementsPerPeriod: 350,
        rateLimit: 10,
        features: {
            apiAccess: true,
            prioritySupport: false,
            advancedModes: true,
        },
    },
    [SubscriptionTier.PRO_MONTHLY]: {
        enhancementsPerPeriod: 700,
        rateLimit: 15,
        features: {
            apiAccess: true,
            prioritySupport: true,
            advancedModes: true,
        },
    },
    [SubscriptionTier.BUSINESS_MONTHLY]: {
        enhancementsPerPeriod: 1500,
        rateLimit: 20,
        features: {
            apiAccess: true,
            prioritySupport: true,
            advancedModes: true,
        },
    },
    [SubscriptionTier.BASIC_ANNUAL]: {
        enhancementsPerPeriod: 350,
        rateLimit: 10,
        features: {
            apiAccess: true,
            prioritySupport: false,
            advancedModes: true,
        },
    },
    [SubscriptionTier.PRO_ANNUAL]: {
        enhancementsPerPeriod: 700,
        rateLimit: 15,
        features: {
            apiAccess: true,
            prioritySupport: true,
            advancedModes: true,
        },
    },
    [SubscriptionTier.BUSINESS_ANNUAL]: {
        enhancementsPerPeriod: 1500,
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