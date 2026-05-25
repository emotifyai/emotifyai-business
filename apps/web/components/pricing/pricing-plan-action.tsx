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
  compact?: boolean
}

export function PricingPlanAction({
  plan,
  fromNewUser,
  isAuthenticated,
  isCurrentPlan = false,
  compact = false,
}: PricingPlanActionProps) {
  const size = compact ? 'sm' : 'default'
  const className = compact ? 'shrink-0 whitespace-nowrap' : 'w-full'

  if (isCurrentPlan && plan.checkoutTier) {
    return (
      <Button size={size} className={className} variant="outline" disabled>
        خطتك الحالية
      </Button>
    )
  }

  switch (plan.id) {
    case 'instant_trial':
      return (
        <Button size={size} className={className} variant="outline" asChild>
          <Link href="/">جرّب الآن</Link>
        </Button>
      )
    case 'registered_trial':
      return (
        <Button size={size} className={className} variant="outline" asChild>
          <Link href="/signup">سجّل مجاناً</Link>
        </Button>
      )
    case 'pro_monthly':
    case 'pro_annual':
      if (!plan.checkoutTier) return null
      return (
        <PricingButton
          tier={plan.checkoutTier}
          fromNewUser={fromNewUser}
          isFree={false}
          isLifetime={false}
          buttonText={compact ? 'اشترك' : 'اشترك الآن'}
          variant={plan.highlighted ? 'default' : 'outline'}
          isAuthenticated={isAuthenticated}
          disabled={isCurrentPlan}
          isCurrentPlan={isCurrentPlan}
        />
      )
    case 'small_bundle':
    case 'large_bundle':
      return (
        <Button size={size} className={className} variant="outline" disabled title="راجع docs/lemon-squeezy-pricing.md">
          {compact ? 'قريباً' : 'قريباً — تفعيل الدفع'}
        </Button>
      )
    default:
      return null
  }
}
