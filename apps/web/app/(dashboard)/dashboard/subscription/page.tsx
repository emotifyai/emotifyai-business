'use client'

import { useSubscription, useCreateCheckout, useCustomerPortal } from '@/lib/hooks/use-subscription'
import { SubscriptionCard } from '@/components/dashboard/subscription-card'
import { Button } from '@emotifyai/ui'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@emotifyai/ui'
import { Check } from 'lucide-react'
import { SubscriptionTier } from '@/types/database'
import { Skeleton } from '@emotifyai/ui'

export default function SubscriptionPage() {
    const { data: subscription, isLoading } = useSubscription()
    const createCheckout = useCreateCheckout()
    const customerPortal = useCustomerPortal()

    if (isLoading) {
        return <SubscriptionSkeleton />
    }

    if (!subscription) return null

    const plans = [
        {
            name: 'Pro شهري',
            price: '٤٥ ريال',
            period: '/شهر',
            tier: SubscriptionTier.PRO_MONTHLY,
            features: [
                '٣٠٠ تحويل شهرياً',
                'جميع اللغات (عربي، إنجليزي، فرنسي)',
                'جميع أوضاع التحسين',
                'معالجة سريعة',
                'دعم بالبريد',
            ],
        },
        {
            name: 'مدى الحياة',
            price: '٩٧ دولار',
            period: 'مرة واحدة',
            tier: SubscriptionTier.LIFETIME_LAUNCH,
            features: [
                'وصول مدى الحياة',
                'جميع اللغات',
                'دعم أولوية',
                'معالجة سريعة',
                'محدود لأول ٥٠٠ مشترك',
            ],
        },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">الاشتراك</h2>
                <p className="text-muted-foreground">
                    إدارة خطتك والفوترة
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-6">
                    <h3 className="text-lg font-medium">الخطة الحالية</h3>
                    <SubscriptionCard
                        tier={subscription.tier}
                        status={subscription.status}
                        currentPeriodEnd={new Date(subscription.current_period_end)}
                        usage={{
                            used: subscription.credits_used ?? 0,
                            limit: subscription.credits_limit ?? 0,
                            percentage: subscription.credits_limit
                                ? ((subscription.credits_used ?? 0) / subscription.credits_limit) * 100
                                : 0,
                        }}
                    />
                    {subscription.tier !== SubscriptionTier.TRIAL && (
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => customerPortal.mutate()}
                        >
                            إدارة الفوترة والفواتير
                        </Button>
                    )}
                </div>

                <div className="space-y-6">
                    <h3 className="text-lg font-medium">الخطط المتاحة</h3>
                    <div className="grid gap-4">
                        {plans.map((plan) => (
                            <Card key={plan.name} className={subscription.tier === plan.tier ? "border-primary" : ""}>
                                <CardHeader>
                                    <CardTitle>{plan.name}</CardTitle>
                                    <CardDescription>
                                        <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                                        {plan.period}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="grid gap-2 text-sm">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-primary" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    {subscription.tier === plan.tier ? (
                                        <Button className="w-full" disabled>خطتك الحالية</Button>
                                    ) : (
                                        <Button
                                            className="w-full"
                                            variant="glow"
                                            onClick={() => createCheckout.mutate(plan.tier)}
                                        >
                                            الترقية إلى {plan.name}
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
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
            <div className="grid gap-8 md:grid-cols-2">
                <Skeleton className="h-[300px]" />
                <div className="space-y-4">
                    <Skeleton className="h-[250px]" />
                    <Skeleton className="h-[250px]" />
                </div>
            </div>
        </div>
    )
}
