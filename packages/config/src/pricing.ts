/**
 * EmotifyAI pricing — single source of truth
 *
 * Free funnel: 5 guest attempts → signup for 5 more → paid monthly/annual + bundles.
 * No two-week trial. Lifetime launch offer retired (legacy DB rows may remain).
 */

/** Anonymous attempts before email/signup prompt */
export const GUEST_FREE_ATTEMPTS = 5

/** Additional attempts granted when the user creates an account */
export const SIGNUP_BONUS_ATTEMPTS = 5

/** @deprecated Two-week / 50-credit trial — disabled for new users */
export const FREE_TRIAL_ENABLED = false

/** DB / Lemon Squeezy `tier` values */
export const SUBSCRIPTION_TIER_IDS = [
  'trial',
  'free',
  'lifetime_launch',
  'basic_monthly',
  'pro_monthly',
  'business_monthly',
  'basic_annual',
  'pro_annual',
  'business_annual',
  'small_bundle',
  'large_bundle',
] as const

export type SubscriptionTierId = (typeof SUBSCRIPTION_TIER_IDS)[number]

export type BillingKind =
  | 'none'
  | 'subscription_monthly'
  | 'subscription_annual'
  | 'one_time'

/** Lemon Squeezy variant ID env var name (value read at runtime in apps/web) */
export type LemonVariantEnvKey =
  | 'LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID'
  | 'LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID'
  | 'LEMONSQUEEZY_BUSINESS_MONTHLY_VARIANT_ID'
  | 'LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID'
  | 'LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID'
  | 'LEMONSQUEEZY_BUSINESS_ANNUAL_VARIANT_ID'
  | 'LEMONSQUEEZY_SMALL_BUNDLE_VARIANT_ID'
  | 'LEMONSQUEEZY_LARGE_BUNDLE_VARIANT_ID'

export interface TierDefinition {
  id: SubscriptionTierId
  credits: number
  priceUsd: number
  priceSarDisplay: number | null
  billing: BillingKind
  requiresPaidCheckout: boolean
  requiresSubscription: boolean
  priority: number
  labelAr: string
  labelEn: string
  lemonVariantEnvKey?: LemonVariantEnvKey
  creditsResetMonthly: boolean
  creditsNeverExpire: boolean
  validityDays: number | null
  /** @deprecated Lifetime offer retired */
  maxLifetimeSlots?: number
  rateLimitRpm: number
  features: {
    advancedFeatures: boolean
    prioritySupport: boolean
    fastProcessing: boolean
  }
}

/** Paid tiers available via POST /api/checkout (no lifetime) */
export const CHECKOUT_TIER_IDS = [
  'basic_monthly',
  'pro_monthly',
  'business_monthly',
  'basic_annual',
  'pro_annual',
  'business_annual',
  'small_bundle',
  'large_bundle',
] as const

export type CheckoutTierId = (typeof CHECKOUT_TIER_IDS)[number]

