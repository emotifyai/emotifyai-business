import {
  getTierLabelAr as getConfigTierLabelAr,
} from '@emotifyai/config/pricing'
import { PRICING_PLANS } from '@/lib/pricing/plans'
import { SubscriptionTier } from '@/types/database'
import type { SubscriptionTier as AppTier } from '@/lib/subscription/types'

/** Arabic display name — prefers pricing page offer name when checkout tier matches */
export function getTierLabelAr(tier: SubscriptionTier | AppTier): string {
  const fromPricing = PRICING_PLANS.find((p) => p.checkoutTier === tier)
  if (fromPricing) return fromPricing.name
  return getConfigTierLabelAr(tier as string)
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
