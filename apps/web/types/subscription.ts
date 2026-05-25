import { TIER_DEFINITIONS, SUBSCRIPTION_TIER_IDS } from '@emotifyai/config/pricing'
import { SubscriptionStatus, SubscriptionTier } from './database'

// =============================================================================
// SUBSCRIPTION TYPES
// =============================================================================

export interface SubscriptionLimits {
  enhancementsPerPeriod: number
  rateLimit: number
  features: {
    advancedFeatures: boolean
    prioritySupport: boolean
    fastProcessing: boolean
  }
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> =
  Object.fromEntries(
    SUBSCRIPTION_TIER_IDS.map((id) => [
      id as SubscriptionTier,
      {
        enhancementsPerPeriod: TIER_DEFINITIONS[id].credits,
        rateLimit: TIER_DEFINITIONS[id].rateLimitRpm,
        features: TIER_DEFINITIONS[id].features,
      },
    ])
  ) as Record<SubscriptionTier, SubscriptionLimits>

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
