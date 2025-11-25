import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { canMakeEnhancement } from '@/lib/subscription/validation'
import { enhanceText, mockEnhanceText } from '@/lib/ai/claude'
import { detectLanguage, validateOutputQuality, isLanguageSupported } from '@/lib/ai/language-detection'
import { EnhanceRequestSchema, ApiErrorCode } from '@/types/api'

const USE_MOCK = process.env.MOCK_AI_RESPONSES === 'true'

export async function POST(request: NextRequest) {
    try {
        // Get the authenticated user
        const supabase = await createClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ApiErrorCode.UNAUTHORIZED,
                        message: 'Authentication required',
                    },
                },
                { status: 401 }
            )
        }

        // Parse and validate request body
        const body = await request.json()
        const validation = EnhanceRequestSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ApiErrorCode.INVALID_REQUEST,
                        message: 'Invalid request data',
                    },
                },
                { status: 400 }
            )
        }

        const { text, mode, language: requestedLanguage, tone } = validation.data

        // Detect language if not provided
        const language = requestedLanguage || detectLanguage(text)

        // Check if language is supported
        if (!isLanguageSupported(language)) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ApiErrorCode.UNSUPPORTED_LANGUAGE,
                        message: `Language '${language}' is not fully supported. Supported languages: English, Arabic, French.`,
                    },
                },
                { status: 400 }
            )
        }

        // Check subscription and usage limits
        const canEnhance = await canMakeEnhancement(user.id)
        if (!canEnhance.allowed) {
            const errorMessages: Record<string, { code: ApiErrorCode; message: string }> = {
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

            const error = errorMessages[canEnhance.reason || 'NO_SUBSCRIPTION']

            return NextResponse.json(
                {
                    success: false,
                    error,
                },
                { status: 403 }
            )
        }

        // Enhance the text using AI
        const enhanceOptions = {
            text,
            mode,
            language,
            tone,
        }

        const result = USE_MOCK
            ? await mockEnhanceText(enhanceOptions)
            : await enhanceText(enhanceOptions)

        // Validate output quality
        const qualityCheck = validateOutputQuality(text, result.enhancedText, language)
        if (!qualityCheck.isValid) {
            // Log the failed attempt
            await supabase.from('usage_logs').insert({
                user_id: user.id,
                input_text: text,
                output_text: result.enhancedText,
                language,
                mode,
                tokens_used: result.tokensUsed,
                success: false,
                error_message: qualityCheck.reason,
            })

            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ApiErrorCode.QUALITY_CHECK_FAILED,
                        message: 'The AI output did not meet quality standards. Please try again.',
                    },
                },
                { status: 500 }
            )
        }

        // Log successful usage
        await supabase.from('usage_logs').insert({
            user_id: user.id,
            input_text: text,
            output_text: result.enhancedText,
            language,
            mode,
            tokens_used: result.tokensUsed,
            success: true,
        })

        // Return successful response
        return NextResponse.json({
            success: true,
            data: {
                enhancedText: result.enhancedText,
                tokensUsed: result.tokensUsed,
                language: result.language,
            },
        })
    } catch (error) {
        console.error('Enhancement API error:', error)

        // Handle specific error types
        if (error instanceof Error) {
            if (error.message === 'RATE_LIMIT_EXCEEDED') {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: ApiErrorCode.RATE_LIMIT_EXCEEDED,
                            message: 'Rate limit exceeded. Please try again later.',
                        },
                    },
                    { status: 429 }
                )
            }

            if (error.message === 'AI_SERVICE_ERROR') {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: ApiErrorCode.AI_SERVICE_ERROR,
                            message: 'AI service is temporarily unavailable. Please try again.',
                        },
                    },
                    { status: 503 }
                )
            }
        }

        // Generic error response
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: ApiErrorCode.INTERNAL_ERROR,
                    message: 'An unexpected error occurred',
                },
            },
            { status: 500 }
        )
    }
}
