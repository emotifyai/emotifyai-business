'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@emotifyai/ui';
import { Badge } from '@emotifyai/ui';
import { AlertCircle, TrendingUp, Zap } from 'lucide-react';

interface LifetimeSlotInfo {
    total_slots: number;
    used_slots: number;
    remaining_slots: number;
    is_available: boolean;
    show_urgency: boolean;
    percentage_taken: number;
}

interface LifetimeSlotCounterProps {
    refreshInterval?: number;
    showProgress?: boolean;
    compact?: boolean;
}

export function LifetimeSlotCounter({
    refreshInterval = 30000,
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

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch slot information');
            }

            setSlotInfo(result.data);
            setError(null);
        } catch (err) {
            console.error('[LifetimeSlotCounter] Error:', err);
            setError('تعذّر تحميل معلومات التوفر');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSlotInfo();
        const interval = setInterval(fetchSlotInfo, refreshInterval);
        return () => clearInterval(interval);
    }, [refreshInterval]);

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span>جاري تحميل التوفر…</span>
            </div>
        );
    }

    if (error || !slotInfo) {
        return (
            <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{error || 'تعذّر التحميل'}</span>
            </div>
        );
    }

    const getUrgencyLevel = (): 'low' | 'medium' | 'high' | 'critical' => {
        if (slotInfo.remaining_slots === 0) return 'critical';
        if (slotInfo.remaining_slots <= 10) return 'critical';
        if (slotInfo.percentage_taken >= 90) return 'high';
        if (slotInfo.percentage_taken >= 75) return 'medium';
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

    const getUrgencyMessage = (): string | null => {
        if (slotInfo.remaining_slots === 0) {
            return 'نفدت الكمية!';
        }
        if (slotInfo.remaining_slots <= 10) {
            return `بقي ${slotInfo.remaining_slots} فقط!`;
        }
        if (slotInfo.percentage_taken >= 90) {
            return 'على وشك النفاد!';
        }
        if (slotInfo.percentage_taken >= 75) {
            return 'يُباع بسرعة!';
        }
        return null;
    };

    const urgencyMessage = getUrgencyMessage();

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <Zap className={`h-4 w-4 ${getUrgencyColor()}`} />
                <span className={`text-sm font-medium ${getUrgencyColor()}`}>
                    {slotInfo.remaining_slots.toLocaleString('ar-SA')} / {slotInfo.total_slots.toLocaleString('ar-SA')} متاح
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
                    <h3 className="font-semibold text-foreground">توفر عرض مدى الحياة</h3>
                </div>
                {urgencyMessage && (
                    <Badge variant="destructive" className="animate-pulse">
                        {urgencyMessage}
                    </Badge>
                )}
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">الاشتراكات المتبقية</span>
                    <span className={`font-bold ${getUrgencyColor()}`}>
                        {slotInfo.remaining_slots.toLocaleString('ar-SA')} / {slotInfo.total_slots.toLocaleString('ar-SA')}
                    </span>
                </div>

                {showProgress && (
                    <div className="space-y-1">
                        <Progress value={slotInfo.percentage_taken} className="h-2" />
                        <p className="text-xs text-muted-foreground text-end">
                            {slotInfo.percentage_taken.toFixed(1)}٪ محجوز
                        </p>
                    </div>
                )}
            </div>

            {slotInfo.show_urgency && slotInfo.remaining_slots > 0 && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    <p className="font-medium">⚡ عرض لفترة محدودة</p>
                    <p className="text-xs mt-1">
                        احجز اشتراكك مدى الحياة قبل نفاد جميع الـ {slotInfo.total_slots.toLocaleString('ar-SA')} مقعداً!
                    </p>
                </div>
            )}

            {slotInfo.remaining_slots === 0 && (
                <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                    <p className="font-medium">❌ نفدت الكمية</p>
                    <p className="text-xs mt-1">
                        حُجزت جميع اشتراكات مدى الحياة ({slotInfo.total_slots.toLocaleString('ar-SA')}). اطّلع على خططنا الأخرى!
                    </p>
                </div>
            )}
        </div>
    );
}
