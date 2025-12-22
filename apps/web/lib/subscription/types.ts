/**
 * Subscription Tier Definitions
 * 
 * Defines all subscription tiers, their limits, and features
 */

export type SubscriptionTier =
    | 'trial'
    | 'lifetime_launch'
    | 'basic_monthly'
    | 'pro_monthly'
    | 'business_monthly'
    | 'basic_annual'
    | 'pro_annual'
    | 'business_annual';

export type SubscriptionStatus =
    | 'active'
    | 'cancelled'
    | 'expired'
    | 'past_due'
    | 'paused'
    | 'trial';

export interface SubscriptionTierConfig {
    id: SubscriptionTier;
    name: string;
    price: number;
    generations: number;
    duration?: 'month' | 'year' | 'lifetime' | 'trial';
    durationDays?: number; // For trial
    maxSubscribers?: number; // For lifetime launch
    features: string[];
    popular?: boolean;
    badge?: string;
}

/**
 * Complete subscription tier configurations
 */
export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, SubscriptionTierConfig> = {
    trial: {
        id: 'trial',
        name: 'Free Trial',
        price: 0,
        generations: 10,
        duration: 'trial',
        durationDays: 10,
        features: [
            '50 text enhancements',
            '10-day trial period',
            'All languages (EN, AR, FR)',
            'All enhancement modes',
            'Prompt caching enabled'
        ]
    },

    lifetime_launch: {
        id: 'lifetime_launch',
        name: 'Lifetime Launch Offer',
        price: 97,
        generations: 500,
        duration: 'lifetime',
        maxSubscribers: 500,
        features: [
            '500 generations per month',
            'Lifetime access',
            'All languages',
            'Priority support',
            'Prompt caching',
            'Limited to first 500 subscribers'
        ],
        popular: true,
        badge: 'Limited Offer'
    },

    basic_monthly: {
        id: 'basic_monthly',
        name: 'Basic Monthly',
        price: 17,
        generations: 350,
        duration: 'month',
        features: [
            '350 generations per month',
            'All languages',
            'All enhancement modes',
            'Prompt caching',
            'Email support'
        ]
    },

    pro_monthly: {
        id: 'pro_monthly',
        name: 'Pro Monthly',
        price: 37,
        generations: 700,
        duration: 'month',
        features: [
            '700 generations per month',
            'All languages',
            'All enhancement modes',
            'Prompt caching',
            'Priority support',
            'API access'
        ],
        popular: true
    },

    business_monthly: {
        id: 'business_monthly',
        name: 'Business Monthly',
        price: 57,
        generations: 1500,
        duration: 'month',
        features: [
            '1500 generations per month',
            'All languages',
            'All enhancement modes',
            'Prompt caching',
            'Dedicated support',
            'API access',
            'Team features (coming soon)'
        ]
    },

    basic_annual: {
        id: 'basic_annual',
        name: 'Basic Annual',
        price: 153, // 17 * 12 * 0.75
        generations: 350,
        duration: 'year',
        features: [
            '350 generations per month',
            'Save 25% vs monthly',
            'All languages',
            'All enhancement modes',
            'Prompt caching',
            'Email support'
        ]
    },

    pro_annual: {
        id: 'pro_annual',
        name: 'Pro Annual',
        price: 333, // 37 * 12 * 0.75
        generations: 700,
        duration: 'year',
        features: [
            '700 generations per month',
            'Save 25% vs monthly',
            'All languages',
            'All enhancement modes',
            'Prompt caching',
            'Priority support',
            'API access'
        ],
        badge: 'Best Value'
    },

    business_annual: {
        id: 'business_annual',
        name: 'Business Annual',
        price: 513, // 57 * 12 * 0.75
        generations: 1500,
        duration: 'year',
        features: [
            '1500 generations per month',
            'Save 25% vs monthly',
            'All languages',
            'All enhancement modes',
            'Prompt caching',
            'Dedicated support',
            'API access',
            'Team features (coming soon)'
        ]
    }
};

