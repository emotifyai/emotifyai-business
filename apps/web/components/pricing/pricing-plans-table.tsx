import { PRICING_CURRENCY_NOTE, PRICING_PLANS, type PricingPlanRow } from '@/lib/pricing/plans'
import { PricingPlanAction } from '@/components/pricing/pricing-plan-action'
import { cn } from '@/lib/utils'

function SarPrice({ plan }: { plan: PricingPlanRow }) {
  const isFree = plan.sarPrice === 'مجاني'

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex flex-wrap items-baseline gap-1">
        <span
          className={cn(
            'font-bold leading-tight',
            isFree ? 'text-lg text-primary' : 'text-xl text-primary sm:text-2xl'
          )}
        >
          {plan.sarPrice}
        </span>
        {plan.sarSuffix && (
          <span className="text-base font-semibold text-primary sm:text-lg">
            {plan.sarSuffix}
          </span>
        )}
      </div>
      {plan.usdApprox && (
        <span className="text-xs text-muted-foreground sm:text-sm">
          ≈ {plan.usdApprox}
        </span>
      )}
    </div>
  )
}

interface PricingPlansTableProps {
  fromNewUser?: boolean
  isAuthenticated?: boolean
  currentTier?: string | null
}

export function PricingPlansTable({
  fromNewUser = false,
  isAuthenticated = false,
  currentTier = null,
}: PricingPlansTableProps) {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <div
        className="mb-8 rounded-xl border border-border/60 bg-card px-4 py-3 text-center text-sm text-muted-foreground sm:px-6 sm:py-4 sm:text-base"
        role="note"
      >
        {PRICING_CURRENCY_NOTE}
      </div>

      {/* Desktop / tablet table */}
      <div className="hidden overflow-hidden rounded-xl border border-border/60 bg-card md:block">
        <table className="w-full border-collapse text-right">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30">
              <th className="px-4 py-3 text-sm font-semibold text-foreground sm:px-6 sm:py-4">
                الخطة
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-foreground sm:px-6 sm:py-4">
                السعر
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-foreground sm:px-6 sm:py-4">
                التفاصيل
              </th>
              <th className="w-[1%] px-4 py-3 sm:px-6 sm:py-4" aria-hidden />
            </tr>
          </thead>
          <tbody>
            {PRICING_PLANS.map((plan) => {
              const isCurrent =
                plan.checkoutTier != null && currentTier === plan.checkoutTier

              return (
                <tr
                  key={plan.id}
                  className={cn(
                    'border-b border-border/40 last:border-b-0',
                    plan.highlighted && 'bg-primary/5',
                    isCurrent && 'bg-primary/10'
                  )}
                >
                  <td className="px-4 py-4 font-medium sm:px-6">{plan.name}</td>
                  <td className="px-4 py-4 sm:px-6">
                    <SarPrice plan={plan} />
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground sm:px-6">
                    {plan.details}
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <PricingPlanAction
                      plan={plan}
                      fromNewUser={fromNewUser}
                      isAuthenticated={isAuthenticated}
                      isCurrentPlan={isCurrent}
                      compact
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-4 md:hidden">
        {PRICING_PLANS.map((plan) => {
          const isCurrent =
            plan.checkoutTier != null && currentTier === plan.checkoutTier

          return (
            <article
              key={plan.id}
              className={cn(
                'rounded-xl border border-border/60 bg-card p-4',
                plan.highlighted && 'border-primary/40 ring-1 ring-primary/20',
                isCurrent && 'border-primary/60 bg-primary/5'
              )}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold">{plan.name}</h3>
                {plan.highlighted && (
                  <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                    الأكثر شيوعاً
                  </span>
                )}
              </div>
              <div className="mb-3">
                <SarPrice plan={plan} />
              </div>
              <p className="mb-4 text-sm text-muted-foreground">{plan.details}</p>
              <PricingPlanAction
                plan={plan}
                fromNewUser={fromNewUser}
                isAuthenticated={isAuthenticated}
                isCurrentPlan={isCurrent}
              />
            </article>
          )
        })}
      </div>
    </div>
  )
}
