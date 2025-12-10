import { SubscriptionTier, SubscriptionStatus, EnhancementMode } from '@/types/database'
import type { Profile, Subscription, UsageLog, ApiKey } from '@/types/database'

// =============================================================================
// MOCK USER DATA
// =============================================================================

export const mockUser: Profile = {
    id: 'mock-user-id-123',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-11-27T12:00:00Z',
    email: 'demo@emotifyai.com',
    display_name: 'Demo User',
    avatar_url: null,
}

// =============================================================================
// MOCK SUBSCRIPTION DATA
// =============================================================================

export const mockSubscriptions: Record<SubscriptionTier, Subscription> = {
    [SubscriptionTier.TRIAL]: {
        id: 'sub-trial-123',
        user_id: mockUser.id,
        created_at: '2024-11-20T10:00:00Z',
        updated_at: '2024-11-27T12:00:00Z',
        lemon_squeezy_id: 'trial_mock-user-id-123',
        status: SubscriptionStatus.TRIAL,
        tier: SubscriptionTier.TRIAL,
        current_period_start: '2024-11-20T10:00:00Z',
        current_period_end: '2024-12-20T10:00:00Z',
        cancel_at: null,
    },
    [SubscriptionTier.MONTHLY]: {
        id: 'sub-monthly-123',
        user_id: mockUser.id,
        created_at: '2024-11-01T10:00:00Z',
        updated_at: '2024-11-27T12:00:00Z',
        lemon_squeezy_id: 'ls_sub_monthly_123',
        status: SubscriptionStatus.ACTIVE,
        tier: SubscriptionTier.MONTHLY,
        current_period_start: '2024-11-01T10:00:00Z',
        current_period_end: '2024-12-01T10:00:00Z',
        cancel_at: null,
    },
    [SubscriptionTier.LIFETIME]: {
        id: 'sub-lifetime-123',
        user_id: mockUser.id,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-11-27T12:00:00Z',
        lemon_squeezy_id: 'ls_sub_lifetime_123',
        status: SubscriptionStatus.ACTIVE,
        tier: SubscriptionTier.LIFETIME,
        current_period_start: '2024-01-15T10:00:00Z',
        current_period_end: '2099-12-31T23:59:59Z',
        cancel_at: null,
    },
}

// Default to monthly subscription for mock
export const mockSubscription = mockSubscriptions[SubscriptionTier.MONTHLY]

// =============================================================================
// MOCK USAGE DATA
// =============================================================================

export const mockUsageLogs: UsageLog[] = [
    {
        id: 'log-1',
        user_id: mockUser.id,
        created_at: '2024-11-27T10:00:00Z',
        input_text: 'make this better',
        output_text: 'Please improve this text.',
        language: 'en',
        mode: EnhancementMode.ENHANCE,
        tokens_used: 42,
        success: true,
        error_message: null,
    },
    {
        id: 'log-2',
        user_id: mockUser.id,
        created_at: '2024-11-27T09:30:00Z',
        input_text: 'hello world',
        output_text: 'Greetings, world!',
        language: 'en',
        mode: EnhancementMode.REPHRASE,
        tokens_used: 38,
        success: true,
        error_message: null,
    },
    {
        id: 'log-3',
        user_id: mockUser.id,
        created_at: '2024-11-26T15:00:00Z',
        input_text: 'complex technical jargon',
        output_text: 'Simple easy words',
        language: 'en',
        mode: EnhancementMode.SIMPLIFY,
        tokens_used: 45,
        success: true,
        error_message: null,
    },
]

// Mock usage statistics
export const mockUsageStats = {
    currentPeriod: {
        start: '2024-11-01T00:00:00Z',
        end: '2024-12-01T00:00:00Z',
        enhancementsUsed: 247,
        enhancementsLimit: 1000,
    },
    history: [
        { date: '2024-11-20', count: 15 },
        { date: '2024-11-21', count: 22 },
        { date: '2024-11-22', count: 18 },
        { date: '2024-11-23', count: 12 },
        { date: '2024-11-24', count: 8 },
        { date: '2024-11-25', count: 25 },
        { date: '2024-11-26', count: 30 },
        { date: '2024-11-27', count: 35 },
    ],
}

// =============================================================================
// MOCK API KEYS
// =============================================================================

export const mockApiKeys: ApiKey[] = [
    {
        id: 'key-1',
        user_id: mockUser.id,
        created_at: '2024-11-01T10:00:00Z',
        key_hash: 'hashed_key_1',
        name: 'Production Extension',
        last_used_at: '2024-11-27T11:30:00Z',
        revoked: false,
    },
    {
        id: 'key-2',
        user_id: mockUser.id,
        created_at: '2024-10-15T10:00:00Z',
        key_hash: 'hashed_key_2',
        name: 'Development Testing',
        last_used_at: '2024-11-25T14:20:00Z',
        revoked: false,
    },
    {
        id: 'key-3',
        user_id: mockUser.id,
        created_at: '2024-09-01T10:00:00Z',
        key_hash: 'hashed_key_3',
        name: 'Old Key (Revoked)',
        last_used_at: '2024-09-15T10:00:00Z',
        revoked: true,
    },
]

// =============================================================================
// MOCK ENHANCEMENT RESPONSES
// =============================================================================

export const mockEnhancementResponse = {
    success: true,
    data: {
        enhancedText: 'This is the enhanced version of your text with improved clarity and professionalism.',
        tokensUsed: 45,
        language: 'en',
    },
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Simulate API delay for realistic mock behavior
 */
export function delay(ms: number = 500): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Get mock subscription by tier
 */
export function getMockSubscription(tier: SubscriptionTier): Subscription {
    return mockSubscriptions[tier]
}
