'use client'

import { useState } from 'react'
import { useUser } from '@/lib/hooks/use-auth'
import { useSubscription } from '@/lib/hooks/use-subscription'
import { useUsageStats, useUsageHistory } from '@/lib/hooks/use-usage'
import { StatsCard } from '@/components/dashboard/stats-card'
import { UsageChart } from '@/components/dashboard/usage-chart'
import { SubscriptionCard } from '@/components/dashboard/subscription-card'
import { PlanHandler } from './components/plan-handler'
import { BarChart3, Zap, CreditCard, Activity, AlertCircle, RefreshCw } from 'lucide-react'
import {
    getDashboardPlanLabelAr,
    getRegisteredCreditsDescriptionAr,
} from '@/lib/billing/tier-labels'
import { SubscriptionTier } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@emotifyai/ui'
import { Skeleton } from '@emotifyai/ui'
import { Alert, AlertDescription } from '@emotifyai/ui'
import { Button } from '@emotifyai/ui'
import { toast } from '@emotifyai/ui'

export default function DashboardPage() {
    const [isRefreshing, setIsRefreshing] = useState(false)
    const { data: user, isLoading: isUserLoading, error: userError } = useUser()
    const { data: subscription, isLoading: isSubLoading, error: subError, refetch: refetchSubscription } = useSubscription()
    const { data: usage, isLoading: isUsageLoading, error: usageError, refetch: refetchUsage } = useUsageStats()
    const { data: historyPages } = useUsageHistory(30)

    const handleRefresh = async () => {
        setIsRefreshing(true)
        try {
            await Promise.all([
                refetchSubscription(),
                refetchUsage()
            ])
            toast.success('تم تحديث بيانات لوحة التحكم بنجاح!')
        } catch (error) {
            toast.error('فشل تحديث البيانات. حاول مرة أخرى.')
        } finally {
            setIsRefreshing(false)
        }
    }

    // Handle loading states
    if (isUserLoading || isSubLoading || isUsageLoading) {
        return <DashboardSkeleton />
    }

    // Handle authentication errors
    if (userError?.message.includes('يرجى تسجيل الدخول') ||
        usageError?.message.includes('يرجى تسجيل الدخول')) {
        return (
            <div className="space-y-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        يرجى تسجيل الدخول لعرض لوحة التحكم.
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
                            فشل تحميل بيانات لوحة التحكم: {usageError?.message || subError?.message}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                        >
                            إعادة المحاولة
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
    const isFreeRegistered =
        subscription.tier === SubscriptionTier.FREE ||
        subscription.tier === SubscriptionTier.TRIAL
    const planLabel = getDashboardPlanLabelAr(subscription.tier)
    const bundles = subscription.bundles ?? []

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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">لوحة التحكم</h2>
                    <p className="truncate text-sm text-muted-foreground sm:text-base">
                        مرحباً بعودتك، {user.display_name || 'مستخدم'}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="w-full shrink-0 sm:w-auto flex items-center justify-center gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'جاري التحديث…' : 'تحديث'}
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="إجمالي التحسينات"
                    value={usage.total_enhancements}
                    icon={Zap}
                    description="طوال الوقت"
                />
                <StatsCard
                    title="الرصيد المستخدم"
                    value={usage.credits_used}
                    icon={Activity}
                    description={`${usage.credits_remaining} متبقي`}
                />
                <StatsCard
                    title="الخطة الحالية"
                    value={planLabel}
                    icon={CreditCard}
                    description={
                        isFreeRegistered
                            ? getRegisteredCreditsDescriptionAr(subscription.credits_limit)
                            : subscription.tier_name || subscription.status
                    }
                />
                <StatsCard
                    title="الاستخدام اليومي"
                    value={usage.daily_usage}
                    icon={BarChart3}
                    description="آخر ٢٤ ساعة"
                />
            </div>

            {bundles.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">حزم</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {bundles.map((bundle) => (
                                <li
                                    key={bundle.tier}
                                    className="flex items-center justify-between text-sm"
                                >
                                    <span className="font-medium">{bundle.label_ar}</span>
                                    <span className="text-muted-foreground">
                                        {bundle.credits_used} / {bundle.credits_limit} مستخدم
                                        {' — '}
                                        {bundle.credits_remaining} متبقي
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

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
                        bundles={bundles}
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
