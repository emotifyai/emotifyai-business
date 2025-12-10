'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
    const isLifetime = tier === SubscriptionTier.LIFETIME

    return (
        <Card className={isPro ? "border-primary/50" : ""}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Current Plan</CardTitle>
                    <Badge variant={isPro ? "default" : "secondary"}>
                        {tier.toUpperCase()}
                    </Badge>
                </div>
                <CardDescription>
                    {isLifetime
                        ? "You have lifetime access to EmotifyAI"
                        : `Your plan renews on ${formatDate(currentPeriodEnd)}`
                    }
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Monthly Usage</span>
                        <span className="font-medium">
                            {usage.used} / {isLifetime ? "∞" : usage.limit}
                        </span>
                    </div>
                    <Progress value={usage.percentage} className="h-2" />
                </div>

                <div className="grid gap-2">
                    <div className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" />
                        <span>Browser Extension Access</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" />
                        <span>{isPro ? "Unlimited" : "Limited"} AI Enhancements</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" />
                        <span>Multi-language Support</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                {!isLifetime && (
                    <Button className="w-full" variant={isPro ? "outline" : "glow"}>
                        {isPro ? "Manage Subscription" : "Upgrade to Pro"}
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}
