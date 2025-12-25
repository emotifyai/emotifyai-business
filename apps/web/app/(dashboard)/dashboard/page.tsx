'use client'

import { useUser } from '@/lib/hooks/use-auth'
import { useSubscription } from '@/lib/hooks/use-subscription'
import { useUsageStats, useUsageHistory } from '@/lib/hooks/use-usage'
import { StatsCard } from '@/components/dashboard/stats-card'
import { UsageChart } from '@/components/dashboard/usage-chart'
import { SubscriptionCard } from '@/components/dashboard/subscription-card'
import { PlanHandler } from './components/plan-handler'
import { BarChart3, Zap, CreditCard, Activity, AlertCircle } from 'lucide-react'
import { Skeleton } from '@ui/skeleton'
import { Alert, AlertDescription } from '@ui/alert'
import { Button } from '@ui/button'

export default function DashboardPage() {
    const { data: user, isLoading: isUserLoading, error: userError } = useUser()
    const { data: subscription, isLoading: isSubLoading, error: subError } = useSubscription()
    const { data: usage, isLoading: isUsageLoading, error: usageError, refetch: refetchUsage } = useUsageStats()
    const { data: historyPages } = useUsageHistory(30)

    // Handle loading states
    if (isUserLoading || isSubLoading || isUsageLoading) {
        return <DashboardSkeleton />
    }

    // Handle authentication errors
    if (userError?.message.includes('Authentication required') ||
        usageError?.message.includes('Authentication required')) {
        return (
            <div className="space-y-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Please log in to view your dashboard.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    // Handle other errors with retry option
    if (usageError || subError) {
        return (
            <div className="space-y-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                        <span>
                            Failed to load dashboard data: {usageError?.message || subError?.message}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetchUsage()}
                        >
                            Retry
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    if (!user || !subscription || !usage) return null

    // Calculate usage percentage
    const totalCredits = usage.credits_used + usage.credits_remaining
    const usagePercentage = totalCredits > 0 ? (usage.credits_used / totalCredits) * 100 : 0

    // Transform history data for chart
    const chartData = historyPages?.pages.flatMap((page: any) =>
        page.data.map((log: any) => ({
            date: log.created_at,
            count: log.credits_consumed,
        }))
    ) ?? []

    return (
        <div className="space-y-8">
            <PlanHandler />
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">
                    Welcome back, {user.display_name || 'User'}
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Enhancements"
                    value={usage.total_enhancements}
                    icon={Zap}
                    description="All time"
                />
                <StatsCard
                    title="Credits Used"
                    value={usage.credits_used}
                    icon={Activity}
                    description={`${usage.credits_remaining} remaining`}
                />
                <StatsCard
                    title="Current Plan"
                    value={subscription.tier.toUpperCase()}
                    icon={CreditCard}
                    description={subscription.status}
                />
                <StatsCard
                    title="Daily Usage"
                    value={usage.daily_usage}
                    icon={BarChart3}
                    description="Last 24 hours"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4">
                    <UsageChart data={chartData} />
                </div>
                <div className="col-span-3">
                    <SubscriptionCard
                        tier={subscription.tier}
                        status={subscription.status}
                        currentPeriodEnd={new Date(subscription.current_period_end)}
                        usage={{
                            used: usage.credits_used,
                            limit: totalCredits,
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
