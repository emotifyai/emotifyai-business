'use client'

import { useUsageStats, useUsageHistory } from '@/lib/hooks/use-usage'
import { UsageChart } from '@/components/dashboard/usage-chart'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Zap, Activity, Clock, BarChart3, AlertCircle } from 'lucide-react'
import { Skeleton } from '@ui/skeleton'
import { Alert, AlertDescription } from '@ui/alert'
import { Button } from '@ui/button'

export default function UsagePage() {
    const { 
        data: usage, 
        isLoading: isStatsLoading, 
        error: statsError, 
        refetch: refetchStats 
    } = useUsageStats()
    
    const { 
        data: historyPages, 
        isLoading: isHistoryLoading, 
        error: historyError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useUsageHistory()

    // Handle loading states
    if (isStatsLoading || isHistoryLoading) {
        return <UsageSkeleton />
    }

    // Handle authentication errors
    if (statsError?.message.includes('Authentication required') || 
        historyError?.message.includes('Authentication required')) {
        return (
            <div className="space-y-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Please log in to view your usage statistics.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    // Handle other errors with retry option
    if (statsError || historyError) {
        return (
            <div className="space-y-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                        <span>
                            Failed to load usage data: {statsError?.message || historyError?.message}
                        </span>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => refetchStats()}
                        >
                            Retry
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    if (!usage) return null

    // Calculate usage percentage and days remaining
    const totalCredits = usage.credits_used + usage.credits_remaining
    const usagePercentage = totalCredits > 0 ? (usage.credits_used / totalCredits) * 100 : 0
    
    // Calculate days remaining until reset (if reset_date exists)
    const daysRemaining = usage.reset_date 
        ? Math.max(0, Math.ceil((new Date(usage.reset_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : null

    // Transform history data for chart
    const chartData = historyPages?.pages.flatMap((page: any) => 
        page.data.map((log: any) => ({
            date: log.created_at,
            count: log.credits_consumed,
        }))
    ) ?? []

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
                    value={usage.total_enhancements}
                    icon={Zap}
                    description="All time"
                />
                <StatsCard
                    title="Credits Used"
                    value={usage.credits_used}
                    icon={Activity}
                    description={`${usagePercentage.toFixed(1)}% of ${totalCredits}`}
                />
                <StatsCard
                    title="Weekly Usage"
                    value={usage.weekly_usage}
                    icon={BarChart3}
                    description="Last 7 days"
                />
                <StatsCard
                    title="Days Remaining"
                    value={daysRemaining ?? "∞"}
                    icon={Clock}
                    description={usage.reset_date ? "Until reset" : "No reset scheduled"}
                />
            </div>

            <div className="grid gap-4">
                <div className="space-y-4">
                    <UsageChart data={chartData} />
                    
                    {hasNextPage && (
                        <div className="flex justify-center">
                            <Button 
                                variant="outline" 
                                onClick={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                            >
                                {isFetchingNextPage ? 'Loading...' : 'Load More History'}
                            </Button>
                        </div>
                    )}
                </div>
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
