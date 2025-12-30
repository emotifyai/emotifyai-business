export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Enums
export enum SubscriptionStatus {
    ACTIVE = 'active',
    CANCELLED = 'cancelled',
    EXPIRED = 'expired',
    PAST_DUE = 'past_due',
    PAUSED = 'paused',
    TRIAL = 'trial'
}

export enum SubscriptionTier {
    TRIAL = 'trial',
    FREE = 'free',
    LIFETIME_LAUNCH = 'lifetime_launch',
    BASIC_MONTHLY = 'basic_monthly',
    PRO_MONTHLY = 'pro_monthly',
    BUSINESS_MONTHLY = 'business_monthly',
    BASIC_ANNUAL = 'basic_annual',
    PRO_ANNUAL = 'pro_annual',
    BUSINESS_ANNUAL = 'business_annual'
}

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    created_at: string
                    email: string
                    display_name: string | null
                    avatar_url: string | null
                    onboarded: boolean
                }
                Insert: {
                    id: string
                    created_at?: string
                    email: string
                    display_name?: string | null
                    avatar_url?: string | null
                    onboarded?: boolean
                }
                Update: {
                    id?: string
                    created_at?: string
                    email?: string
                    display_name?: string | null
                    avatar_url?: string | null
                    onboarded?: boolean
                }
            }
            subscriptions: {
                Row: {
                    id: string
                    user_id: string
                    created_at: string
                    lemon_squeezy_id: string
                    status: SubscriptionStatus
                    tier: SubscriptionTier
                    tier_name: string | null
                    current_period_start: string
                    current_period_end: string
                    cancel_at: string | null
                    credits_limit: number
                    credits_used: number
                    credits_reset_date: string | null
                    validity_days: number | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    created_at?: string
                    lemon_squeezy_id: string
                    status: SubscriptionStatus
                    tier: SubscriptionTier
                    tier_name?: string | null
                    current_period_start: string
                    current_period_end: string
                    cancel_at?: string | null
                    credits_limit?: number
                    credits_used?: number
                    credits_reset_date?: string | null
                    validity_days?: number | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    created_at?: string
                    lemon_squeezy_id?: string
                    status?: SubscriptionStatus
                    tier?: SubscriptionTier
                    tier_name?: string | null
                    current_period_start?: string
                    current_period_end?: string
                    cancel_at?: string | null
                    credits_limit?: number
                    credits_used?: number
                    credits_reset_date?: string | null
                    validity_days?: number | null
                }
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
            }
            lifetime_subscribers: {
                Row: {
                    id: string
                    user_id: string
                    created_at: string
                    subscriber_number: number
                }
                Insert: {
                    id?: string
                    user_id: string
                    created_at?: string
                    subscriber_number: number
                }
                Update: {
                    id?: string
                    user_id?: string
                    created_at?: string
                    subscriber_number?: number
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            subscription_status: SubscriptionStatus
            subscription_tier: SubscriptionTier
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

// Type helpers
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type ApiKey = Database['public']['Tables']['api_keys']['Row']
export type LifetimeSubscriber = Database['public']['Tables']['lifetime_subscribers']['Row']

export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert']
export type ApiKeyInsert = Database['public']['Tables']['api_keys']['Insert']
export type LifetimeSubscriberInsert = Database['public']['Tables']['lifetime_subscribers']['Insert']

export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update']
export type ApiKeyUpdate = Database['public']['Tables']['api_keys']['Update']
export type LifetimeSubscriberUpdate = Database['public']['Tables']['lifetime_subscribers']['Update']