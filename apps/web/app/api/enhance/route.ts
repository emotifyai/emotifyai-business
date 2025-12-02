import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { canMakeEnhancement } from '@/lib/subscription/validation'
import { enhanceText, mockEnhanceText } from '@/lib/ai/claude'
import { detectLanguage, validateOutputQuality, isLanguageSupported } from '@/lib/ai/language-detection'
import { EnhanceRequestSchema, ApiErrorCode } from '@/types/api'

// ============================================================================
// Constants
// ============================================================================

const USE_MOCK = process.env.MOCK_AI_RESPONSES === 'true'

const SUBSCRIPTION_ERROR_MESSAGES: Record<string, { code: ApiErrorCode; message: string }> = {
    NO_SUBSCRIPTION: {
        code: ApiErrorCode.NO_SUBSCRIPTION,
        message: 'No active subscription found',
    },
    SUBSCRIPTION_INACTIVE: {
        code: ApiErrorCode.SUBSCRIPTION_EXPIRED,
        message: 'Your subscription is not active',
    },
    USAGE_LIMIT_EXCEEDED: {
        code: ApiErrorCode.USAGE_LIMIT_EXCEEDED,
        message: 'You have reached your usage limit for this period',
    },
}

// ============================================================================
// Types
// ============================================================================

type ErrorResponse = {
    code: ApiErrorCode
    message: string
}

type EnhanceOptions = {
    text: string
    mode: string
    language: string
    tone?: string
}

type UsageLog = {
    user_id: string
    input_text: string
    output_text: string
    language: string
    mode: string
    tokens_used: number
    success: boolean
    error_message?: string
}

// ============================================================================
// Response Builders
// ============================================================================

function createErrorResponse(error: ErrorResponse, status: number) {
    return NextResponse.json(
        {
            success: false,
            error,
        },
        { status }
    )
}

function createSuccessResponse(data: {
    enhancedText: string
    tokensUsed: number
    language: string
}) {
    return NextResponse.json({
        success: true,
        data,
    })
}

// ============================================================================
// Authentication
// ============================================================================

async function authenticateUser() {
    const supabase = await createClient()
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        throw createErrorResponse(
            {
                code: ApiErrorCode.UNAUTHORIZED,
                message: 'Authentication required',
            },
            401
        )
    }

    return { user, supabase }
}

// ============================================================================
// Validation
// ============================================================================

function validateRequest(body: unknown) {
    const validation = EnhanceRequestSchema.safeParse(body)

    if (!validation.success) {
        throw createErrorResponse(
            {
                code: ApiErrorCode.INVALID_REQUEST,
                message: 'Invalid request data',
            },
            400
        )
    }

    return validation.data
}

function validateLanguage(language: string) {
    if (!isLanguageSupported(language)) {
        throw createErrorResponse(
            {
                code: ApiErrorCode.UNSUPPORTED_LANGUAGE,
                message: `Language '${language}' is not fully supported. Supported languages: English, Arabic, French.`,
            },
            400
        )
    }
}

async function validateSubscription(userId: string) {
    const canEnhance = await canMakeEnhancement(userId)

    if (!canEnhance.allowed) {
        const error = SUBSCRIPTION_ERROR_MESSAGES[canEnhance.reason || 'NO_SUBSCRIPTION']
        throw createErrorResponse(error, 403)
    }
}

// ============================================================================
// Enhancement Logic
// ============================================================================

async function performEnhancement(options: EnhanceOptions) {
    return USE_MOCK
        ? await mockEnhanceText(options)
        : await enhanceText(options)
}

function validateEnhancementQuality(
    originalText: string,
    enhancedText: string,
    language: string
) {
    const qualityCheck = validateOutputQuality(originalText, enhancedText, language)

    if (!qualityCheck.isValid) {
        throw {
            isQualityIssue: true,
            reason: qualityCheck.reason,
        }
    }
}

// ============================================================================
// Logging
// ============================================================================

