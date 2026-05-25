import type { SubscriptionTier } from '@/lib/subscription/types'

export const PRICING_CURRENCY_NOTE =
  'الأسعار بالريال السعودي مع ما يقابلها بالدولار (١ دولار = ٣٫٧٥ ريال تقريباً)'

export type PricingPlanId =
  | 'instant_trial'
  | 'registered_trial'
  | 'pro_monthly'
  | 'pro_annual'
  | 'small_bundle'
  | 'large_bundle'

export type PricingSection = 'free' | 'pro' | 'bundle'

export interface PricingPlanRow {
  id: PricingPlanId
  section: PricingSection
  name: string
  sarPrice: string
  sarSuffix?: string
  usdApprox?: string
  details: string
  features: string[]
  checkoutTier?: SubscriptionTier
  highlighted?: boolean
  badge?: string
  cta: string
}

export const PRICING_SECTIONS: { id: PricingSection; title: string; subtitle?: string }[] = [
  { id: 'free', title: 'ابدأ مجاناً', subtitle: 'جرّب التحويلات بدون التزام' },
  { id: 'pro', title: 'Pro', subtitle: '٣٠٠ تحويل شهرياً — للاستخدام المنتظم' },
  { id: 'bundle', title: 'حزم التحويلات', subtitle: 'رصيد إضافي لا ينتهي بتاريخ' },
]

export const PRICING_PLANS: PricingPlanRow[] = [
  {
    id: 'instant_trial',
    section: 'free',
    name: 'تجربة فورية',
    sarPrice: 'مجاني',
    details: '١٠ تحويلات — بدون تسجيل',
    features: ['بدون حساب', 'مناسبة للتجربة السريعة', 'جميع اللغات المدعومة'],
    cta: 'جرّب الآن',
  },
  {
    id: 'registered_trial',
    section: 'free',
    name: 'تجربة مسجلة',
    sarPrice: 'مجاني',
    details: '٥٠ تحويل — ١٤ يوماً',
    features: ['حساب مجاني', 'حفظ السجل في لوحة التحكم', 'جميع أوضاع التحسين'],
    cta: 'سجّل مجاناً',
  },
  {
    id: 'pro_monthly',
    section: 'pro',
    name: 'Pro شهري',
    sarPrice: '٤٥',
    sarSuffix: 'ريال',
    usdApprox: '$12 شهرياً',
    details: '٣٠٠ تحويل شهرياً',
    features: [
      'تجديد الرصيد كل شهر',
      'أولوية في المعالجة',
      'إدارة الاشتراك من لوحة التحكم',
    ],
    checkoutTier: 'pro_monthly',
    highlighted: true,
    badge: 'الأكثر شيوعاً',
    cta: 'اشترك',
  },
  {
    id: 'pro_annual',
    section: 'pro',
    name: 'Pro سنوي',
    sarPrice: '٣٧١',
    sarSuffix: 'ريال',
    usdApprox: '$99 سنوياً',
    details: '٣٠٠ تحويل شهرياً — وفر ٣ أشهر',
    features: [
      'نفس حصة Pro الشهرية',
      'توفير مقارنة بالدفع الشهري',
      'فوترة سنوية واحدة',
    ],
    checkoutTier: 'pro_annual',
    badge: 'أفضل قيمة',
    cta: 'اشترك',
  },
  {
    id: 'small_bundle',
    section: 'bundle',
    name: 'حزمة صغيرة',
    sarPrice: '١٩',
    sarSuffix: 'ريال',
    usdApprox: '$5 مرة واحدة',
    details: '٥٠ تحويل — لا تنتهي بتاريخ',
    features: ['دفعة واحدة', 'تُضاف لرصيدك الحالي', 'بدون اشتراك'],
    checkoutTier: 'small_bundle',
    cta: 'اشترك',
  },
  {
    id: 'large_bundle',
    section: 'bundle',
    name: 'حزمة كبيرة',
    sarPrice: '٣٧',
    sarSuffix: 'ريال',
    usdApprox: '$10 مرة واحدة',
    details: '١٠٠ تحويل — لا تنتهي بتاريخ',
    features: ['دفعة واحدة', 'أفضل سعر للتحويل', 'بدون اشتراك'],
    checkoutTier: 'large_bundle',
    cta: 'اشترك',
  },
]

export function getPlansBySection(section: PricingSection): PricingPlanRow[] {
  return PRICING_PLANS.filter((p) => p.section === section)
}
