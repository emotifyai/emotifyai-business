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
                }
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

export enum SubscriptionTier {
    TRIAL = 'trial',
    MONTHLY = 'monthly',
    LIFETIME = 'lifetime',
}

export enum EnhancementMode {
    ENHANCE = 'enhance',
    REPHRASE = 'rephrase',
    SIMPLIFY = 'simplify',
    EXPAND = 'expand',
}

// =============================================================================
// TYPE HELPERS
// =============================================================================

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type UsageLog = Database['public']['Tables']['usage_logs']['Row']
export type ApiKey = Database['public']['Tables']['api_keys']['Row']

export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert']
export type UsageLogInsert = Database['public']['Tables']['usage_logs']['Insert']
export type ApiKeyInsert = Database['public']['Tables']['api_keys']['Insert']

export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update']
export type UsageLogUpdate = Database['public']['Tables']['usage_logs']['Update']
export type ApiKeyUpdate = Database['public']['Tables']['api_keys']['Update']