export const TIER_DEFINITIONS: Record<SubscriptionTierId, TierDefinition> = {
  trial: {
    id: 'trial',
    credits: SIGNUP_BONUS_ATTEMPTS,
    priceUsd: 0,
    priceSarDisplay: null,
    billing: 'none',
    requiresPaidCheckout: false,
    requiresSubscription: false,
    priority: 2,
    labelAr: 'مجاني (قديم)',
    labelEn: 'Legacy trial',
    creditsResetMonthly: false,
    creditsNeverExpire: false,
    validityDays: null,
    rateLimitRpm: 5,
    features: {
      advancedFeatures: false,
      prioritySupport: false,
      fastProcessing: true,
    },
  },
  free: {
    id: 'free',
    credits: SIGNUP_BONUS_ATTEMPTS,
    priceUsd: 0,
    priceSarDisplay: null,
    billing: 'none',
    requiresPaidCheckout: false,
    requiresSubscription: false,
    priority: 1,
    labelAr: 'مجاني',
    labelEn: 'Free',
    creditsResetMonthly: false,
    creditsNeverExpire: false,
    validityDays: null,
    rateLimitRpm: 5,
    features: {
      advancedFeatures: false,
      prioritySupport: false,
      fastProcessing: true,
    },
  },
  lifetime_launch: {
    id: 'lifetime_launch',
    credits: 1000,
    priceUsd: 97,
    priceSarDisplay: null,
    billing: 'none',
    requiresPaidCheckout: false,
    requiresSubscription: false,
    priority: 0,
    labelAr: 'مدى الحياة (متوقف)',
    labelEn: 'Lifetime (retired)',
    creditsResetMonthly: true,
    creditsNeverExpire: false,
    validityDays: null,
    rateLimitRpm: 20,
    features: {
      advancedFeatures: true,
      prioritySupport: true,
      fastProcessing: true,
    },
  },
  basic_monthly: {
    id: 'basic_monthly',
    credits: 350,
    priceUsd: 17,
    priceSarDisplay: null,
    billing: 'subscription_monthly',
    requiresPaidCheckout: true,
    requiresSubscription: true,
    priority: 3,
    labelAr: 'أساسي شهري',
    labelEn: 'Basic Monthly',
    lemonVariantEnvKey: 'LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID',
    creditsResetMonthly: true,
    creditsNeverExpire: false,
    validityDays: null,
    rateLimitRpm: 10,
    features: {
      advancedFeatures: false,
      prioritySupport: false,
      fastProcessing: true,
    },
  },
  pro_monthly: {
    id: 'pro_monthly',
    credits: 300,
    priceUsd: 12,
    priceSarDisplay: 45,
    billing: 'subscription_monthly',
    requiresPaidCheckout: true,
    requiresSubscription: true,
    priority: 5,
    labelAr: 'Pro شهري',
    labelEn: 'Pro Monthly',
    lemonVariantEnvKey: 'LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID',
    creditsResetMonthly: true,
    creditsNeverExpire: false,
    validityDays: null,
    rateLimitRpm: 15,
    features: {
      advancedFeatures: true,
      prioritySupport: true,
      fastProcessing: true,
    },
  },
  business_monthly: {
    id: 'business_monthly',
    credits: 1500,
    priceUsd: 57,
    priceSarDisplay: null,
    billing: 'subscription_monthly',
    requiresPaidCheckout: true,
    requiresSubscription: true,
    priority: 7,
    labelAr: 'أعمال شهري',
    labelEn: 'Business Monthly',
    lemonVariantEnvKey: 'LEMONSQUEEZY_BUSINESS_MONTHLY_VARIANT_ID',
    creditsResetMonthly: true,
    creditsNeverExpire: false,
    validityDays: null,
    rateLimitRpm: 20,
    features: {
      advancedFeatures: true,
      prioritySupport: true,
      fastProcessing: true,
    },
  },
  basic_annual: {
    id: 'basic_annual',
    credits: 350,
    priceUsd: 153,
    priceSarDisplay: null,
    billing: 'subscription_annual',
    requiresPaidCheckout: true,
    requiresSubscription: true,
    priority: 4,
    labelAr: 'أساسي سنوي',
    labelEn: 'Basic Annual',
    lemonVariantEnvKey: 'LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID',
    creditsResetMonthly: true,
    creditsNeverExpire: false,
    validityDays: null,
    rateLimitRpm: 10,
    features: {
      advancedFeatures: false,
      prioritySupport: false,
      fastProcessing: true,
    },
  },
  pro_annual: {
    id: 'pro_annual',
    credits: 300,
    priceUsd: 99,
    priceSarDisplay: 371,
    billing: 'subscription_annual',
    requiresPaidCheckout: true,
    requiresSubscription: true,
    priority: 6,
    labelAr: 'Pro سنوي',
    labelEn: 'Pro Annual',
    lemonVariantEnvKey: 'LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID',
    creditsResetMonthly: true,
    creditsNeverExpire: false,
    validityDays: null,
    rateLimitRpm: 15,
    features: {
      advancedFeatures: true,
      prioritySupport: true,
      fastProcessing: true,
    },
  },
  business_annual: {
    id: 'business_annual',
    credits: 1500,
    priceUsd: 513,
    priceSarDisplay: null,
    billing: 'subscription_annual',
    requiresPaidCheckout: true,
    requiresSubscription: true,
    priority: 8,
    labelAr: 'أعمال سنوي',
    labelEn: 'Business Annual',
    lemonVariantEnvKey: 'LEMONSQUEEZY_BUSINESS_ANNUAL_VARIANT_ID',
    creditsResetMonthly: true,
    creditsNeverExpire: false,
    validityDays: null,
    rateLimitRpm: 20,
    features: {
      advancedFeatures: true,
      prioritySupport: true,
      fastProcessing: true,
    },
  },
  small_bundle: {
    id: 'small_bundle',
    credits: 50,
    priceUsd: 5,
    priceSarDisplay: 19,
    billing: 'one_time',
    requiresPaidCheckout: true,
    requiresSubscription: false,
    priority: 3,
    labelAr: 'حزمة صغيرة',
    labelEn: 'Small Bundle',
    lemonVariantEnvKey: 'LEMONSQUEEZY_SMALL_BUNDLE_VARIANT_ID',
    creditsResetMonthly: false,
    creditsNeverExpire: true,
    validityDays: null,
    rateLimitRpm: 15,
    features: {
      advancedFeatures: true,
      prioritySupport: false,
      fastProcessing: true,
    },
  },
  large_bundle: {
    id: 'large_bundle',
    credits: 100,
    priceUsd: 10,
    priceSarDisplay: 37,
    billing: 'one_time',
    requiresPaidCheckout: true,
    requiresSubscription: false,
    priority: 4,
    labelAr: 'حزمة كبيرة',
    labelEn: 'Large Bundle',
    lemonVariantEnvKey: 'LEMONSQUEEZY_LARGE_BUNDLE_VARIANT_ID',
    creditsResetMonthly: false,
    creditsNeverExpire: true,
    validityDays: null,
    rateLimitRpm: 15,
    features: {
      advancedFeatures: true,
      prioritySupport: false,
      fastProcessing: true,
    },
  },
}

