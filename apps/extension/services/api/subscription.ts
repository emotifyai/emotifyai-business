import { apiGet } from './client';
import { setSubscription, updateUsageStats } from '@/utils/storage';
import { logger } from '@/utils/logger';
import { SubscriptionError } from '@/utils/errors';
import type { Subscription, UsageStats } from '@/types';
import { SubscriptionSchema, UsageStatsSchema } from '@/schemas/validation';

export async function getSubscription(): Promise<Subscription> {
    try {
        const response = await apiGet<{ subscription: Subscription }>('subscription');

        // Validate and store
        const validated = SubscriptionSchema.parse(response.subscription);
        await setSubscription(validated);

        return validated;
    } catch (error) {
        logger.error('Failed to fetch subscription', error);
        throw error;
    }
}

export async function getUsage(): Promise<UsageStats> {
    try {
        const response = await apiGet<{ usage: UsageStats }>('usage');

        // Validate and store
        const validated = UsageStatsSchema.parse(response.usage);
        await updateUsageStats(validated);

        return validated;
    } catch (error) {
        logger.error('Failed to fetch usage stats', error);
        throw error;
    }
}

export async function checkLimit(): Promise<{ allowed: boolean; remaining: number }> {
    try {
        const usage = await getUsage();
        const remaining = usage.limit - usage.used;
        const allowed = remaining > 0;

        if (!allowed) {
            throw new SubscriptionError(
                'Usage limit exceeded. Please upgrade your subscription.',
                usage.limit,
                usage.used
            );
        }

        return { allowed, remaining };
    } catch (error) {
        if (error instanceof SubscriptionError) {
            throw error;
        }
        logger.error('Failed to check usage limit', error);
        throw error;
    }
}
