import { SubscriptionTier, SubscriptionStatus } from '@/types/database'
import type { Profile, Subscription, ApiKey } from '@/types/database'

// =============================================================================
// MOCK USER DATA
// =============================================================================

export const mockUser: Profile = {
    id: 'mock-user-id-123',
    created_at: '2024-01-15T10:00:00Z',
    email: 'demo@emotifyai.com',
    display_name: 'Demo User',
    avatar_url: null,
    onboarded: true
}

// =============================================================================
// MOCK SUBSCRIPTION DATA
// =============================================================================

export const mockSubscriptions: Record<SubscriptionTier, Subscription> = {
    [SubscriptionTier.TRIAL]: {
        id: 'sub-trial-123',
        user_id: mockUser.id,
        created_at: '2024-11-20T10:00:00Z',
        lemon_squeezy_id: 'trial_mock-user-id-123',
        status: SubscriptionStatus.TRIAL,
        tier: SubscriptionTier.TRIAL,
        tier_name: 'Trial',
        current_period_start: '2024-11-20T10:00:00Z',
        current_period_end: '2024-12-20T10:00:00Z',
        cancel_at: null,
        credits_limit: 50,
        credits_used: 10,
        credits_reset_date: '2024-12-20T10:00:00Z',
        validity_days: 30,
    },
    [SubscriptionTier.PRO_MONTHLY]: {
        id: 'sub-monthly-123',
        user_id: mockUser.id,
        created_at: '2024-11-01T10:00:00Z',
        lemon_squeezy_id: 'ls_sub_monthly_123',
        status: SubscriptionStatus.ACTIVE,
        tier: SubscriptionTier.PRO_MONTHLY,
        tier_name: 'Pro Monthly',
        current_period_start: '2024-11-01T10:00:00Z',
        current_period_end: '2024-12-01T10:00:00Z',
        cancel_at: null,
        credits_limit: 700,
        credits_used: 150,
        credits_reset_date: '2024-12-01T10:00:00Z',
        validity_days: null,
    },
    [SubscriptionTier.LIFETIME_LAUNCH]: {
        id: 'sub-lifetime-123',
        user_id: mockUser.id,
        created_at: '2024-01-15T10:00:00Z',
        lemon_squeezy_id: 'ls_sub_lifetime_123',
        status: SubscriptionStatus.ACTIVE,
        tier: SubscriptionTier.LIFETIME_LAUNCH,
        tier_name: 'Lifetime Launch',
        current_period_start: '2024-01-15T10:00:00Z',
        current_period_end: '2099-12-31T23:59:59Z',
        cancel_at: null,
        credits_limit: 1000,
        credits_used: 75,
        credits_reset_date: '2024-12-01T10:00:00Z',
        validity_days: null,
    },
    [SubscriptionTier.FREE]: {
        id: 'sub-free-123',
        user_id: mockUser.id,
        created_at: '2024-11-20T10:00:00Z',
        lemon_squeezy_id: 'free_mock-user-id-123',
        status: SubscriptionStatus.ACTIVE,
        tier: SubscriptionTier.FREE,
        tier_name: 'Free Plan',
        current_period_start: '2024-11-20T10:00:00Z',
        current_period_end: '2024-11-30T10:00:00Z',
        cancel_at: null,
        credits_limit: 50,
        credits_used: 5,
        credits_reset_date: '2024-11-30T10:00:00Z',
        validity_days: 10,
    },
    [SubscriptionTier.BASIC_MONTHLY]: {
        id: 'sub-basic-monthly-123',
        user_id: mockUser.id,
        created_at: '2024-11-01T10:00:00Z',
        lemon_squeezy_id: 'ls_sub_basic_monthly_123',
        status: SubscriptionStatus.ACTIVE,
        tier: SubscriptionTier.BASIC_MONTHLY,
        tier_name: 'Basic Monthly',
        current_period_start: '2024-11-01T10:00:00Z',
        current_period_end: '2024-12-01T10:00:00Z',
        cancel_at: null,
        credits_limit: 350,
        credits_used: 100,
        credits_reset_date: '2024-12-01T10:00:00Z',
        validity_days: null,
    },
    [SubscriptionTier.BUSINESS_MONTHLY]: {
        id: 'sub-business-monthly-123',
        user_id: mockUser.id,
        created_at: '2024-11-01T10:00:00Z',
        lemon_squeezy_id: 'ls_sub_business_monthly_123',
        status: SubscriptionStatus.ACTIVE,
        tier: SubscriptionTier.BUSINESS_MONTHLY,
        tier_name: 'Business Monthly',
        current_period_start: '2024-11-01T10:00:00Z',
        current_period_end: '2024-12-01T10:00:00Z',
        cancel_at: null,
        credits_limit: 1500,
        credits_used: 300,
        credits_reset_date: '2024-12-01T10:00:00Z',
        validity_days: null,
    },
    [SubscriptionTier.BASIC_ANNUAL]: {
        id: 'sub-basic-annual-123',
        user_id: mockUser.id,
        created_at: '2024-01-01T10:00:00Z',
        lemon_squeezy_id: 'ls_sub_basic_annual_123',
        status: SubscriptionStatus.ACTIVE,
        tier: SubscriptionTier.BASIC_ANNUAL,
        tier_name: 'Basic Annual',
        current_period_start: '2024-01-01T10:00:00Z',
        current_period_end: '2025-01-01T10:00:00Z',
        cancel_at: null,
        credits_limit: 350,
        credits_used: 100,
        credits_reset_date: '2024-12-01T10:00:00Z',
        validity_days: null,
    },
    [SubscriptionTier.PRO_ANNUAL]: {
        id: 'sub-pro-annual-123',
        user_id: mockUser.id,
        created_at: '2024-01-01T10:00:00Z',
        lemon_squeezy_id: 'ls_sub_pro_annual_123',
        status: SubscriptionStatus.ACTIVE,
        tier: SubscriptionTier.PRO_ANNUAL,
        tier_name: 'Pro Annual',
        current_period_start: '2024-01-01T10:00:00Z',
        current_period_end: '2025-01-01T10:00:00Z',
        cancel_at: null,
        credits_limit: 700,
        credits_used: 150,
        credits_reset_date: '2024-12-01T10:00:00Z',
        validity_days: null,
    },
    [SubscriptionTier.BUSINESS_ANNUAL]: {
        id: 'sub-business-annual-123',
        user_id: mockUser.id,
        created_at: '2024-01-01T10:00:00Z',
        lemon_squeezy_id: 'ls_sub_business_annual_123',
        status: SubscriptionStatus.ACTIVE,
        tier: SubscriptionTier.BUSINESS_ANNUAL,
        tier_name: 'Business Annual',
        current_period_start: '2024-01-01T10:00:00Z',
        current_period_end: '2025-01-01T10:00:00Z',
        cancel_at: null,
        credits_limit: 1500,
        credits_used: 300,
        credits_reset_date: '2024-12-01T10:00:00Z',
        validity_days: null,
    },
}

// Default to monthly subscription for mock
export const mockSubscription = mockSubscriptions[SubscriptionTier.PRO_MONTHLY]

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
