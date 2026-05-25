'use client'

import { Button } from '@emotifyai/ui'
import Link from 'next/link'
import type { PricingPlanRow } from '@/lib/pricing/plans'
import { PricingButton } from '@/components/pricing-button'

interface PricingPlanActionProps {
  plan: PricingPlanRow
  fromNewUser: boolean
  isAuthenticated: boolean
  isCurrentPlan?: boolean
}

export function PricingPlanAction({
  plan,
  fromNewUser,
  isAuthenticated,
  isCurrentPlan = false,
}: PricingPlanActionProps) {
  const className = 'w-full'

  if (isCurrentPlan && plan.checkoutTier) {
    return (
      <Button className={className} variant="outline" disabled>
        خطتك الحالية
      </Button>
    )
  }

  switch (plan.id) {
    case 'instant_trial':
      return (
        <Button className={className} variant="outline" asChild>
          <Link href="/">{plan.cta}</Link>
        </Button>
      )
    case 'registered_trial':
      return (
        <Button className={className} variant="outline" asChild>
          <Link href="/signup">{plan.cta}</Link>
        </Button>
      )
    case 'pro_monthly':
    case 'pro_annual':
    case 'small_bundle':
    case 'large_bundle':
      if (!plan.checkoutTier) return null
      return (
        <PricingButton
          tier={plan.checkoutTier}
          fromNewUser={fromNewUser}
          isFree={false}
          isLifetime={false}
          buttonText={plan.cta}
          variant={plan.highlighted ? 'default' : 'outline'}
          isAuthenticated={isAuthenticated}
          disabled={isCurrentPlan}
          isCurrentPlan={isCurrentPlan}
        />
      )
    default:
      return null
  }
}
