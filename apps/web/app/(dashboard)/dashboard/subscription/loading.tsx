import { Skeleton } from '@emotifyai/ui'
import { Card, CardContent, CardHeader } from '@emotifyai/ui'

export default function SubscriptionLoading() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-96" />
            </div>

            {/* Current Plan Card */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </CardContent>
            </Card>

            {/* Pricing Plans */}
            <div>
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="h-full">
                            <CardHeader>
                                <Skeleton className="h-6 w-24 mb-2" />
                                <Skeleton className="h-8 w-32" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {[1, 2, 3, 4].map((j) => (
                                    <Skeleton key={j} className="h-4 w-full" />
                                ))}
                                <Skeleton className="h-10 w-full mt-4" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