/**
 * Subscription database model
 */
export interface Subscription {
    id: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    lemon_squeezy_id: string;
    status: SubscriptionStatus;
    tier: SubscriptionTier;
    current_period_start: string;
    current_period_end: string;
    cancel_at: string | null;
    trial_started_at: string | null;
    trial_expires_at: string | null;
    monthly_quota: number;
    quota_used_this_month: number;
    quota_reset_at: string | null;
    cache_enabled: boolean;
}

/**
 * Usage quota information
 */
export interface UsageQuota {
    quota: number;
    used: number;
    remaining: number;
    reset_at: string | null;
    percentage_used: number;
}

/**
 * Lifetime slot information
 */
export interface LifetimeSlotInfo {
    total: number;
    used: number;
    remaining: number;
    percentage: number;
    available: boolean;
}

/**
 * Helper functions
 */

/**
 * Get tier configuration by ID
 */
export function getTierConfig(tier: SubscriptionTier): SubscriptionTierConfig {
    return SUBSCRIPTION_TIERS[tier];
}

/**
 * Check if tier is annual
 */
export function isAnnualTier(tier: SubscriptionTier): boolean {
    return tier.endsWith('_annual');
}

/**
 * Check if tier is monthly
 */
export function isMonthlyTier(tier: SubscriptionTier): boolean {
    return tier.endsWith('_monthly');
}

/**
 * Check if tier is lifetime
 */
export function isLifetimeTier(tier: SubscriptionTier): boolean {
    return tier === 'lifetime_launch';
}

/**
 * Check if tier is trial
 */
export function isTrialTier(tier: SubscriptionTier): boolean {
    return tier === 'trial';
}

/**
 * Get monthly equivalent price for annual tiers
 */
export function getMonthlyEquivalent(tier: SubscriptionTier): number {
    const config = getTierConfig(tier);
    if (isAnnualTier(tier)) {
        return Math.round(config.price / 12);
    }
    return config.price;
}

/**
 * Calculate savings for annual tiers
 */
export function calculateAnnualSavings(tier: SubscriptionTier): number {
    if (!isAnnualTier(tier)) return 0;

    const config = getTierConfig(tier);
    const monthlyEquivalent = getMonthlyEquivalent(tier);
    const monthlyTotal = monthlyEquivalent * 12;

    return monthlyTotal - config.price;
}

/**
 * Check if subscription is active
 */
export function isSubscriptionActive(subscription: Subscription): boolean {
    return subscription.status === 'active' || subscription.status === 'trial';
}

/**
 * Check if trial has expired
 */
export function isTrialExpired(subscription: Subscription): boolean {
    if (!subscription.trial_expires_at) return false;
    return new Date(subscription.trial_expires_at) <= new Date();
}

/**
 * Check if quota is exceeded
 */
export function isQuotaExceeded(subscription: Subscription): boolean {
    return subscription.quota_used_this_month >= subscription.monthly_quota;
}

/**
 * Calculate quota percentage
 */
export function calculateQuotaPercentage(subscription: Subscription): number {
    if (subscription.monthly_quota === 0) return 0;
    return Math.round((subscription.quota_used_this_month / subscription.monthly_quota) * 100);
}

/**
 * Get tier display name with badge
 */
export function getTierDisplayName(tier: SubscriptionTier): string {
    const config = getTierConfig(tier);
    return config.badge ? `${config.name} - ${config.badge}` : config.name;
}

/**
 * Sort tiers by price (for pricing page display)
 */
export function getSortedTiers(): SubscriptionTierConfig[] {
    return Object.values(SUBSCRIPTION_TIERS)
        .filter(tier => tier.id !== 'trial') // Exclude trial from pricing page
        .sort((a, b) => {
            // Lifetime first
            if (a.id === 'lifetime_launch') return -1;
            if (b.id === 'lifetime_launch') return 1;

            // Then by price
            return a.price - b.price;
        });
}
