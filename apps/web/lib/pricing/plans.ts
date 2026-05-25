import type { SubscriptionTier } from '@/lib/subscription/types'

export const PRICING_CURRENCY_NOTE =
  'الأسعار بالريال السعودي مع ما يقابلها بالدولار (1 دولار = 3.75 ريال تقريباً)'

export type PricingPlanId =
  | 'instant_trial'
  | 'registered_trial'
  | 'pro_monthly'
  | 'pro_annual'
  | 'small_bundle'
  | 'large_bundle'

export interface PricingPlanRow {
  id: PricingPlanId
  name: string
  /** SAR display — e.g. "٤٥" or "مجاني" */
  sarPrice: string
  sarSuffix?: string
  /** USD approximate — e.g. "$12 شهرياً" */
  usdApprox?: string
  details: string
  /** Maps to Lemon Squeezy checkout when set */
  checkoutTier?: SubscriptionTier
  highlighted?: boolean
}

export const PRICING_PLANS: PricingPlanRow[] = [
  {
    id: 'instant_trial',
    name: 'تجربة فورية',
    sarPrice: 'مجاني',
    details: '10 تحويلات — بدون تسجيل',
  },
  {
    id: 'registered_trial',
    name: 'تجربة مسجلة',
    sarPrice: 'مجاني',
    details: '50 تحويل — 14 يوماً',
  },
  {
    id: 'pro_monthly',
    name: 'Pro شهري',
    sarPrice: '٤٥',
    sarSuffix: 'ريال',
    usdApprox: '$12 شهرياً',
    details: '300 تحويل شهرياً',
    checkoutTier: 'pro_monthly',
    highlighted: true,
  },
  {
    id: 'pro_annual',
    name: 'Pro سنوي',
    sarPrice: '٣٧١',
    sarSuffix: 'ريال',
    usdApprox: '$99 سنوياً',
    details: '300 تحويل شهرياً — وفر 3 أشهر',
    checkoutTier: 'pro_annual',
  },
  {
    id: 'small_bundle',
    name: 'حزمة صغيرة',
    sarPrice: '١٩',
    sarSuffix: 'ريال',
    usdApprox: '$5 مرة واحدة',
    details: '50 تحويل — لا تنتهي بتاريخ',
  },
  {
    id: 'large_bundle',
    name: 'حزمة كبيرة',
    sarPrice: '٣٧',
    sarSuffix: 'ريال',
    usdApprox: '$10 مرة واحدة',
    details: '100 تحويل — لا تنتهي بتاريخ',
  },
]
