import { z } from 'zod'
import { EnhancementMode, SubscriptionTier } from './database'

// =============================================================================
// API REQUEST/RESPONSE TYPES
// =============================================================================

// Enhancement API
export const EnhanceRequestSchema = z.object({
    text: z.string().min(1).max(10000),
    mode: z.nativeEnum(EnhancementMode).optional().default(EnhancementMode.ENHANCE),
    /** @deprecated Legacy ISO code; optional */
    language: z.string().min(2).max(10).optional(),
    outputLanguage: z
        .enum(['ar_gulf', 'ar_msa', 'en'])
        .optional()
        .default('ar_gulf'),
    tone: z.enum(['emotional', 'marketing', 'exclusive']).optional().default('marketing'),
    platform: z
        .enum(['store', 'whatsapp', 'instagram', 'facebook', 'snap', 'tiktok'])
        .optional()
        .default('store'),
    strength: z.number().min(1).max(5).optional().default(5),
    isEditorSession: z.boolean().optional().default(false),
    isGuest: z.boolean().optional().default(false),
    /** When true (or Accept: text/event-stream), response is SSE — see lib/api/enhance-sse.ts */
    stream: z.boolean().optional().default(false),
})

export const RETRY_REASON_VALUES = [
    'too_robotic',
    'wrong_platform',
    'wrong_tone',
    'missing_something',
    'other',
] as const

export type RetryReasonValue = (typeof RETRY_REASON_VALUES)[number]

export const EnhanceRetryRequestSchema = z.object({
    parentLogId: z.string().uuid(),
    retryReason: z.enum(RETRY_REASON_VALUES),
    retryReasonOther: z.string().max(500).optional(),
    text: z.string().min(1).max(10000),
    outputLanguage: z.enum(['ar_gulf', 'ar_msa', 'en']).default('ar_gulf'),
    tone: z.enum(['emotional', 'marketing', 'exclusive']).default('marketing'),
    platform: z
        .enum(['store', 'whatsapp', 'instagram', 'facebook', 'snap', 'tiktok'])
        .default('store'),
    strength: z.number().min(1).max(5).optional().default(5),
})

export type EnhanceRetryRequest = z.infer<typeof EnhanceRetryRequestSchema>

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

// Usage Stats API
export interface UsageStatsResponse {
    success: boolean
    data?: {
        currentPeriod: {
            start: string
            end: string
            enhancementsUsed: number
            enhancementsLimit: number
        }
        history: {
            date: string
            count: number
        }[]
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
    RETRY_ALREADY_USED = 'RETRY_ALREADY_USED',
    RETRY_NOT_ALLOWED = 'RETRY_NOT_ALLOWED',
    CONTENT_BLOCKED = 'CONTENT_BLOCKED',

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
