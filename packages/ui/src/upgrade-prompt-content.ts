import { UPGRADE_PROMPT_CREDIT_DEFAULTS } from '@emotifyai/config/pricing'
import type { UpgradePromptContent, UpgradePromptVariant } from './upgrade-prompt-types'

export const UPGRADE_PROMPT_CONTENT: Record<UpgradePromptVariant, UpgradePromptContent> = {
  guest_exhausted: {
    headline: 'استخدمت تحويلاتك المجانية الخمس',
    subtext:
      'سجّل بالبريد مجاناً للحصول على ٥ تحويلات إضافية — مع حفظ السجل ومشاركة النتائج. بدون بطاقة ائتمان.',
    primaryCta: 'سجّل للحصول على ٥ إضافية',
    secondaryCta: 'عرض الأسعار',
    badge: 'ضيف',
    showProgress: true,
    defaultLimit: UPGRADE_PROMPT_CREDIT_DEFAULTS.guest_exhausted,
  },
  trial_exhausted: {
    headline: 'انتهى رصيدك المجاني',
    subtext:
      'استنفدت تحويلاتك بعد التسجيل. اشترك في Pro للحصول على ٣٠٠ تحويل شهرياً — إعادة تعيين تلقائية كل شهر.',
    primaryCta: 'اشترك Pro شهري',
    secondaryCta: 'قارن الخطط',
    badge: 'تجربة',
    showProgress: true,
    defaultLimit: UPGRADE_PROMPT_CREDIT_DEFAULTS.trial_exhausted,
  },
  monthly_upsell_annual: {
    headline: 'وفر ٣ أشهر مع الاشتراك السنوي',
    subtext:
      'أنت على Pro شهري. انتقل إلى Pro سنوي بنفس ٣٠٠ تحويل شهرياً مع توفير يعادل ٣ أشهر مجاناً سنوياً.',
    primaryCta: 'ترقية للسنوي',
    secondaryCta: 'إعادة شحن الرصيد',
    badge: 'توفير',
    showProgress: false,
  },
  pro_monthly_exhausted: {
    headline: 'نفد رصيدك الشهري',
    subtext:
      'استنفدت تحويلات Pro لهذا الشهر. رقِّ إلى Pro سنوي (وفر ٣ أشهر) أو انتظر إعادة التعيين في بداية الدورة القادمة.',
    primaryCta: 'ترقية للسنوي',
    secondaryCta: 'عرض الحزم',
    badge: 'Pro شهري',
    showProgress: true,
    defaultLimit: UPGRADE_PROMPT_CREDIT_DEFAULTS.pro_monthly_exhausted,
  },
  bundle_exhausted: {
    headline: 'انتهت تحويلات الحزمة',
    subtext:
      'استنفدت رصيد حزمتك. اشترِ حزمة إضافية تُضاف لرصيدك الحالي، أو اشترك في Pro للحصول على ٣٠٠ تحويل شهرياً.',
    primaryCta: 'شراء حزمة',
    secondaryCta: 'اشترك Pro',
    badge: 'حزمة',
    showProgress: true,
    defaultLimit: UPGRADE_PROMPT_CREDIT_DEFAULTS.bundle_exhausted,
  },
  limit_reached: {
    headline: 'نفد رصيدك',
    subtext:
      'استنفدت تحويلاتك لهذه الفترة. رقِّ خطتك لمتابعة التحسين، أو انتظر إعادة التعيين في موعد التجديد.',
    primaryCta: 'ترقية الخطة',
    secondaryCta: 'عرض الأسعار',
    showProgress: true,
  },
  best_plan: {
    headline: 'أنت على أفضل خطة متاحة',
    subtext:
      'خطة Pro السنوية تمنحك ٣٠٠ تحويل شهرياً مع أفضل قيمة. رصيدك يُعاد تعيينه تلقائياً كل شهر.',
    primaryCta: 'إدارة الاشتراك',
    secondaryCta: 'العودة للمحرر',
    badge: 'Pro سنوي',
    showProgress: false,
  },
}

export function getUpgradePromptContent(variant: UpgradePromptVariant): UpgradePromptContent {
  return UPGRADE_PROMPT_CONTENT[variant]
}
