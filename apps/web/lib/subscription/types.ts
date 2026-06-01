/**
 * Subscription Tier Definitions
 *
 * Tier metadata is defined in @emotifyai/config (packages/config/src/pricing.ts).
 */

import {
  TIER_DEFINITIONS,
  SUBSCRIPTION_TIER_IDS,
  type SubscriptionTierId,
  type TierDefinition,
} from '@emotifyai/config/pricing'

export type SubscriptionTier = SubscriptionTierId

export type SubscriptionStatus =
  | 'active'
  | 'cancelled'
  | 'expired'
  | 'past_due'
  | 'paused'
  | 'trial'

export interface SubscriptionTierConfig {
  id: SubscriptionTier
  name: string
  price: number
  generations: number
  duration?: 'month' | 'year' | 'lifetime' | 'trial'
  durationDays?: number
  maxSubscribers?: number
  features: string[]
  popular?: boolean
  badge?: string
}

function billingToDuration(
  billing: TierDefinition['billing'],
  tierId: SubscriptionTierId
): SubscriptionTierConfig['duration'] {
  if (tierId === 'lifetime_launch') return 'lifetime'
  switch (billing) {
    case 'subscription_monthly':
      return 'month'
    case 'subscription_annual':
      return 'year'
    case 'one_time':
      return undefined
    case 'none':
      return undefined
    default:
      return undefined
  }
}

function tierToConfig(def: TierDefinition): SubscriptionTierConfig {
  const duration = billingToDuration(def.billing, def.id)
  const features = [
    `${def.credits} ${def.billing === 'one_time' ? 'one-time conversions' : 'generations per month'}`,
    ...Object.entries(def.features)
      .filter(([, enabled]) => enabled)
      .map(([key]) => {
        switch (key) {
          case 'prioritySupport':
            return 'Priority support'
          case 'advancedFeatures':
            return 'Advanced features'
          case 'fastProcessing':
            return 'Fast processing speed'
          default:
            return key
        }
      }),
  ]

  if (def.maxLifetimeSlots) {
    features.push(`Limited to first ${def.maxLifetimeSlots} subscribers`)
  }

  const config: SubscriptionTierConfig = {
    id: def.id,
    name: def.labelEn,
    price: def.priceUsd,
    generations: def.credits,
    duration,
    features,
  }

  if (def.validityDays != null && def.billing === 'none') {
    config.durationDays = def.validityDays
  }
  if (def.maxLifetimeSlots) {
    config.maxSubscribers = def.maxLifetimeSlots
  }
  if (def.id === 'pro_monthly') {
    config.popular = true
  }
  if (def.id === 'lifetime_launch') {
    config.popular = true
    config.badge = 'Limited Offer'
  }
  if (def.id === 'pro_annual') {
    config.badge = 'Best Value'
  }

  return config
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, SubscriptionTierConfig> =
  Object.fromEntries(
    SUBSCRIPTION_TIER_IDS.map((id) => [id, tierToConfig(TIER_DEFINITIONS[id])])
  ) as Record<SubscriptionTier, SubscriptionTierConfig>

/**
 * Subscription database model
 */
export interface Subscription {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  lemon_squeezy_id: string
  status: SubscriptionStatus
  tier: SubscriptionTier
  current_period_start: string
  current_period_end: string
  cancel_at: string | null
  trial_started_at: string | null
  trial_expires_at: string | null
  monthly_quota: number
  quota_used_this_month: number
  quota_reset_at: string | null
  cache_enabled: boolean
}

/**
 * Usage quota information
 */
export interface UsageQuota {
  quota: number
  used: number
  remaining: number
  reset_at: string | null
  percentage_used: number
}

/**
 * Lifetime slot information
 */
export interface LifetimeSlotInfo {
  total: number
  used: number
  remaining: number
  percentage: number
  available: boolean
}

export function getTierConfig(tier: SubscriptionTier): SubscriptionTierConfig {
  return SUBSCRIPTION_TIERS[tier]
}

export function isAnnualTier(tier: SubscriptionTier): boolean {
  return tier.endsWith('_annual')
}

export function isMonthlyTier(tier: SubscriptionTier): boolean {
  return tier.endsWith('_monthly')
}

export function isLifetimeTier(tier: SubscriptionTier): boolean {
  return tier === 'lifetime_launch'
}

export function isTrialTier(tier: SubscriptionTier): boolean {
  return tier === 'trial'
}

export function getMonthlyEquivalent(tier: SubscriptionTier): number {
  const config = getTierConfig(tier)
  if (isAnnualTier(tier)) {
    return Math.round(config.price / 12)
  }
  return config.price
}

export function calculateAnnualSavings(tier: SubscriptionTier): number {
  if (!isAnnualTier(tier)) return 0

  const config = getTierConfig(tier)
  const monthlyEquivalent = getMonthlyEquivalent(tier)
  const monthlyTotal = monthlyEquivalent * 12

  return monthlyTotal - config.price
}

export function isSubscriptionActive(subscription: Subscription): boolean {
  return subscription.status === 'active' || subscription.status === 'trial'
}

export function isTrialExpired(subscription: Subscription): boolean {
  if (!subscription.trial_expires_at) return false
  return new Date(subscription.trial_expires_at) <= new Date()
}

export function isQuotaExceeded(subscription: Subscription): boolean {
  return subscription.quota_used_this_month >= subscription.monthly_quota
}

export function calculateQuotaPercentage(subscription: Subscription): number {
  if (subscription.monthly_quota === 0) return 0
  return Math.round(
    (subscription.quota_used_this_month / subscription.monthly_quota) * 100
  )
}

export function getTierDisplayName(tier: SubscriptionTier): string {
  const config = getTierConfig(tier)
  return config.badge ? `${config.name} - ${config.badge}` : config.name
}

export function getSortedTiers(): SubscriptionTierConfig[] {
  return Object.values(SUBSCRIPTION_TIERS)
    .filter((tier) => tier.id !== 'trial' && tier.id !== 'lifetime_launch')
    .sort((a, b) => a.price - b.price)
}
