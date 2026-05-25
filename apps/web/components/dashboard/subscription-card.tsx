'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@emotifyai/ui'
import { Button } from '@emotifyai/ui'
import { Badge } from '@emotifyai/ui'
import { Progress } from '@emotifyai/ui'
import { Check } from 'lucide-react'
import { SubscriptionTier } from '@/types/database'
import { formatDate } from '@/lib/utils'

interface SubscriptionCardProps {
    tier: SubscriptionTier
    status: string
    currentPeriodEnd: Date
    usage: {
        used: number
        limit: number
        percentage: number
    }
}

export function SubscriptionCard({ tier, status, currentPeriodEnd, usage }: SubscriptionCardProps) {
    const isPro = tier !== SubscriptionTier.TRIAL
    const isLifetime = tier === SubscriptionTier.LIFETIME_LAUNCH

    const [isLoading, setIsLoading] = useState(false)

    const handleManageSubscription = async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/billing/portal', {
                method: 'POST',
            })
            const data = await response.json()

            if (data.url) {
                window.location.href = data.url
            } else {
                console.error('Failed to get portal URL:', data.error)
            }
        } catch (error) {
            console.error('Error opening billing portal:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className={isPro ? "border-primary/50" : ""}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>الخطة الحالية</CardTitle>
                    <Badge variant={isPro ? "default" : "secondary"}>
                        {tier.toUpperCase()}
                    </Badge>
                </div>
                <CardDescription>
                    {isLifetime
                        ? "لديك وصول مدى الحياة إلى إيموتيفاي"
                        : `تتجدد خطتك في ${formatDate(currentPeriodEnd)}`
                    }
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">الاستخدام الشهري</span>
                        <span className="font-medium">
                            {usage.used} / {isLifetime ? "∞" : usage.limit}
                        </span>
                    </div>
                    <Progress value={usage.percentage} className="h-2" />
                </div>

                <div className="grid gap-2">
                    <div className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" />
                        <span>الوصول إلى إضافة المتصفح</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" />
                        <span>{isPro ? "تحسينات ذكاء اصطناعي مميزة" : "تحسينات ذكاء اصطناعي أساسية"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" />
                        <span>دعم لغات متعددة</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                {!isLifetime && (
                    <Button
                        className="w-full"
                        variant={isPro ? "outline" : "glow"}
                        asChild={!isPro}
                        onClick={isPro ? handleManageSubscription : undefined}
                        disabled={isLoading}
                    >
                        {isPro ? (
                            isLoading ? "جاري التحميل…" : "إدارة الاشتراك"
                        ) : (
                            <Link href="/pricing">
                                الترقية إلى Pro
                            </Link>
                        )}
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}
