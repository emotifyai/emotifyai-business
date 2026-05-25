import {
  CHECKOUT_TIER_IDS,
  getLemonVariantEnvKey,
  type SubscriptionTierId,
} from '@emotifyai/config/pricing'
import { SubscriptionTier } from '@/types/database'

/** Map Lemon Squeezy variant ID to app subscription tier */
export function getTierFromVariantId(variantId: string): SubscriptionTier {
  for (const tierId of CHECKOUT_TIER_IDS) {
    const envKey = getLemonVariantEnvKey(tierId)
    if (envKey && process.env[envKey] === variantId) {
      return tierId as SubscriptionTier
    }
  }

  return SubscriptionTier.FREE
}

export function isRecurringTier(tier: SubscriptionTier): boolean {
  return tier.includes('monthly') || tier.includes('annual')
}

export type { SubscriptionTierId }
