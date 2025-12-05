import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { canMakeEnhancement } from '@/lib/subscription/validation'
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

async function authenticateUser() {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return { error: createErrorResponse({ code: ApiErrorCode.UNAUTHORIZED, message: 'Authentication required' }, 401) }
    }

    return { user, supabase }
}

export async function POST(request: NextRequest) {
    try {
        const authResult = await authenticateUser()
        if ('error' in authResult) {
            return authResult.error
        }

        const { user, supabase } = authResult
        const body = await request.json()
        const validation = EnhanceRequestSchema.safeParse(body)

        if (!validation.success) {
            return createErrorResponse({ code: ApiErrorCode.INVALID_REQUEST, message: 'Invalid request data' }, 400)
        }

        const { text, language: requestedLanguage, tone } = validation.data
        const language = requestedLanguage || detectLanguage(text)

        if (!isLanguageSupported(language)) {
            return createErrorResponse({
                code: ApiErrorCode.UNSUPPORTED_LANGUAGE,
                message: `Language '${language}' is not supported`
            }, 400)
        }

        const canEnhance = await canMakeEnhancement(user.id)
        if (!canEnhance.allowed) {
            return createErrorResponse({
                code: ApiErrorCode.USAGE_LIMIT_EXCEEDED,
                message: 'Usage limit exceeded'
            }, 403)
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

        await supabase.from('usage_logs').insert({
            user_id: user.id,
            input_text: text,
            output_text: result.enhancedText,
            language,
            tokens_used: result.tokensUsed,
            success: true
        })

        return createSuccessResponse({
            enhancedText: result.enhancedText,
            tokensUsed: result.tokensUsed,
            language: result.language
        })
    } catch (error) {
        console.error('Enhancement API error:', error)
        return createErrorResponse({ code: ApiErrorCode.INTERNAL_ERROR, message: 'Internal error' }, 500)
    }
}
