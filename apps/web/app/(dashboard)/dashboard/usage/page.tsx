'use client'

import { useUsageStats, useUsageHistory } from '@/lib/hooks/use-usage'
import { UsageChart } from '@/components/dashboard/usage-chart'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Zap, Activity, Clock, BarChart3 } from 'lucide-react'
import { Skeleton } from '@ui/skeleton'

export default function UsagePage() {
    const { data: usage, isLoading: isStatsLoading } = useUsageStats()
    const { data: history, isLoading: isHistoryLoading } = useUsageHistory()

    if (isStatsLoading || isHistoryLoading) {
        return <UsageSkeleton />
    }

    if (!usage || !history) return null

    const usagePercentage = usage.currentPeriod.enhancementsLimit === Infinity
        ? 0
        : (usage.currentPeriod.enhancementsUsed / usage.currentPeriod.enhancementsLimit) * 100

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Usage Statistics</h2>
                <p className="text-muted-foreground">
                    Monitor your AI enhancement usage and limits
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
                    title="Avg. Daily Usage"
                    value={Math.round(usage.currentPeriod.enhancementsUsed / 30)}
                    icon={BarChart3}
                    description="Last 30 days"
                />
                <StatsCard
                    title="Days Remaining"
                    value={12} // Mock value
                    icon={Clock}
                    description="In current period"
                />
            </div>

            <div className="grid gap-4">
                <UsageChart data={history.map(log => ({
                    date: log.created_at,
                    count: log.tokens_used // Using tokens as proxy for count in this view
                }))} />
            </div>
        </div>
    )
}

function UsageSkeleton() {
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
            <Skeleton className="h-[400px]" />
        </div>
    )
}
