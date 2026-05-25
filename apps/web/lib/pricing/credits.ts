import {
  SUBSCRIPTION_TIER_IDS,
  TIER_DEFINITIONS,
  getCreditsForTier,
  isBundleTier,
  type SubscriptionTierId,
} from '@emotifyai/config/pricing'
import type { SubscriptionTier } from '@/lib/subscription/types'

/** @deprecated Use getCreditsForTier from @emotifyai/config */
export const TIER_CREDIT_LIMITS: Partial<Record<SubscriptionTier, number>> =
  Object.fromEntries(
    SUBSCRIPTION_TIER_IDS.map((id) => [id, TIER_DEFINITIONS[id].credits])
  ) as Partial<Record<SubscriptionTier, number>>

export { getCreditsForTier, isBundleTier }
export type { SubscriptionTierId }