async function logUsage(
    supabase: Awaited<ReturnType<typeof createClient>>,
    log: UsageLog
) {
    await supabase.from('usage_logs').insert(log)
}

async function logFailedEnhancement(
    supabase: Awaited<ReturnType<typeof createClient>>,
    userId: string,
    options: EnhanceOptions,
    tokensUsed: number,
    enhancedText: string,
    reason: string
) {
    await logUsage(supabase, {
        user_id: userId,
        input_text: options.text,
        output_text: enhancedText,
        language: options.language,
        mode: options.mode,
        tokens_used: tokensUsed,
        success: false,
        error_message: reason,
    })
}

async function logSuccessfulEnhancement(
    supabase: Awaited<ReturnType<typeof createClient>>,
    userId: string,
    options: EnhanceOptions,
    tokensUsed: number,
    enhancedText: string
) {
    await logUsage(supabase, {
        user_id: userId,
        input_text: options.text,
        output_text: enhancedText,
        language: options.language,
        mode: options.mode,
        tokens_used: tokensUsed,
        success: true,
    })
}

// ============================================================================
// Error Handling
// ============================================================================

function handleKnownError(error: Error) {
    const errorMap: Record<string, { response: ErrorResponse; status: number }> = {
        RATE_LIMIT_EXCEEDED: {
            response: {
                code: ApiErrorCode.RATE_LIMIT_EXCEEDED,
                message: 'Rate limit exceeded. Please try again later.',
            },
            status: 429,
        },
        AI_SERVICE_ERROR: {
            response: {
                code: ApiErrorCode.AI_SERVICE_ERROR,
                message: 'AI service is temporarily unavailable. Please try again.',
            },
            status: 503,
        },
    }

    return errorMap[error.message]
}

function handleUnexpectedError(error: unknown) {
    console.error('Enhancement API error:', error)

    // Handle NextResponse (thrown errors)
    if (error instanceof NextResponse) {
        return error
    }

    // Handle quality check failures
    if (typeof error === 'object' && error !== null && 'isQualityIssue' in error) {
        return createErrorResponse(
            {
                code: ApiErrorCode.QUALITY_CHECK_FAILED,
                message: 'The AI output did not meet quality standards. Please try again.',
            },
            500
        )
    }

    // Handle known error messages
    if (error instanceof Error) {
        const knownError = handleKnownError(error)
        if (knownError) {
            return createErrorResponse(knownError.response, knownError.status)
        }
    }

    // Generic error
    return createErrorResponse(
        {
            code: ApiErrorCode.INTERNAL_ERROR,
            message: 'An unexpected error occurred',
        },
        500
    )
}

// ============================================================================
// Main Handler
// ============================================================================

export async function POST(request: NextRequest) {
    try {
        // Authentication
        const { user, supabase } = await authenticateUser()

        // Parse and validate request
        const body = await request.json()
        const { text, mode, language: requestedLanguage, tone } = validateRequest(body)

        // Language detection and validation
        const language = requestedLanguage || detectLanguage(text)
        validateLanguage(language)

        // Subscription validation
        await validateSubscription(user.id)

        // Prepare enhancement options
        const enhanceOptions: EnhanceOptions = {
            text,
            mode,
            language,
            tone,
        }

        // Perform enhancement
        const result = await performEnhancement(enhanceOptions)

        // Validate quality
        try {
            validateEnhancementQuality(text, result.enhancedText, language)
        } catch (qualityError) {
            await logFailedEnhancement(
                supabase,
                user.id,
                enhanceOptions,
                result.tokensUsed,
                result.enhancedText,
                (qualityError as { reason: string }).reason
            )
            throw qualityError
        }

        // Log successful usage
        await logSuccessfulEnhancement(
            supabase,
            user.id,
            enhanceOptions,
            result.tokensUsed,
            result.enhancedText
        )

        // Return success response
        return createSuccessResponse({
            enhancedText: result.enhancedText,
            tokensUsed: result.tokensUsed,
            language: result.language,
        })
    } catch (error) {
        return handleUnexpectedError(error)
    }
}