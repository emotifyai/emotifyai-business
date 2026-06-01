import type { UpgradePromptVariant } from '@emotifyai/ui'
import { SubscriptionTier } from '@/types/database'

const RECURRING_MAX_TIERS: SubscriptionTier[] = [
  SubscriptionTier.PRO_ANNUAL,
  SubscriptionTier.BUSINESS_ANNUAL,
]

const BUNDLE_TIERS: SubscriptionTier[] = [
  SubscriptionTier.SMALL_BUNDLE,
  SubscriptionTier.LARGE_BUNDLE,
]

const TRIAL_TIERS: SubscriptionTier[] = [
  SubscriptionTier.TRIAL,
  SubscriptionTier.FREE,
]

export type ResolveUpgradeVariantInput = {
  isAuthenticated: boolean
  tier?: SubscriptionTier | string | null
  creditsRemaining?: number
  creditsLimit?: number
  guestCreditsExhausted?: boolean
}

/**
 * Maps user state to an upgrade prompt variant, or null when no prompt should show.
 */
export function resolveUpgradeVariant(
  input: ResolveUpgradeVariantInput
): UpgradePromptVariant | null {
  const { isAuthenticated, tier, creditsRemaining, guestCreditsExhausted } = input

  if (!isAuthenticated) {
    if (guestCreditsExhausted) return 'guest_exhausted'
    return null
  }

  const tierKey = (tier ?? SubscriptionTier.FREE) as SubscriptionTier

  if (RECURRING_MAX_TIERS.includes(tierKey)) {
    return null
  }

  if (creditsRemaining === -1) {
    return null
  }

  const exhausted =
    creditsRemaining !== undefined
      ? creditsRemaining <= 0
      : false

  if (!exhausted) {
    return null
  }

  if (TRIAL_TIERS.includes(tierKey)) {
    return 'trial_exhausted'
  }

  if (tierKey === SubscriptionTier.PRO_MONTHLY) {
    return 'pro_monthly_exhausted'
  }

  if (BUNDLE_TIERS.includes(tierKey)) {
    return 'bundle_exhausted'
  }

  if (
    tierKey === SubscriptionTier.BASIC_MONTHLY ||
    tierKey === SubscriptionTier.BASIC_ANNUAL
  ) {
    return 'limit_reached'
  }

  if (tierKey === SubscriptionTier.BUSINESS_MONTHLY) {
    return 'limit_reached'
  }

  return 'limit_reached'
}

export function getPrimaryCheckoutTier(
  variant: UpgradePromptVariant
): import('@/lib/subscription/types').SubscriptionTier {
  switch (variant) {
    case 'guest_exhausted':
    case 'trial_exhausted':
      return 'pro_monthly'
    case 'monthly_upsell_annual':
    case 'pro_monthly_exhausted':
      return 'pro_annual'
    case 'bundle_exhausted':
      return 'small_bundle'
    default:
      return 'pro_monthly'
  }
}
