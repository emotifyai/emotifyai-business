// =============================================================================
// DATABASE TYPES
// =============================================================================
// These types represent the database schema
// In production, generate these with: npx supabase gen types typescript

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string
                    email: string
                    display_name: string | null
                    avatar_url: string | null
                }
                Insert: {
                    id: string
                    created_at?: string
                    updated_at?: string
                    email: string
                    display_name?: string | null
                    avatar_url?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    email?: string
                    display_name?: string | null
                    avatar_url?: string | null
                }
                Relationships: []
            }
            subscriptions: {
                Row: {
                    id: string
                    user_id: string
                    created_at: string
                    updated_at: string
                    lemon_squeezy_id: string
                    status: SubscriptionStatus
                    tier: SubscriptionTier
                    current_period_start: string
                    current_period_end: string
                    cancel_at: string | null
                    // Legacy quota columns (maintained for compatibility)
                    trial_started_at: string | null
                    trial_expires_at: string | null
                    monthly_quota: number | null
                    quota_used_this_month: number | null
                    quota_reset_at: string | null
                    cache_enabled: boolean | null
                    // New credit-based columns
                    tier_name: string | null
                    credits_limit: number
                    credits_used: number
                    credits_reset_date: string | null
                    validity_days: number | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    created_at?: string
                    updated_at?: string
                    lemon_squeezy_id: string
                    status: SubscriptionStatus
                    tier: SubscriptionTier
                    current_period_start: string
                    current_period_end: string
                    cancel_at?: string | null
                    trial_started_at?: string | null
                    trial_expires_at?: string | null
                    monthly_quota?: number | null
                    quota_used_this_month?: number | null
                    quota_reset_at?: string | null
                    cache_enabled?: boolean | null
                    tier_name?: string | null
                    credits_limit?: number
                    credits_used?: number
                    credits_reset_date?: string | null
                    validity_days?: number | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    created_at?: string
                    updated_at?: string
                    lemon_squeezy_id?: string
                    status?: SubscriptionStatus
                    tier?: SubscriptionTier
                    current_period_start?: string
                    current_period_end?: string
                    cancel_at?: string | null
                    trial_started_at?: string | null
                    trial_expires_at?: string | null
                    monthly_quota?: number | null
                    quota_used_this_month?: number | null
                    quota_reset_at?: string | null
                    cache_enabled?: boolean | null
                    tier_name?: string | null
                    credits_limit?: number
                    credits_used?: number
                    credits_reset_date?: string | null
                    validity_days?: number | null
                }
                Relationships: []
            }
            usage_logs: {
                Row: {
                    id: string
                    user_id: string
                    created_at: string
                    input_text: string
                    output_text: string
                    language: string
                    mode: EnhancementMode
                    tokens_used: number
                    success: boolean
                    error_message: string | null
                    // Legacy cache columns
                    cached: boolean | null
                    tokens_saved: number | null
                    // New credit tracking
                    credits_consumed: number
                    // New editor session fields
                    editor_session_id: string | null
                    is_editor_session: boolean | null
                    tone: string | null
                    output_language: string | null
                    platform: string | null
                    detected_route: string | null
                    retry_used: boolean
                    is_retry: boolean
                }
                Insert: {
                    id?: string
                    user_id: string
                    created_at?: string
                    input_text: string
                    output_text: string
                    language: string
                    mode: EnhancementMode
                    tokens_used: number
                    success: boolean
                    error_message?: string | null
                    cached?: boolean | null
                    tokens_saved?: number | null
                    credits_consumed?: number
                    editor_session_id?: string | null
                    is_editor_session?: boolean | null
                    tone?: string | null
                    output_language?: string | null
                    platform?: string | null
                    detected_route?: string | null
                    retry_used?: boolean
                    is_retry?: boolean
                }
                Update: {
                    id?: string
                    user_id?: string
                    created_at?: string
                    input_text?: string
                    output_text?: string
                    language?: string
                    mode?: EnhancementMode
                    tokens_used?: number
                    success?: boolean
                    error_message?: string | null
                    cached?: boolean | null
                    tokens_saved?: number | null
                    credits_consumed?: number
                    editor_session_id?: string | null
                    is_editor_session?: boolean | null
                    tone?: string | null
                    retry_used?: boolean
                    is_retry?: boolean
                    output_language?: string | null
                    platform?: string | null
                    detected_route?: string | null
                }
                Relationships: []
            }
            retries: {
                Row: {
                    id: string
                    user_id: string
                    usage_log_id: string
                    created_at: string
                    retry_reason: string
                    retry_reason_other: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    usage_log_id: string
                    created_at?: string
                    retry_reason: string
                    retry_reason_other?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    usage_log_id?: string
                    created_at?: string
                    retry_reason?: string
                    retry_reason_other?: string | null
                }
                Relationships: []
            }
            api_keys: {
                Row: {
                    id: string
                    user_id: string
                    created_at: string
                    key_hash: string
                    name: string
                    last_used_at: string | null
                    revoked: boolean
                }
                Insert: {
                    id?: string
                    user_id: string
                    created_at?: string
                    key_hash: string
                    name: string
                    last_used_at?: string | null
                    revoked?: boolean
                }
                Update: {
                    id?: string
                    user_id?: string
                    created_at?: string
                    key_hash?: string
                    name?: string
                    last_used_at?: string | null
                    revoked?: boolean
                }
                Relationships: []
            }
            lifetime_subscribers: {
                Row: {
                    id: string
                    user_id: string
                    subscriber_number: number
                    subscribed_at: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    subscriber_number: number
                    subscribed_at?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    subscriber_number?: number
                    subscribed_at?: string
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            get_lifetime_slot_info: {
                Args: Record<string, never>
                Returns: {
                    total: number
                    used: number
                    remaining: number
                    percentage: number
                }
            }
            reserve_lifetime_slot: {
                Args: Record<string, never>
                Returns: boolean
            }
            is_lifetime_offer_available: {
                Args: Record<string, never>
                Returns: boolean
            }
            get_lifetime_offer_status: {
                Args: Record<string, never>
                Returns: Json
            }
            consume_credits: {
                Args: {
                    user_uuid: string
                    credits_to_consume?: number
                }
                Returns: boolean
            }
            can_use_credits: {
                Args: {
                    user_uuid: string
                }
                Returns: boolean
            }
            get_user_credit_status: {
                Args: {
                    user_uuid: string
                }
                Returns: {
                    tier_name: string
                    credits_limit: number
                    credits_used: number
                    credits_remaining: number
                    credits_reset_date: string
                    validity_days: number
                    is_expired: boolean
                    can_use: boolean
                }
            }
        }
        Enums: {
            subscription_status: SubscriptionStatus
            subscription_tier: SubscriptionTier
            enhancement_mode: EnhancementMode
        }
    }
}

