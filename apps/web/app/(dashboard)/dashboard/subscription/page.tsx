'use client'

import Link from 'next/link'
import { useSubscription, useCreateCheckout, useCustomerPortal } from '@/lib/hooks/use-subscription'
import { SubscriptionCard } from '@/components/dashboard/subscription-card'
import { BillingAnalytics } from '@/components/dashboard/billing/billing-analytics'
import { Button } from '@emotifyai/ui'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@emotifyai/ui'
import { Check } from 'lucide-react'
import { SubscriptionTier } from '@/types/database'
import { Skeleton } from '@emotifyai/ui'
import { PRICING_PLANS } from '@/lib/pricing/plans'
import { hasActivePaidSubscription } from '@/lib/billing/paid-tier'

const UPGRADE_PLANS = PRICING_PLANS.filter((p) => p.checkoutTier)

export default function SubscriptionPage() {
    const { data: subscription, isLoading } = useSubscription()
    const createCheckout = useCreateCheckout()
    const customerPortal = useCustomerPortal()

    if (isLoading) {
        return <SubscriptionSkeleton />
    }

    if (!subscription) return null

    const isPaidActive = hasActivePaidSubscription(subscription.tier, subscription.status)
    const totalCredits = subscription.credits_limit ?? 0
    const usedCredits = subscription.credits_used ?? 0

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">الاشتراك والفوترة</h2>
                <p className="text-muted-foreground">
                    إدارة خطتك، الفواتير، وسجل المدفوعات
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-6">
                    <h3 className="text-lg font-medium">الخطة الحالية</h3>
                    <SubscriptionCard
                        tier={subscription.tier}
                        status={subscription.status}
                        currentPeriodEnd={new Date(subscription.current_period_end)}
                        usage={{
                            used: usedCredits,
                            limit: totalCredits,
                            percentage: totalCredits
                                ? (usedCredits / totalCredits) * 100
                                : 0,
                        }}
                    />
                    {isPaidActive && subscription.tier !== SubscriptionTier.LIFETIME_LAUNCH && (
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => customerPortal.mutate()}
                            disabled={customerPortal.isPending}
                        >
                            {customerPortal.isPending
                                ? 'جاري التحميل…'
                                : 'إدارة الفوترة والفواتير'}
                        </Button>
                    )}
                </div>

                <div className="space-y-6">
                    <h3 className="text-lg font-medium">الخطط المتاحة</h3>
                    <div className="grid gap-4">
                        {UPGRADE_PLANS.map((plan) => {
                            const tier = plan.checkoutTier as SubscriptionTier
                            return (
                                <Card
                                    key={plan.id}
                                    className={
                                        subscription.tier === tier ? 'border-primary' : ''
                                    }
                                >
                                    <CardHeader>
                                        <CardTitle>{plan.name}</CardTitle>
                                        <CardDescription>
                                            <span className="text-2xl font-bold text-foreground">
                                                {plan.sarPrice}
                                            </span>
                                            {plan.sarSuffix ? ` ${plan.sarSuffix}` : ''}
                                            {plan.usdApprox ? (
                                                <span className="text-sm text-muted-foreground ms-2">
                                                    ({plan.usdApprox})
                                                </span>
                                            ) : null}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            {plan.details}
                                        </p>
                                        <ul className="grid gap-2 text-sm">
                                            {plan.features.map((feature) => (
                                                <li
                                                    key={feature}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Check className="h-4 w-4 text-primary shrink-0" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                    <CardFooter>
                                        {subscription.tier === tier ? (
                                            <Button className="w-full" disabled>
                                                خطتك الحالية
                                            </Button>
                                        ) : (
                                            <Button
                                                className="w-full"
                                                variant="glow"
                                                onClick={() =>
                                                    createCheckout.mutate(tier)
                                                }
                                                disabled={createCheckout.isPending}
                                            >
                                                {plan.cta}
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            </div>

            <section className="space-y-4" aria-labelledby="billing-section-title">
                <h3 id="billing-section-title" className="text-lg font-medium">
                    تحليلات الفوترة
                </h3>
                <BillingAnalytics subscription={subscription} />
            </section>

            {!isPaidActive && (
                <p className="text-center text-sm text-muted-foreground">
                    <Link href="/pricing" className="text-primary underline-offset-4 hover:underline">
                        قارن جميع الخطط
                    </Link>
                </p>
            )}
        </div>
    )
}

function SubscriptionSkeleton() {
    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <Skeleton className="h-8 w-[200px]" />
                <Skeleton className="h-4 w-[300px]" />
            </div>
            <div className="grid gap-8 lg:grid-cols-2">
                <Skeleton className="h-[300px]" />
                <div className="space-y-4">
                    <Skeleton className="h-[250px]" />
                    <Skeleton className="h-[250px]" />
                </div>
            </div>
            <Skeleton className="h-[400px]" />
        </div>
    )
}
