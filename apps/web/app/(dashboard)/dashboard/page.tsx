'use client'

import { useState } from 'react'
import { useUser } from '@/lib/hooks/use-auth'
import { useSubscription } from '@/lib/hooks/use-subscription'
import { StatsCard } from '@/components/dashboard/stats-card'
import { SubscriptionCard } from '@/components/dashboard/subscription-card'
import { PlanHandler } from './components/plan-handler'
import { Zap, CreditCard, AlertCircle, RefreshCw } from 'lucide-react'
import { Skeleton } from '@ui/skeleton'
import { Alert, AlertDescription } from '@ui/alert'
import { Button } from '@ui/button'
import { toast } from 'sonner'

export default function DashboardPage() {
    const [isRefreshing, setIsRefreshing] = useState(false)
    const { data: user, isLoading: isUserLoading, error: userError } = useUser()
    const { data: subscription, isLoading: isSubLoading, error: subError, refetch: refetchSubscription } = useSubscription()

    const handleRefresh = async () => {
        setIsRefreshing(true)
        try {
            await refetchSubscription()
            toast.success('Dashboard data refreshed successfully!')
        } catch (error) {
            toast.error('Failed to refresh data. Please try again.')
        } finally {
            setIsRefreshing(false)
        }
    }

    // Handle loading states
    if (isUserLoading || isSubLoading) {
        return <DashboardSkeleton />
    }

    // Handle authentication errors
    if (userError?.message.includes('Authentication required')) {
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
    if (subError) {
        return (
            <div className="space-y-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                        <span>
                            Failed to load dashboard data: {subError?.message}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                        >
                            Retry
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    if (!user || !subscription) return null

    // Calculate usage percentage based on subscription limits
    const totalCredits = subscription.credits_limit || 0
    const usedCredits = subscription.credits_used || 0
    const usagePercentage = totalCredits > 0 ? (usedCredits / totalCredits) * 100 : 0

    return (
        <div className="space-y-8">
            <PlanHandler />
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">
                        Welcome back, {user.display_name || 'User'}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatsCard
                    title="Credits Used"
                    value={usedCredits}
                    icon={Zap}
                    description={`${totalCredits - usedCredits} remaining`}
                />
                <StatsCard
                    title="Current Plan"
                    value={subscription.tier.toUpperCase()}
                    icon={CreditCard}
                    description={subscription.status}
                />
                <StatsCard
                    title="Usage"
                    value={`${Math.round(usagePercentage)}%`}
                    icon={Zap}
                    description="of current limit"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-1">
                <SubscriptionCard
                    tier={subscription.tier}
                    status={subscription.status}
                    currentPeriodEnd={new Date(subscription.current_period_end)}
                    usage={{
                        used: usedCredits,
                        limit: totalCredits,
                        percentage: usagePercentage
                    }}
                />
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-[120px]" />
                ))}
            </div>
            <div className="grid gap-4 md:grid-cols-1">
                <Skeleton className="h-[400px]" />
            </div>
        </div>
    )
}
