import { NextRequest, NextResponse } from 'next/server'
import { enhanceText, mockEnhanceText, EnhanceOptions } from '@/lib/ai/claude'
import { detectLanguage, validateOutputQuality, isLanguageSupported } from '@/lib/ai/language-detection'
import { EnhanceRequestSchema, ApiErrorCode } from '@/types/api'

const USE_MOCK = process.env.MOCK_AI_RESPONSES === 'true'

type ErrorResponse = {
    code: ApiErrorCode
    message: string
}

function createErrorResponse(error: ErrorResponse, status: number) {
    return NextResponse.json({ success: false, error }, { status })
}

function createSuccessResponse(data: { enhancedText: string; tokensUsed: number; language: string }) {
    return NextResponse.json({ success: true, data })
}

export async function POST(request: NextRequest) {
    try {
        // Skip authentication for testing
        if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
            return createErrorResponse({ 
                code: ApiErrorCode.UNAUTHORIZED, 
                message: 'Test endpoint only available in development' 
            }, 403)
        }

        const body = await request.json()
        const validation = EnhanceRequestSchema.safeParse(body)

        if (!validation.success) {
            return createErrorResponse({ 
                code: ApiErrorCode.INVALID_REQUEST, 
                message: 'Invalid request data' 
            }, 400)
        }

        const { text, language: requestedLanguage, tone } = validation.data
        const language = requestedLanguage || detectLanguage(text)

        if (!isLanguageSupported(language)) {
            return createErrorResponse({
                code: ApiErrorCode.UNSUPPORTED_LANGUAGE,
                message: `Language '${language}' is not supported`
            }, 400)
        }

        const enhanceOptions: EnhanceOptions = { text, language, tone }
        const result = USE_MOCK ? await mockEnhanceText(enhanceOptions) : await enhanceText(enhanceOptions)

        const qualityCheck = validateOutputQuality(text, result.enhancedText, language)
        if (!qualityCheck.isValid) {
            return createErrorResponse({
                code: ApiErrorCode.QUALITY_CHECK_FAILED,
                message: 'Quality check failed'
            }, 500)
        }

        return createSuccessResponse({
            enhancedText: result.enhancedText,
            tokensUsed: result.tokensUsed,
            language: result.language
        })
    } catch (error) {
        console.error('Test Enhancement API error:', error)
        return createErrorResponse({ 
            code: ApiErrorCode.INTERNAL_ERROR, 
            message: 'Internal error' 
        }, 500)
    }
}