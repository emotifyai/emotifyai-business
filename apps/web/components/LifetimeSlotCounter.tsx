'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, Zap } from 'lucide-react';

interface LifetimeSlotInfo {
    total: number;
    used: number;
    remaining: number;
    percentage: number;
    available: boolean;
}

interface LifetimeSlotCounterProps {
    refreshInterval?: number; // in milliseconds
    showProgress?: boolean;
    compact?: boolean;
}

export function LifetimeSlotCounter({
    refreshInterval = 30000, // 30 seconds
    showProgress = true,
    compact = false
}: LifetimeSlotCounterProps) {
    const [slotInfo, setSlotInfo] = useState<LifetimeSlotInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSlotInfo = async () => {
        try {
            const response = await fetch('/api/subscription/lifetime-slots');
            if (!response.ok) throw new Error('Failed to fetch slot information');

            const data = await response.json();
            setSlotInfo(data);
            setError(null);
        } catch (err) {
            console.error('[LifetimeSlotCounter] Error:', err);
            setError('Unable to load slot information');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSlotInfo();

        // Set up auto-refresh
        const interval = setInterval(fetchSlotInfo, refreshInterval);

        return () => clearInterval(interval);
    }, [refreshInterval]);

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span>Loading availability...</span>
            </div>
        );
    }

    if (error || !slotInfo) {
        return (
            <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{error || 'Unable to load'}</span>
            </div>
        );
    }

    const getUrgencyLevel = (): 'low' | 'medium' | 'high' | 'critical' => {
        if (slotInfo.remaining === 0) return 'critical';
        if (slotInfo.remaining <= 10) return 'critical';
        if (slotInfo.percentage >= 90) return 'high';
        if (slotInfo.percentage >= 75) return 'medium';
        return 'low';
    };

    const getUrgencyColor = () => {
        const level = getUrgencyLevel();
        switch (level) {
            case 'critical': return 'text-red-600 dark:text-red-400';
            case 'high': return 'text-orange-600 dark:text-orange-400';
            case 'medium': return 'text-yellow-600 dark:text-yellow-400';
            default: return 'text-green-600 dark:text-green-400';
        }
    };

    const getProgressColor = () => {
        const level = getUrgencyLevel();
        switch (level) {
            case 'critical': return 'bg-red-600';
            case 'high': return 'bg-orange-600';
            case 'medium': return 'bg-yellow-600';
            default: return 'bg-green-600';
        }
    };

    const getUrgencyMessage = (): string | null => {
        if (slotInfo.remaining === 0) {
            return 'Sold Out!';
        }
        if (slotInfo.remaining <= 10) {
            return `Only ${slotInfo.remaining} left!`;
        }
        if (slotInfo.percentage >= 90) {
            return 'Almost sold out!';
        }
        if (slotInfo.percentage >= 75) {
            return 'Selling fast!';
        }
        return null;
    };

    const urgencyMessage = getUrgencyMessage();

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <Zap className={`h-4 w-4 ${getUrgencyColor()}`} />
                <span className={`text-sm font-medium ${getUrgencyColor()}`}>
                    {slotInfo.remaining} / {slotInfo.total} available
                </span>
                {urgencyMessage && (
                    <Badge variant="destructive" className="text-xs">
                        {urgencyMessage}
                    </Badge>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-3 rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <TrendingUp className={`h-5 w-5 ${getUrgencyColor()}`} />
                    <h3 className="font-semibold text-foreground">Lifetime Offer Availability</h3>
                </div>
                {urgencyMessage && (
                    <Badge variant="destructive" className="animate-pulse">
                        {urgencyMessage}
                    </Badge>
                )}
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subscriptions Remaining</span>
                    <span className={`font-bold ${getUrgencyColor()}`}>
                        {slotInfo.remaining.toLocaleString()} / {slotInfo.total.toLocaleString()}
                    </span>
                </div>

                {showProgress && (
                    <div className="space-y-1">
                        <Progress
                            value={slotInfo.percentage}
                            className="h-2"
                            indicatorClassName={getProgressColor()}
                        />
                        <p className="text-xs text-muted-foreground text-right">
                            {slotInfo.percentage.toFixed(1)}% claimed
                        </p>
                    </div>
                )}
            </div>

            {slotInfo.remaining > 0 && slotInfo.remaining <= 50 && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    <p className="font-medium">⚡ Limited Time Offer</p>
                    <p className="text-xs mt-1">
                        Secure your lifetime subscription before all {slotInfo.total} slots are gone!
                    </p>
                </div>
            )}

            {slotInfo.remaining === 0 && (
                <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                    <p className="font-medium">❌ Sold Out</p>
                    <p className="text-xs mt-1">
                        All {slotInfo.total} lifetime subscriptions have been claimed. Check out our other plans!
                    </p>
                </div>
            )}
        </div>
    );
}
