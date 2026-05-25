import { NextRequest, NextResponse } from 'next/server'
import { RUNTIME_SUBSCRIPTION_DEFAULTS } from '@emotifyai/config/pricing'
import { createClient } from '@/lib/supabase/server'
import { canMakeEnhancement } from '@/lib/subscription/validation'
import { enhanceText, mockEnhanceText, type EnhanceOptions } from '@/lib/ai/claude'
import { validateOutputQuality, isLanguageSupported } from '@/lib/ai/language-detection'
import { detectAndRoute } from '@/lib/ai/language-router'
import { EnhanceRequestSchema, ApiErrorCode } from '@/types/api'
import { EnhancementMode, UsageLogInsert } from '@/types/database'

function useMockAi(): boolean {
  return process.env.MOCK_AI_RESPONSES === 'true'
}

type ErrorResponse = {
    code: ApiErrorCode
    message: string
}

function createErrorResponse(error: ErrorResponse, status: number) {
    return NextResponse.json({ success: false, error }, { status })
}

function createSuccessResponse(data: {
    enhancedText: string
    tokensUsed: number
    language: string
    routeId?: string
    detectionSummary?: string
}) {
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

        const {
            text,
            outputLanguage,
            tone,
            platform,
            strength,
            isEditorSession,
        } = validation.data

        if (!isLanguageSupported(outputLanguage)) {
            return createErrorResponse({
                code: ApiErrorCode.UNSUPPORTED_LANGUAGE,
                message: `Output language '${outputLanguage}' is not supported`,
            }, 400)
        }

        const { routeId, detection } = detectAndRoute(text, outputLanguage)

        const canEnhance = await canMakeEnhancement(user.id)
        if (!canEnhance.allowed) {
            if (canEnhance.reason === 'SUBSCRIPTION_EXPIRED' || canEnhance.reason === 'NO_SUBSCRIPTION') {
                try {
                    const trialDefaults = RUNTIME_SUBSCRIPTION_DEFAULTS.enhanceTrialInsert
                    const now = new Date()
                    const freeEnd = new Date(
                      now.getTime() + trialDefaults.validityDays * 24 * 60 * 60 * 1000
                    )
                    const { error: createError } = await (supabase.from('subscriptions') as any).insert({
                        user_id: user.id,
                        lemon_squeezy_id: `free_${user.id}_${Date.now()}`,
                        status: 'trial',
                        tier: trialDefaults.tier,
                        tier_name: 'free',
                        credits_limit: trialDefaults.credits,
                        credits_used: 0,
                        validity_days: trialDefaults.validityDays,
                        current_period_start: now.toISOString(),
                        current_period_end: freeEnd.toISOString(),
                    })

                    if (createError) {
                        return NextResponse.json({
                            success: false,
                            error: {
                                code: ApiErrorCode.USAGE_LIMIT_EXCEEDED,
                                message: 'Unable to create free trial',
                                reason: canEnhance.reason,
                            },
                        }, { status: 403 })
                    }
                } catch {
                    return NextResponse.json({
                        success: false,
                        error: {
                            code: ApiErrorCode.USAGE_LIMIT_EXCEEDED,
                            message: 'Usage limit exceeded',
                            reason: canEnhance.reason,
                            tier: canEnhance.creditStatus?.tier_name,
                        },
                    }, { status: 403 })
                }
            } else {
                return NextResponse.json({
                    success: false,
                    error: {
                        code: ApiErrorCode.USAGE_LIMIT_EXCEEDED,
                        message: 'Usage limit exceeded',
                        reason: canEnhance.reason,
                        tier: canEnhance.creditStatus?.tier_name,
                    },
                }, { status: 403 })
            }
        }

        const enhanceOptions: EnhanceOptions = {
            text,
            outputLanguage,
            tone,
            platform,
            strength,
        }

        const result = useMockAi()
            ? await mockEnhanceText(enhanceOptions)
            : await enhanceText(enhanceOptions)

        const qualityCheck = validateOutputQuality(text, result.enhancedText, outputLanguage)

        if (!qualityCheck.isValid) {
            return createErrorResponse({
                code: ApiErrorCode.QUALITY_CHECK_FAILED,
                message: qualityCheck.reason || 'Quality check failed',
            }, 500)
        }

        await (supabase as any).rpc('consume_credits', { user_uuid: user.id, credits_to_consume: 1 }).single()

        const usageLogData: UsageLogInsert = {
            user_id: user.id,
            input_text: text,
            output_text: result.enhancedText,
            language: detection.primaryScript === 'arabic' ? 'ar' : 'en',
            output_language: outputLanguage,
            mode: EnhancementMode.ENHANCE,
            tokens_used: result.tokensUsed,
            success: true,
            credits_consumed: 1,
            is_editor_session: isEditorSession || false,
            tone: tone || undefined,
            platform: platform || undefined,
            detected_route: routeId || result.routeId || undefined,
        } as UsageLogInsert

        // @ts-expect-error Supabase generated types may lag schema migrations
        await supabase.from('usage_logs').insert(usageLogData)

        return createSuccessResponse({
            enhancedText: result.enhancedText,
            tokensUsed: result.tokensUsed,
            language: outputLanguage,
            routeId: result.routeId ?? routeId,
            detectionSummary: detection.inputSummaryAr,
        })
    } catch (error) {
        console.error('Enhancement API error:', error)
        return createErrorResponse({ code: ApiErrorCode.INTERNAL_ERROR, message: 'Internal error' }, 500)
    }
}
