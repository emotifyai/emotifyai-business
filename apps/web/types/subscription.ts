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