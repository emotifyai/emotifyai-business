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
        trial_started_at: '2024-11-20T10:00:00Z',
        trial_expires_at: '2024-12-20T10:00:00Z',
        monthly_quota: 50,
        quota_used_this_month: 10,
        quota_reset_at: '2024-12-20T10:00:00Z',
        cache_enabled: false,
        tier_name: 'Trial',
        credits_limit: 50,
        credits_used: 10,
        credits_reset_date: '2024-12-20T10:00:00Z',
        validity_days: 30,
    },
    [SubscriptionTier.PRO_MONTHLY]: {
        id: 'sub-monthly-123',
        user_id: mockUser.id,
        created_at: '2024-11-01T10:00:00Z',
        updated_at: '2024-11-27T12:00:00Z',
        lemon_squeezy_id: 'ls_sub_monthly_123',
        status: SubscriptionStatus.ACTIVE,
        tier: SubscriptionTier.PRO_MONTHLY,
        current_period_start: '2024-11-01T10:00:00Z',
        current_period_end: '2024-12-01T10:00:00Z',
        cancel_at: null,
        trial_started_at: null,
        trial_expires_at: null,
        monthly_quota: 700,
        quota_used_this_month: 150,
        quota_reset_at: '2024-12-01T10:00:00Z',
        cache_enabled: true,
        tier_name: 'Pro Monthly',
        credits_limit: 700,
        credits_used: 150,
        credits_reset_date: '2024-12-01T10:00:00Z',
        validity_days: null,
    },
    [SubscriptionTier.LIFETIME_LAUNCH]: {
        id: 'sub-lifetime-123',
        user_id: mockUser.id,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-11-27T12:00:00Z',
        lemon_squeezy_id: 'ls_sub_lifetime_123',
        status: SubscriptionStatus.ACTIVE,
        tier: SubscriptionTier.LIFETIME_LAUNCH,
        current_period_start: '2024-01-15T10:00:00Z',
        current_period_end: '2099-12-31T23:59:59Z',
        cancel_at: null,
        trial_started_at: null,
        trial_expires_at: null,
        monthly_quota: 500,
        quota_used_this_month: 75,
        quota_reset_at: '2024-12-01T10:00:00Z',
        cache_enabled: true,
        tier_name: 'Lifetime Launch',
        credits_limit: 500,
        credits_used: 75,
        credits_reset_date: '2024-12-01T10:00:00Z',
        validity_days: null,
    },
    [SubscriptionTier.FREE]: {
        id: 'sub-free-123',
        user_id: mockUser.id,
        created_at: '2024-11-20T10:00:00Z',
        updated_at: '2024-11-27T12:00:00Z',
        lemon_squeezy_id: 'free_mock-user-id-123',
        status: SubscriptionStatus.ACTIVE,
        tier: SubscriptionTier.FREE,
        current_period_start: '2024-11-20T10:00:00Z',
        current_period_end: '2024-11-30T10:00:00Z',
        cancel_at: null,
        trial_started_at: null,
        trial_expires_at: null,
        monthly_quota: 50,
        quota_used_this_month: 5,
        quota_reset_at: '2024-11-30T10:00:00Z',
        cache_enabled: false,
        tier_name: 'Free Plan',
        credits_limit: 50,
        credits_used: 5,
        credits_reset_date: '2024-11-30T10:00:00Z',
        validity_days: 10,
    },
    [SubscriptionTier.BASIC_MONTHLY]: {
        id: 'sub-basic-monthly-123',
        user_id: mockUser.id,
        created_at: '2024-11-01T10:00:00Z',
        updated_at: '2024-11-27T12:00:00Z',
        lemon_squeezy_id: 'ls_sub_basic_monthly_123',
        status: SubscriptionStatus.ACTIVE,
        tier: SubscriptionTier.BASIC_MONTHLY,
        current_period_start: '2024-11-01T10:00:00Z',
        current_period_end: '2024-12-01T10:00:00Z',
        cancel_at: null,
        trial_started_at: null,
        trial_expires_at: null,
        monthly_quota: 350,
        quota_used_this_month: 100,
        quota_reset_at: '2024-12-01T10:00:00Z',
        cache_enabled: true,
        tier_name: 'Basic Monthly',
        credits_limit: 350,
        credits_used: 100,
        credits_reset_date: '2024-12-01T10:00:00Z',
        validity_days: null,
    },
    [SubscriptionTier.BUSINESS_MONTHLY]: {
        id: 'sub-business-monthly-123',
        user_id: mockUser.id,
        created_at: '2024-11-01T10:00:00Z',
        updated_at: '2024-11-27T12:00:00Z',
        lemon_squeezy_id: 'ls_sub_business_monthly_123',
        status: SubscriptionStatus.ACTIVE,
        tier: SubscriptionTier.BUSINESS_MONTHLY,
        current_period_start: '2024-11-01T10:00:00Z',
        current_period_end: '2024-12-01T10:00:00Z',
        cancel_at: null,
        trial_started_at: null,
        trial_expires_at: null,
        monthly_quota: 1500,
        quota_used_this_month: 300,
        quota_reset_at: '2024-12-01T10:00:00Z',
        cache_enabled: true,
        tier_name: 'Business Monthly',
        credits_limit: 1500,
        credits_used: 300,
        credits_reset_date: '2024-12-01T10:00:00Z',
        validity_days: null,
    },
    [SubscriptionTier.BASIC_ANNUAL]: {
        id: 'sub-basic-annual-123',
        user_id: mockUser.id,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-11-27T12:00:00Z',
        lemon_squeezy_id: 'ls_sub_basic_annual_123',
        status: SubscriptionStatus.ACTIVE,
        tier: SubscriptionTier.BASIC_ANNUAL,
        current_period_start: '2024-01-01T10:00:00Z',
        current_period_end: '2025-01-01T10:00:00Z',
        cancel_at: null,
        trial_started_at: null,
        trial_expires_at: null,
        monthly_quota: 350,
        quota_used_this_month: 100,
        quota_reset_at: '2024-12-01T10:00:00Z',
        cache_enabled: true,
        tier_name: 'Basic Annual',
        credits_limit: 350,
        credits_used: 100,
        credits_reset_date: '2024-12-01T10:00:00Z',
        validity_days: null,
    },
    [SubscriptionTier.PRO_ANNUAL]: {
        id: 'sub-pro-annual-123',
        user_id: mockUser.id,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-11-27T12:00:00Z',
        lemon_squeezy_id: 'ls_sub_pro_annual_123',
        status: SubscriptionStatus.ACTIVE,
        tier: SubscriptionTier.PRO_ANNUAL,
        current_period_start: '2024-01-01T10:00:00Z',
        current_period_end: '2025-01-01T10:00:00Z',
        cancel_at: null,
        trial_started_at: null,
        trial_expires_at: null,
        monthly_quota: 700,
        quota_used_this_month: 150,
        quota_reset_at: '2024-12-01T10:00:00Z',
        cache_enabled: true,
        tier_name: 'Pro Annual',
        credits_limit: 700,
        credits_used: 150,
        credits_reset_date: '2024-12-01T10:00:00Z',
        validity_days: null,
    },
    [SubscriptionTier.BUSINESS_ANNUAL]: {
        id: 'sub-business-annual-123',
        user_id: mockUser.id,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-11-27T12:00:00Z',
        lemon_squeezy_id: 'ls_sub_business_annual_123',
        status: SubscriptionStatus.ACTIVE,
        tier: SubscriptionTier.BUSINESS_ANNUAL,
        current_period_start: '2024-01-01T10:00:00Z',
        current_period_end: '2025-01-01T10:00:00Z',
        cancel_at: null,
        trial_started_at: null,
        trial_expires_at: null,
        monthly_quota: 1500,
        quota_used_this_month: 300,
        quota_reset_at: '2024-12-01T10:00:00Z',
        cache_enabled: true,
        tier_name: 'Business Annual',
        credits_limit: 1500,
        credits_used: 300,
        credits_reset_date: '2024-12-01T10:00:00Z',
        validity_days: null,
    },
}

// Default to monthly subscription for mock
export const mockSubscription = mockSubscriptions[SubscriptionTier.PRO_MONTHLY]

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
        cached: false,
        tokens_saved: null,
        credits_consumed: 1,
    },
    {
        id: 'log-2',
        user_id: mockUser.id,
        created_at: '2024-11-27T09:30:00Z',
        input_text: 'hello world',
        output_text: 'Greetings, world!',
        language: 'en',
        mode: EnhancementMode.ENHANCE,
        tokens_used: 38,
        success: true,
        error_message: null,
        cached: false,
        tokens_saved: null,
        credits_consumed: 1,
    },
    {
        id: 'log-3',
        user_id: mockUser.id,
        created_at: '2024-11-26T15:00:00Z',
        input_text: 'complex technical jargon',
        output_text: 'Simple easy words',
        language: 'en',
        mode: EnhancementMode.ENHANCE,
        tokens_used: 45,
        success: true,
        error_message: null,
        cached: false,
        tokens_saved: null,
        credits_consumed: 1,
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
