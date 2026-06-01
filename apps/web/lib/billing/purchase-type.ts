import { isBundleTier, type SubscriptionTierId } from '@emotifyai/config/pricing'
import { SubscriptionTier } from '@/types/database'
import type { InvoicePurchaseType } from '@/lib/billing/types'

export function getPurchaseTypeFromTier(
  tier: SubscriptionTier | string | null | undefined
): InvoicePurchaseType {
  if (!tier) return 'plan'
  if (isBundleTier(tier as SubscriptionTierId)) return 'bundle'
  return 'plan'
}

export function getPurchaseTypeLabelAr(type: InvoicePurchaseType): string {
  return type === 'bundle' ? 'حزمة' : 'خطة'
}