// =============================================================================
// ENUMS
// =============================================================================

export enum SubscriptionStatus {
    ACTIVE = 'active',
    CANCELLED = 'cancelled',
    EXPIRED = 'expired',
    PAST_DUE = 'past_due',
    PAUSED = 'paused',
    TRIAL = 'trial',
}

/**
 * Unified Subscription Tier System
 * Credit-based model with monthly generation limits
 */
export enum SubscriptionTier {
    TRIAL = 'trial',
    FREE = 'free',
    LIFETIME_LAUNCH = 'lifetime_launch',
    BASIC_MONTHLY = 'basic_monthly',
    PRO_MONTHLY = 'pro_monthly',
    BUSINESS_MONTHLY = 'business_monthly',
    BASIC_ANNUAL = 'basic_annual',
    PRO_ANNUAL = 'pro_annual',
    BUSINESS_ANNUAL = 'business_annual',
    SMALL_BUNDLE = 'small_bundle',
    LARGE_BUNDLE = 'large_bundle',
}

/**
 * Enhancement Mode - Single mode only
 */
export enum EnhancementMode {
    ENHANCE = 'enhance',
}

// =============================================================================
// TYPE HELPERS
// =============================================================================

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type UsageLog = Database['public']['Tables']['usage_logs']['Row']
export type Retry = Database['public']['Tables']['retries']['Row']
export type ApiKey = Database['public']['Tables']['api_keys']['Row']
export type LifetimeSubscriber = Database['public']['Tables']['lifetime_subscribers']['Row']

export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert']
export type UsageLogInsert = Database['public']['Tables']['usage_logs']['Insert']
export type RetryInsert = Database['public']['Tables']['retries']['Insert']
export type ApiKeyInsert = Database['public']['Tables']['api_keys']['Insert']
export type LifetimeSubscriberInsert = Database['public']['Tables']['lifetime_subscribers']['Insert']

export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update']
export type UsageLogUpdate = Database['public']['Tables']['usage_logs']['Update']
export type ApiKeyUpdate = Database['public']['Tables']['api_keys']['Update']
export type LifetimeSubscriberUpdate = Database['public']['Tables']['lifetime_subscribers']['Update']
