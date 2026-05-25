export type UpgradePromptVariant =
  | 'guest_exhausted'
  | 'trial_exhausted'
  | 'monthly_upsell_annual'
  | 'pro_monthly_exhausted'
  | 'bundle_exhausted'
  | 'limit_reached'
  | 'best_plan'

export type UpgradePromptLayout = 'card' | 'overlay'

export type UpgradePromptContent = {
  headline: string
  subtext: string
  primaryCta: string
  secondaryCta: string
  badge?: string
  showProgress?: boolean
  defaultLimit?: number
}
