import type { User, Subscription, UsageStats, SubscriptionTier } from '@/types';
import { SubscriptionTier as Tier, SubscriptionStatus } from '@/types';

// Mock Users
export const mockUsers: Record<string, User> = {
    trial: {
        id: 'user-trial-001',
        email: 'trial@example.com',
        name: 'Trial User',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=trial',
        createdAt: new Date().toISOString(),
    },
    monthly: {
        id: 'user-monthly-001',
        email: 'monthly@example.com',
        name: 'Monthly Subscriber',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=monthly',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    lifetime: {
        id: 'user-lifetime-001',
        email: 'lifetime@example.com',
        name: 'Lifetime Member',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lifetime',
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    },
};

// Mock Subscriptions
export const mockSubscriptions: Record<SubscriptionTier, Subscription> = {
    [Tier.TRIAL]: {
        tier: Tier.TRIAL,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date().toISOString(),
        usageLimit: 10,
    },
    [Tier.MONTHLY]: {
        tier: Tier.MONTHLY,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        usageLimit: 1000,
    },
    [Tier.LIFETIME]: {
        tier: Tier.LIFETIME,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        usageLimit: Infinity,
    },
};

// Mock Usage Stats
export const mockUsageStats: Record<SubscriptionTier, UsageStats> = {
    [Tier.TRIAL]: {
        used: 3,
        limit: 10,
        lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    [Tier.MONTHLY]: {
        used: 245,
        limit: 1000,
        resetDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        lastUsed: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    [Tier.LIFETIME]: {
        used: 5432,
        limit: Infinity,
        lastUsed: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
};

// Mock Enhanced Text Responses
export const mockEnhancedTexts: Record<string, Record<string, string>> = {
    en: {
        'hello world': 'Hello, World! Welcome to an enhanced experience.',
        'test': 'This is a comprehensive test of the text enhancement capabilities.',
        'default': 'Your text has been professionally enhanced with improved clarity and style.',
    },
    ar: {
        'مرحبا': 'مرحباً بك! نرحب بك في تجربة محسّنة.',
        'default': 'تم تحسين النص الخاص بك بشكل احترافي مع وضوح وأسلوب محسّن.',
    },
    fr: {
        'bonjour': 'Bonjour! Bienvenue dans une expérience améliorée.',
        'default': 'Votre texte a été amélioré de manière professionnelle avec une clarté et un style améliorés.',
    },
};

// Helper to get mock enhanced text
export function getMockEnhancedText(text: string, language: string): string {
    const langTexts = mockEnhancedTexts[language] || mockEnhancedTexts.en;
    const lowerText = text.toLowerCase().trim();
    return langTexts[lowerText] || langTexts.default;
}

// Current mock user (can be changed for testing different scenarios)
export let currentMockUser: SubscriptionTier = Tier.TRIAL;

export function setMockUser(tier: SubscriptionTier): void {
    currentMockUser = tier;
}

export function getCurrentMockUser(): User {
    return mockUsers[currentMockUser];
}

export function getCurrentMockSubscription(): Subscription {
    return mockSubscriptions[currentMockUser];
}

export function getCurrentMockUsageStats(): UsageStats {
    return mockUsageStats[currentMockUser];
}
