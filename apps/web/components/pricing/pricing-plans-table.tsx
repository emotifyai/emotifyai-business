import {
  PRICING_CURRENCY_NOTE,
  PRICING_SECTIONS,
  getPlansBySection,
  type PricingPlanRow,
} from '@/lib/pricing/plans'
import { PricingPlanAction } from '@/components/pricing/pricing-plan-action'
import { cn } from '@/lib/utils'

function SarPrice({ plan }: { plan: PricingPlanRow }) {
  const isFree = plan.sarPrice === 'مجاني'

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-baseline gap-1.5">
        <span
          className={cn(
            'font-bold leading-none tracking-tight text-[#36ad8e]',
            isFree ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'
          )}
        >
          {plan.sarPrice}
        </span>
        {plan.sarSuffix && (
          <span className="text-lg font-semibold text-[#36ad8e] sm:text-xl">
            {plan.sarSuffix}
          </span>
        )}
      </div>
      {plan.usdApprox && (
        <span className="text-xs text-[#7e8596] sm:text-sm">≈ {plan.usdApprox}</span>
      )}
    </div>
  )
}

function PlanCard({
  plan,
  fromNewUser,
  isAuthenticated,
  currentTier,
}: {
  plan: PricingPlanRow
  fromNewUser: boolean
  isAuthenticated: boolean
  currentTier: string | null
}) {
  const isCurrent =
    plan.checkoutTier != null && currentTier === plan.checkoutTier

  return (
    <article
      className={cn(
        'relative flex h-full flex-col rounded-2xl border bg-[#1a1e2b] p-5 shadow-sm transition-shadow sm:p-6',
        plan.highlighted
          ? 'border-[#36ad8e]/50 shadow-[0_0_40px_-12px_rgba(54,173,142,0.35)]'
          : 'border-white/8 hover:border-white/12',
        isCurrent && 'ring-2 ring-[#36ad8e]/40'
      )}
    >
      {plan.highlighted && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24 rounded-t-2xl bg-gradient-to-b from-[#36ad8e]/12 to-transparent"
          aria-hidden
        />
      )}

      <div className="relative mb-4 flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
        {plan.badge && (
          <span className="shrink-0 rounded-full bg-[#36ad8e]/15 px-2.5 py-0.5 text-xs font-medium text-[#36ad8e]">
            {plan.badge}
          </span>
        )}
      </div>

      <div className="relative mb-3">
        <SarPrice plan={plan} />
      </div>

      <p className="mb-4 text-sm text-[#7e8596]">{plan.details}</p>

      <ul className="mb-6 flex flex-1 flex-col gap-2 text-sm text-muted-foreground">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <span
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#36ad8e]"
              aria-hidden
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <PricingPlanAction
        plan={plan}
        fromNewUser={fromNewUser}
        isAuthenticated={isAuthenticated}
        isCurrentPlan={isCurrent}
      />
    </article>
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
    <div className="mx-auto w-full max-w-6xl">
      <div
        className="mb-10 rounded-2xl border border-white/8 bg-[#1a1e2b] px-4 py-3.5 text-center text-sm text-[#7e8596] sm:px-6 sm:text-base"
        role="note"
      >
        {PRICING_CURRENCY_NOTE}
      </div>

      <div className="space-y-14">
        {PRICING_SECTIONS.map((section) => {
          const plans = getPlansBySection(section.id)
          const gridCols =
            section.id === 'free'
              ? 'sm:grid-cols-2'
              : section.id === 'pro'
                ? 'sm:grid-cols-2 lg:max-w-3xl lg:mx-auto'
                : 'sm:grid-cols-2'

          return (
            <section key={section.id} aria-labelledby={`pricing-${section.id}`}>
              <div className="mb-6 text-center sm:mb-8">
                <h2
                  id={`pricing-${section.id}`}
                  className="text-xl font-bold tracking-tight sm:text-2xl"
                >
                  {section.title}
                </h2>
                {section.subtitle && (
                  <p className="mt-2 text-sm text-[#7e8596] sm:text-base">
                    {section.subtitle}
                  </p>
                )}
              </div>

              <div className={cn('grid grid-cols-1 gap-4 sm:gap-5', gridCols)}>
                {plans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    fromNewUser={fromNewUser}
                    isAuthenticated={isAuthenticated}
                    currentTier={currentTier ?? null}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
