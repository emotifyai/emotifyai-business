import { SubscriptionStatus, SubscriptionTier } from '@/types/database'

const FREE_TIERS = new Set<SubscriptionTier>([
  SubscriptionTier.FREE,
  SubscriptionTier.TRIAL,
])

const ACTIVE_PAID_STATUSES = new Set<SubscriptionStatus>([
  SubscriptionStatus.ACTIVE,
  SubscriptionStatus.PAST_DUE,
  SubscriptionStatus.PAUSED,
])

/** User purchased a paid plan (excludes free/trial tiers) */
export function isPaidTier(tier: SubscriptionTier): boolean {
  return !FREE_TIERS.has(tier)
}

/** Active paid subscription — show full billing analytics */
export function hasActivePaidSubscription(
  tier: SubscriptionTier,
  status: SubscriptionStatus
): boolean {
  return isPaidTier(tier) && ACTIVE_PAID_STATUSES.has(status)
}

/** Any paid history (e.g. cancelled but had payments) */
export function hasPaidBillingHistory(
  tier: SubscriptionTier,
  status: SubscriptionStatus
): boolean {
  return isPaidTier(tier) && status !== SubscriptionStatus.TRIAL
}
