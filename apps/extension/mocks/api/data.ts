import type { User, Subscription, UsageStats, SubscriptionTier } from '@/types';

export const mockUser: User = {
    id: 'mock-user-123',
    email: 'demo@verba.app',
    name: 'Demo User',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
    createdAt: new Date().toISOString(),
};

export const mockSubscriptions: Record<string, Subscription> = {
    trial: {
        tier: 'trial',
        status: 'trial',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days
        usageLimit: 50,
        currentUsage: 5,
        resetDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    basic_monthly: {
        tier: 'basic_monthly',
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        usageLimit: 350,
        currentUsage: 120,
        resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    lifetime_launch: {
        tier: 'lifetime_launch',
        status: 'active',
        startDate: new Date().toISOString(),
        usageLimit: 500,
        currentUsage: 230,
        resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
};

export const mockUsageStats: Record<string, UsageStats> = {
    trial: {
        used: 5,
        limit: 50,
        resetDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        lastUsed: new Date().toISOString(),
    },
    basic_monthly: {
        used: 120,
        limit: 350,
        resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastUsed: new Date().toISOString(),
    },
    lifetime_launch: {
        used: 230,
        limit: 500,
        resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastUsed: new Date().toISOString(),
    },
};

// Current mock user tier for testing
export let currentMockUserTier: SubscriptionTier = 'trial';

export function setMockUser(tier: SubscriptionTier): void {
    currentMockUserTier = tier;
}

export function getCurrentMockUser(): User {
    return mockUser;
}

export function getCurrentMockSubscription(): Subscription {
    return mockSubscriptions[currentMockUserTier] || mockSubscriptions.trial;
}

export function getCurrentMockUsageStats(): UsageStats {
    return mockUsageStats[currentMockUserTier] || mockUsageStats.trial;
}

export function getMockEnhancedText(text: string, tone: string = 'professional'): string {
    return `[Enhanced (${tone})]: ${text}`;
}

