import { isBundleTier } from '@emotifyai/config/pricing'
import type { SubscriptionTier } from '@/lib/subscription/types'

export function buildCheckoutThankYouUrl(
  origin: string,
  tier: SubscriptionTier
): string {
  const params = new URLSearchParams({ tier })
  if (isBundleTier(tier)) {
    params.set('type', 'bundle')
  }
  return `${origin.replace(/\/$/, '')}/thank-you?${params.toString()}`
}