/** Guest usage — localStorage only */
export const GUEST_PRICING = {
  creditLimit: GUEST_FREE_ATTEMPTS,
  storageKey: 'emotifyai_guest_conversions',
  requiresSubscription: false,
} as const

export const RUNTIME_SUBSCRIPTION_DEFAULTS = {
  apiSubscriptionEmpty: {
    tier: 'free' as const,
    credits: TIER_DEFINITIONS.free.credits,
    validityDays: TIER_DEFINITIONS.free.validityDays,
  },
  apiExtensionEmpty: {
    tier: 'free' as const,
    credits: SIGNUP_BONUS_ATTEMPTS,
    validityDays: null as number | null,
  },
  /** First authenticated enhance when user has no subscription row */
  enhanceFreeInsert: {
    tier: 'free' as const,
    credits: SIGNUP_BONUS_ATTEMPTS,
    validityDays: null as number | null,
  },
  createFreeSubscription: {
    credits: SIGNUP_BONUS_ATTEMPTS,
    validityDays: null as number | null,
  },
  authCallbackNewUser: {
    credits: SIGNUP_BONUS_ATTEMPTS,
    validityDays: null as number | null,
  },
} as const

export const SAR_USD_RATE = 3.75

export const PRICING_CURRENCY_NOTE =
  'الأسعار بالريال السعودي مع ما يقابلها بالدولار (١ دولار = ٣٫٧٥ ريال تقريباً)'

export type PricingOfferId =
  | 'instant_trial'
  | 'registered_signup_bonus'
  | 'pro_monthly'
  | 'pro_annual'
  | 'small_bundle'
  | 'large_bundle'

export type PricingSection = 'free' | 'pro' | 'bundle'

export interface PricingPlanRow {
  id: PricingOfferId
  section: PricingSection
  name: string
  sarPrice: string
  sarSuffix?: string
  usdApprox?: string
  details: string
  features: string[]
  checkoutTier?: CheckoutTierId
  highlighted?: boolean
  badge?: string
  cta: string
}

export const PRICING_SECTIONS: { id: PricingSection; title: string; subtitle?: string }[] = [
  { id: 'free', title: 'ابدأ مجاناً', subtitle: '٥ تحويلات للضيف، ثم ٥ إضافية بعد التسجيل' },
  {
    id: 'pro',
    title: 'Pro',
    subtitle: `٣٠٠ تحويل شهرياً — للاستخدام المنتظم`,
  },
  { id: 'bundle', title: 'حزم التحويلات', subtitle: 'رصيد إضافي لا ينتهي بتاريخ' },
]

