import {
  formatRegisteredCreditsBreakdownAr,
  getTierLabelAr as getConfigTierLabelAr,
  isBundleTier,
  REGISTERED_FREE_CREDIT_TOTAL,
} from '@emotifyai/config/pricing'
import { PRICING_PLANS } from '@/lib/pricing/plans'
import { SubscriptionTier } from '@/types/database'
import type { SubscriptionTier as AppTier } from '@/lib/subscription/types'
import { isRecurringTier } from '@/lib/billing/variant-tier'

const REGISTERED_FREE_TIERS = new Set<string>([
  SubscriptionTier.FREE,
  SubscriptionTier.TRIAL,
])

/** Arabic display name — prefers pricing page offer name when checkout tier matches */
export function getTierLabelAr(tier: SubscriptionTier | AppTier): string {
  const fromPricing = PRICING_PLANS.find((p) => p.checkoutTier === tier)
  if (fromPricing) return fromPricing.name
  return getConfigTierLabelAr(tier as string)
}

/** Dashboard plan badge — free/trial users are «مسجل», not FREE/TRIAL */
export function getDashboardPlanLabelAr(tier: SubscriptionTier | AppTier): string {
  if (REGISTERED_FREE_TIERS.has(tier)) return 'مسجل'
  return getTierLabelAr(tier)
}

/** Usage block title: monthly only for renewable subscriptions */
export function getUsageLabelAr(tier: SubscriptionTier | AppTier): string {
  return isRecurringTier(tier as SubscriptionTier) ? 'الاستخدام الشهري' : 'الاستخدام'
}

/** Credit limit line for registered free users (5 guest + 5 signup) */
export function getRegisteredCreditsDescriptionAr(
  creditsLimit: number
): string {
  if (creditsLimit === REGISTERED_FREE_CREDIT_TOTAL) {
    return `${formatRegisteredCreditsBreakdownAr()} = ${REGISTERED_FREE_CREDIT_TOTAL} تحويلات`
  }
  return `${creditsLimit} تحويل`
}

export function isBundleSubscriptionTier(tier: string): boolean {
  return isBundleTier(tier as AppTier)
}

export function getStatusLabelAr(status: string): string {
  const labels: Record<string, string> = {
    active: 'نشط',
    trial: 'تجربة',
    cancelled: 'ملغى',
    expired: 'منتهي',
    past_due: 'متأخر الدفع',
    paused: 'موقوف',
    paid: 'مدفوع',
    pending: 'قيد الانتظار',
    refunded: 'مسترد',
    void: 'ملغى',
  }
  return labels[status] ?? status
}

export function getInvoiceStatusLabelAr(status: string): string {
  return getStatusLabelAr(status)
}

export function getPaymentTypeLabelAr(type: string): string {
  const labels: Record<string, string> = {
    subscription: 'اشتراك',
    renewal: 'تجديد',
    one_time: 'دفعة واحدة',
    bundle: 'حزمة',
    initial: 'اشتراك جديد',
  }
  return labels[type] ?? type
}
