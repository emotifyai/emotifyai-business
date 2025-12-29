import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { canMakeEnhancement } from '@/lib/subscription/validation'
import { enhanceText, mockEnhanceText, EnhanceOptions } from '@/lib/ai/claude'
import { detectLanguage, validateOutputQuality, isLanguageSupported } from '@/lib/ai/language-detection'
import { EnhanceRequestSchema, ApiErrorCode } from '@/types/api'
import { EnhancementMode, UsageLogInsert } from '@/types/database'

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
            // If the reason is expired subscription, try to create a new free trial
            if (canEnhance.reason === 'SUBSCRIPTION_EXPIRED' || canEnhance.reason === 'NO_SUBSCRIPTION') {
                try {
                    // Create a new free trial subscription
                    const now = new Date()
                    const freeEnd = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000) // 10 days
                    const { error: createError } = await (supabase
                        .from('subscriptions') as any)
                        .insert({
                            user_id: user.id,
                            lemon_squeezy_id: `free_${user.id}_${Date.now()}`, // Make it unique
                            status: 'trial',
                            tier: 'trial',
                            tier_name: 'free',
                            credits_limit: 10,
                            credits_used: 0,
                            validity_days: 10,
                            current_period_start: now.toISOString(),
                            current_period_end: freeEnd.toISOString(),
                        })
                    
                    if (createError) {
                        return createErrorResponse({
                            code: ApiErrorCode.USAGE_LIMIT_EXCEEDED,
                            message: 'Unable to create free trial'
                        }, 403)
                    }
                    // Continue with the enhancement since we just created a fresh trial
                } catch (error) {
                    return createErrorResponse({
                        code: ApiErrorCode.USAGE_LIMIT_EXCEEDED,
                        message: 'Usage limit exceeded'
                    }, 403)
                }
            } else {
                return createErrorResponse({
                    code: ApiErrorCode.USAGE_LIMIT_EXCEEDED,
                    message: 'Usage limit exceeded'
                }, 403)
            }
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
        // Use database function to consume credits
        const { data: creditConsumed, error: consumeError } = await (supabase as any)
            .rpc('consume_credits', { user_uuid: user.id, credits_to_consume: 1 })
            .single()
        
        if (consumeError || !creditConsumed) {
            // Continue anyway - we don't want to fail the request if credit consumption fails
        } else {
        }
        const usageLogData: UsageLogInsert = {
            user_id: user.id,
            input_text: text,
            output_text: result.enhancedText,
            language,
            mode: EnhancementMode.ENHANCE,
            tokens_used: result.tokensUsed,
            success: true,
            credits_consumed: 1 // Each enhancement consumes 1 credit
        };
        // @ts-ignore
        await supabase.from('usage_logs').insert(usageLogData)
        const successResponse = {
            enhancedText: result.enhancedText,
            tokensUsed: result.tokensUsed,
            language: result.language
        };
        return createSuccessResponse(successResponse);
    } catch (error) {
        console.error('Enhancement API error:', error)
        return createErrorResponse({ code: ApiErrorCode.INTERNAL_ERROR, message: 'Internal error' }, 500)
    }
}
