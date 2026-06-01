'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  UpgradePrompt,
  type UpgradePromptVariant,
  type UpgradePromptLayout,
} from '@emotifyai/ui'
import { PricingButton } from '@/components/pricing-button'
import { useUser } from '@/lib/hooks/use-auth'
import { useSubscription } from '@/lib/hooks/use-subscription'
import {
  getGuestCreditsRemaining,
  getGuestCreditsUsed,
  GUEST_CREDIT_LIMIT,
  isGuestCreditsExhausted,
} from '@/lib/upgrade-prompt/guest-credits'
import {
  getPrimaryCheckoutTier,
  resolveUpgradeVariant,
} from '@/lib/upgrade-prompt/resolve-variant'
import type { SubscriptionTier } from '@/lib/subscription/types'
import { trackUpgradeClicked } from '@/lib/analytics/ga'

export type { UpgradePromptVariant }

export type ConnectedUpgradePromptProps = {
  /** Force a variant instead of auto-resolving from hooks */
  variant?: UpgradePromptVariant
  layout?: UpgradePromptLayout
  className?: string
  creditsUsed?: number
  creditsLimit?: number
  remainingCredits?: number
  compact?: boolean
  isAuthenticated?: boolean
  onDismiss?: () => void
}

export function ConnectedUpgradePrompt({
  variant: forcedVariant,
  layout = 'card',
  className,
  creditsUsed,
  creditsLimit,
  remainingCredits,
  compact,
  isAuthenticated: isAuthenticatedProp,
  onDismiss,
}: ConnectedUpgradePromptProps) {
  const router = useRouter()
  const { data: user } = useUser()
  const { data: subscription } = useSubscription()

  const isAuthenticated = isAuthenticatedProp ?? !!user
  const guestExhausted = !isAuthenticated && isGuestCreditsExhausted()

  const resolvedVariant =
    forcedVariant ??
    resolveUpgradeVariant({
      isAuthenticated,
      tier: subscription?.tier,
      creditsRemaining: remainingCredits ?? subscription?.credits_remaining,
      creditsLimit: creditsLimit ?? subscription?.credits_limit,
      guestCreditsExhausted: guestExhausted,
    })

  if (!resolvedVariant) return null

  const limit =
    creditsLimit ??
    subscription?.credits_limit ??
    (resolvedVariant === 'guest_exhausted' ? GUEST_CREDIT_LIMIT : undefined)

  const remaining =
    remainingCredits ??
    subscription?.credits_remaining ??
    (resolvedVariant === 'guest_exhausted' ? getGuestCreditsRemaining() : undefined)

  const used =
    creditsUsed ??
    subscription?.credits_used ??
    (resolvedVariant === 'guest_exhausted'
      ? getGuestCreditsUsed()
      : limit !== undefined && remaining !== undefined
        ? Math.max(0, limit - remaining)
        : undefined)

  const checkoutTier = getPrimaryCheckoutTier(resolvedVariant) as SubscriptionTier

  const signupHref =
    resolvedVariant === 'guest_exhausted' ? '/signup?from=guest' : '/signup'

  const pricingHref = '/pricing'

  const primaryAction =
    resolvedVariant === 'guest_exhausted' ? (
      <Link
        href={signupHref}
        className="inline-flex w-full min-h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        onClick={() => trackUpgradeClicked(`upgrade_prompt_${resolvedVariant}`)}
      >
        سجّل للحصول على ٥ إضافية
      </Link>
    ) : (
      <PricingButton
        tier={checkoutTier}
        fromNewUser={false}
        isFree={false}
        isLifetime={false}
        buttonText={
          resolvedVariant === 'monthly_upsell_annual' ||
          resolvedVariant === 'pro_monthly_exhausted'
            ? 'ترقية للسنوي'
            : resolvedVariant === 'trial_exhausted'
              ? 'اشترك Pro شهري'
              : resolvedVariant === 'bundle_exhausted'
                ? 'شراء حزمة'
                : 'ترقية الخطة'
        }
        variant="default"
        isAuthenticated={isAuthenticated}
      />
    )

  const secondaryAction = (
    <Link
      href={pricingHref}
      className="inline-flex w-full min-h-10 items-center justify-center gap-1 rounded-md text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      onClick={() => {
        trackUpgradeClicked(`upgrade_prompt_secondary_${resolvedVariant}`)
        onDismiss?.()
      }}
    >
      {resolvedVariant === 'guest_exhausted' ? 'عرض الأسعار' : 'قارن الخطط'}
    </Link>
  )

  return (
    <UpgradePrompt
      variant={resolvedVariant}
      layout={layout}
      className={className}
      creditsUsed={used}
      creditsLimit={limit}
      remainingCredits={remaining}
      compact={compact}
      primaryAction={primaryAction}
      secondaryAction={secondaryAction}
      onSecondaryClick={() => router.push(pricingHref)}
    />
  )
}

/** Re-export resolver for editor / API error handling */
export {
  resolveUpgradeVariant,
  getPrimaryCheckoutTier,
} from '@/lib/upgrade-prompt/resolve-variant'

export {
  getGuestCreditsUsed,
  getGuestCreditsRemaining,
  isGuestCreditsExhausted,
  consumeGuestCredit,
  GUEST_CREDIT_LIMIT,
} from '@/lib/upgrade-prompt/guest-credits'
