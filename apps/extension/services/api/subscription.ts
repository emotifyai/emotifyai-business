import { apiGet } from './client';
import { setSubscription, updateUsageStats } from '@/utils/storage';
import { logger } from '@/utils/logger';
import { SubscriptionError } from '@/utils/errors';
import type { Subscription, UsageStats, SubscriptionTier, SubscriptionStatus } from '@/types';
import { SubscriptionSchema, UsageStatsSchema } from '@/schemas/validation';

export async function getSubscription(): Promise<Subscription> {
    try {
        const response = await apiGet<{ 
            success: boolean;
            data: {
                tier: string;
                status: string;
                credits_limit: number;
                credits_used: number;
                credits_reset_date?: string;
                current_period_end?: string;
            }
        }>('extension/subscription');

        // Map API response to extension Subscription format
        const subscription: Subscription = {
            tier: response.data.tier as SubscriptionTier,
            status: response.data.status as SubscriptionStatus,
            startDate: new Date().toISOString(), // We don't have this from API, use current date
            endDate: response.data.current_period_end,
            usageLimit: response.data.credits_limit,
            currentUsage: response.data.credits_used,
            resetDate: response.data.credits_reset_date
        };

        // Validate and store
        const validated = SubscriptionSchema.parse(subscription);
        await setSubscription(validated);

        return validated;
    } catch (error) {
        logger.error('Failed to fetch subscription', error);
        throw error;
    }
}

export async function getUsage(): Promise<UsageStats> {
    try {
        // Get usage data from subscription endpoint
        const subscription = await getSubscription();
        
        // Convert subscription data to usage stats format
        const usage: UsageStats = {
            used: subscription.currentUsage || 0,
            limit: subscription.usageLimit || 10,
            resetDate: subscription.resetDate || null
        };

        // Validate and store
        const validated = UsageStatsSchema.parse(usage);
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
