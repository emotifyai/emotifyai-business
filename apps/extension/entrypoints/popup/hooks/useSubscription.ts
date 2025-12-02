import { useState, useEffect } from 'react';
import { getSubscription, getUsageStats, watchStorage } from '@/utils/storage';
import { getSubscription as fetchSubscription, getUsage } from '@/services/api/subscription';
import { logger } from '@/utils/logger';
import type { Subscription, UsageStats } from '@/types';

interface SubscriptionState {
    subscription: Subscription | null;
    usage: UsageStats | null;
    isLoading: boolean;
    error: string | null;
}

export function useSubscription() {
    const [state, setState] = useState<SubscriptionState>({
        subscription: null,
        usage: null,
        isLoading: true,
        error: null,
    });

    const loadData = async () => {
        try {
            setState((prev) => ({ ...prev, isLoading: true, error: null }));

            // Load from storage first
            const cachedSubscription = await getSubscription();
            const cachedUsage = await getUsageStats();

            setState({
                subscription: cachedSubscription,
                usage: cachedUsage,
                isLoading: true,
                error: null,
            });

            // Fetch fresh data from API
            const [subscription, usage] = await Promise.all([
                fetchSubscription(),
                getUsage(),
            ]);

            setState({
                subscription,
                usage,
                isLoading: false,
                error: null,
            });
        } catch (error: any) {
            logger.error('Failed to load subscription data', error);
            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: error.message || 'Failed to load subscription data',
            }));
        }
    };

    useEffect(() => {
        loadData().then(r => r);

        // Watch for subscription changes
        const unwatchSubscription = watchStorage('local:subscription', (newSub) => {
            setState((prev) => ({ ...prev, subscription: newSub }));
        });

        const unwatchUsage = watchStorage('local:usageStats', (newUsage) => {
            setState((prev) => ({ ...prev, usage: newUsage }));
        });

        return () => {
            unwatchSubscription();
            unwatchUsage();
        };
    }, []);

    return {
        ...state,
        refresh: loadData,
    };
}
