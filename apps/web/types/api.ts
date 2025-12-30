import { z } from 'zod'
import { SubscriptionTier } from './database'

// =============================================================================
// API REQUEST/RESPONSE TYPES
// =============================================================================

// Enhancement API
export const EnhanceRequestSchema = z.object({
    text: z.string().min(1).max(10000),
    mode: z.literal('enhance'),
    language: z.string().length(2).optional(), // ISO 639-1 code
    tone: z.enum(['formal', 'casual', 'professional']).optional(),
})

export type EnhanceRequest = z.infer<typeof EnhanceRequestSchema>

export interface EnhanceResponse {
    success: boolean
    data?: {
        enhancedText: string
        tokensUsed: number
        language: string
    }
    error?: {
        code: string
        message: string
    }
}

// Subscription API
export interface CheckoutSessionRequest {
    tier: SubscriptionTier
    successUrl?: string
    cancelUrl?: string
}

export interface CheckoutSessionResponse {
    success: boolean
    data?: {
        checkoutUrl: string
    }
    error?: {
        code: string
        message: string
    }
}

export interface CustomerPortalResponse {
    success: boolean
    data?: {
        portalUrl: string
    }
    error?: {
        code: string
        message: string
    }
}

// API Key Management
export const CreateApiKeySchema = z.object({
    name: z.string().min(1).max(100),
})

export type CreateApiKeyRequest = z.infer<typeof CreateApiKeySchema>

export interface CreateApiKeyResponse {
    success: boolean
    data?: {
        id: string
        key: string // Only returned once on creation
        name: string
        createdAt: string
    }
    error?: {
        code: string
        message: string
    }
}

export interface ListApiKeysResponse {
    success: boolean
    data?: {
        id: string
        name: string
        createdAt: string
        lastUsedAt: string | null
        revoked: boolean
    }[]
    error?: {
        code: string
        message: string
    }
}

// =============================================================================
// ERROR CODES
// =============================================================================

export enum ApiErrorCode {
    // Authentication errors
    UNAUTHORIZED = 'UNAUTHORIZED',
    INVALID_API_KEY = 'INVALID_API_KEY',
    SESSION_EXPIRED = 'SESSION_EXPIRED',

    // Subscription errors
    NO_SUBSCRIPTION = 'NO_SUBSCRIPTION',
    SUBSCRIPTION_EXPIRED = 'SUBSCRIPTION_EXPIRED',
    SUBSCRIPTION_CANCELLED = 'SUBSCRIPTION_CANCELLED',

    // Usage errors
    USAGE_LIMIT_EXCEEDED = 'USAGE_LIMIT_EXCEEDED',
    RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

    // Validation errors
    INVALID_REQUEST = 'INVALID_REQUEST',
    TEXT_TOO_LONG = 'TEXT_TOO_LONG',
    UNSUPPORTED_LANGUAGE = 'UNSUPPORTED_LANGUAGE',

    // AI errors
    AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
    QUALITY_CHECK_FAILED = 'QUALITY_CHECK_FAILED',

    // Server errors
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    DATABASE_ERROR = 'DATABASE_ERROR',
}

// =============================================================================
// WEBHOOK TYPES (Lemon Squeezy)
// =============================================================================

export interface LemonSqueezyWebhookPayload {
    meta: {
        event_name: string
        custom_data?: Record<string, unknown>
    }
    data: {
        id: string
        type: string
        attributes: Record<string, unknown>
    }
}

export interface SubscriptionWebhookData {
    id: string
    status: string
    customer_id: string
    product_id: string
    variant_id: string
    user_email: string
    renews_at: string | null
    ends_at: string | null
    trial_ends_at: string | null
}