export const PRICING_DISPLAY_PLANS: PricingPlanRow[] = [
  {
    id: 'instant_trial',
    section: 'free',
    name: 'تجربة فورية',
    sarPrice: 'مجاني',
    details: `${GUEST_FREE_ATTEMPTS} تحويلات — بدون تسجيل`,
    features: ['بدون حساب', 'مناسبة للتجربة السريعة', 'جميع اللغات المدعومة'],
    cta: 'جرّب الآن',
  },
  {
    id: 'registered_signup_bonus',
    section: 'free',
    name: 'بعد التسجيل',
    sarPrice: 'مجاني',
    details: `${SIGNUP_BONUS_ATTEMPTS} تحويلات إضافية — حفظ السجل ومشاركة النتائج`,
    features: ['حساب مجاني بالبريد', 'لوحة تحكم وسجل التحويلات', 'جميع أوضاع التحسين'],
    cta: 'سجّل مجاناً',
  },
  {
    id: 'pro_monthly',
    section: 'pro',
    name: 'Pro شهري',
    sarPrice: String(TIER_DEFINITIONS.pro_monthly.priceSarDisplay),
    sarSuffix: 'ريال',
    usdApprox: `$${TIER_DEFINITIONS.pro_monthly.priceUsd} شهرياً`,
    details: `${TIER_DEFINITIONS.pro_monthly.credits} تحويل شهرياً`,
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
    sarPrice: String(TIER_DEFINITIONS.pro_annual.priceSarDisplay),
    sarSuffix: 'ريال',
    usdApprox: `$${TIER_DEFINITIONS.pro_annual.priceUsd} سنوياً`,
    details: `${TIER_DEFINITIONS.pro_annual.credits} تحويل شهرياً — وفر ٣ أشهر`,
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
    sarPrice: String(TIER_DEFINITIONS.small_bundle.priceSarDisplay),
    sarSuffix: 'ريال',
    usdApprox: `$${TIER_DEFINITIONS.small_bundle.priceUsd} مرة واحدة`,
    details: `${TIER_DEFINITIONS.small_bundle.credits} تحويل — لا تنتهي بتاريخ`,
    features: ['دفعة واحدة', 'تُضاف لرصيدك الحالي', 'بدون اشتراك'],
    checkoutTier: 'small_bundle',
    cta: 'اشترك',
  },
  {
    id: 'large_bundle',
    section: 'bundle',
    name: 'حزمة كبيرة',
    sarPrice: String(TIER_DEFINITIONS.large_bundle.priceSarDisplay),
    sarSuffix: 'ريال',
    usdApprox: `$${TIER_DEFINITIONS.large_bundle.priceUsd} مرة واحدة`,
    details: `${TIER_DEFINITIONS.large_bundle.credits} تحويل — لا تنتهي بتاريخ`,
    features: ['دفعة واحدة', 'أفضل سعر للتحويل', 'بدون اشتراك'],
    checkoutTier: 'large_bundle',
    cta: 'اشترك',
  },
]

export const UPGRADE_PROMPT_CREDIT_DEFAULTS = {
  guest_exhausted: GUEST_FREE_ATTEMPTS,
  trial_exhausted: TIER_DEFINITIONS.free.credits,
  pro_monthly_exhausted: TIER_DEFINITIONS.pro_monthly.credits,
  bundle_exhausted: TIER_DEFINITIONS.small_bundle.credits,
} as const

export const TIER_COUNT = SUBSCRIPTION_TIER_IDS.length
export const CHECKOUT_TIER_COUNT = CHECKOUT_TIER_IDS.length
export const PRICING_PAGE_OFFER_COUNT = PRICING_DISPLAY_PLANS.length

export function getTierDefinition(tier: SubscriptionTierId): TierDefinition {
  return TIER_DEFINITIONS[tier]
}

export function getCreditsForTier(tier: SubscriptionTierId): number {
  return TIER_DEFINITIONS[tier]?.credits ?? GUEST_FREE_ATTEMPTS
}

export function isBundleTier(tier: SubscriptionTierId): boolean {
  return tier === 'small_bundle' || tier === 'large_bundle'
}

export function isCheckoutTier(tier: string): tier is CheckoutTierId {
  return (CHECKOUT_TIER_IDS as readonly string[]).includes(tier)
}

export function getTierPriority(tier: string): number {
  return TIER_DEFINITIONS[tier as SubscriptionTierId]?.priority ?? 0
}

export function getTierLabelAr(tier: string): string {
  return TIER_DEFINITIONS[tier as SubscriptionTierId]?.labelAr ?? tier.replace(/_/g, ' ')
}

export function getTierLabelsAr(): Record<SubscriptionTierId, string> {
  return Object.fromEntries(
    SUBSCRIPTION_TIER_IDS.map((id) => [id, TIER_DEFINITIONS[id].labelAr])
  ) as Record<SubscriptionTierId, string>
}

export function getTierPriorityMap(): Record<string, number> {
  return Object.fromEntries(
    SUBSCRIPTION_TIER_IDS.map((id) => [id, TIER_DEFINITIONS[id].priority])
  )
}

export function getPlansBySection(section: PricingSection): PricingPlanRow[] {
  return PRICING_DISPLAY_PLANS.filter((p) => p.section === section)
}

export function getLemonVariantEnvKey(
  tier: SubscriptionTierId
): LemonVariantEnvKey | undefined {
  return TIER_DEFINITIONS[tier].lemonVariantEnvKey
}

export function isLifetimeTier(tier: string): boolean {
  return tier === 'lifetime_launch'
}
