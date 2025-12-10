'use client'

import { useSubscription, useCreateCheckout, useCustomerPortal } from '@/lib/hooks/use-subscription'
import { SubscriptionCard } from '@/components/dashboard/subscription-card'
import { Button } from '@ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@ui/card'
import { Check } from 'lucide-react'
import { SubscriptionTier } from '@/types/database'
import { Skeleton } from '@ui/skeleton'

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
            name: 'Monthly Pro',
            price: '$9.99',
            period: '/month',
            tier: SubscriptionTier.PRO_MONTHLY,
            features: [
                'Unlimited AI enhancements',
                'All languages supported',
                'Priority support',
                'Early access to new features',
            ],
        },
        {
            name: 'Lifetime',
            price: '$99.99',
            period: 'one-time',
            tier: SubscriptionTier.LIFETIME_LAUNCH,
            features: [
                'Unlimited AI enhancements forever',
                'All languages supported',
                'Priority support',
                'Lifetime updates included',
            ],
        },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Subscription</h2>
                <p className="text-muted-foreground">
                    Manage your subscription plan and billing
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Current Plan */}
                <div className="space-y-6">
                    <h3 className="text-lg font-medium">Current Plan</h3>
                    <SubscriptionCard
                        tier={subscription.tier}
                        status={subscription.status}
                        currentPeriodEnd={new Date(subscription.current_period_end)}
                        usage={{
                            used: 45, // Mock data
                            limit: 1000,
                            percentage: 4.5
                        }}
                    />
                    {subscription.tier !== SubscriptionTier.TRIAL && (
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => customerPortal.mutate()}
                        >
                            Manage Billing & Invoices
                        </Button>
                    )}
                </div>

                {/* Available Plans */}
                <div className="space-y-6">
                    <h3 className="text-lg font-medium">Available Plans</h3>
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
                                        <Button className="w-full" disabled>Current Plan</Button>
                                    ) : (
                                        <Button
                                            className="w-full"
                                            variant="glow"
                                            onClick={() => createCheckout.mutate(plan.tier)}
                                        >
                                            Upgrade to {plan.name}
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
