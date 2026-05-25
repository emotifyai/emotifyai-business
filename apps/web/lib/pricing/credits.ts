import type { SubscriptionTier } from '@/lib/subscription/types'

/** Credit limits per tier — keep in sync with webhook + docs/lemon-squeezy-pricing.md */
export const TIER_CREDIT_LIMITS: Partial<Record<SubscriptionTier, number>> = {
  trial: 50,
  pro_monthly: 300,
  pro_annual: 300,
  small_bundle: 50,
  large_bundle: 100,
  lifetime_launch: 1000,
  basic_monthly: 350,
  basic_annual: 350,
  business_monthly: 1500,
  business_annual: 1500,
}

export function getCreditsForTier(tier: SubscriptionTier): number {
  return TIER_CREDIT_LIMITS[tier] ?? 10
}

export function isBundleTier(tier: SubscriptionTier): boolean {
  return tier === 'small_bundle' || tier === 'large_bundle'
}
