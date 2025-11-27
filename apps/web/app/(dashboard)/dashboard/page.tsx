'use client'

import { useUser } from '@/lib/hooks/use-auth'
import { useSubscription } from '@/lib/hooks/use-subscription'
import { useUsageStats } from '@/lib/hooks/use-usage'
import { StatsCard } from '@/components/dashboard/stats-card'
import { UsageChart } from '@/components/dashboard/usage-chart'
import { SubscriptionCard } from '@/components/dashboard/subscription-card'
import { BarChart3, Zap, CreditCard, Activity } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
    const { data: user, isLoading: isUserLoading } = useUser()
    const { data: subscription, isLoading: isSubLoading } = useSubscription()
    const { data: usage, isLoading: isUsageLoading } = useUsageStats()

    if (isUserLoading || isSubLoading || isUsageLoading) {
        return <DashboardSkeleton />
    }

    if (!user || !subscription || !usage) return null

    const usagePercentage = usage.currentPeriod.enhancementsLimit === Infinity
        ? 0
        : (usage.currentPeriod.enhancementsUsed / usage.currentPeriod.enhancementsLimit) * 100

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">
                    Welcome back, {user.display_name || 'User'}
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Enhancements"
                    value={usage.currentPeriod.enhancementsUsed}
                    icon={Zap}
                    description="This billing period"
                />
                <StatsCard
                    title="Usage Limit"
                    value={usage.currentPeriod.enhancementsLimit === Infinity ? "∞" : usage.currentPeriod.enhancementsLimit}
                    icon={Activity}
                    description={`${usagePercentage.toFixed(1)}% used`}
                />
                <StatsCard
                    title="Current Plan"
                    value={subscription.tier.toUpperCase()}
                    icon={CreditCard}
                    description={subscription.status}
                />
                <StatsCard
                    title="Avg. Daily Usage"
                    value={Math.round(usage.currentPeriod.enhancementsUsed / 30)}
                    icon={BarChart3}
                    description="Last 30 days"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4">
                    <UsageChart data={usage.history} />
                </div>
                <div className="col-span-3">
                    <SubscriptionCard
                        tier={subscription.tier}
                        status={subscription.status}
                        currentPeriodEnd={new Date(subscription.current_period_end)}
                        usage={{
                            used: usage.currentPeriod.enhancementsUsed,
                            limit: usage.currentPeriod.enhancementsLimit === Infinity ? 1000 : usage.currentPeriod.enhancementsLimit,
                            percentage: usagePercentage
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <Skeleton className="h-8 w-[200px]" />
                <Skeleton className="h-4 w-[300px]" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array(4).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-[120px]" />
                ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Skeleton className="col-span-4 h-[400px]" />
                <Skeleton className="col-span-3 h-[400px]" />
            </div>
        </div>
    )
}
