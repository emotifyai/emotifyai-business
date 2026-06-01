import { TextEncoder } from 'node:util'
import { NextRequest, NextResponse } from 'next/server'
import { RUNTIME_SUBSCRIPTION_DEFAULTS } from '@emotifyai/config/pricing'
import { createClient } from '@/lib/supabase/server'
import { canMakeEnhancement } from '@/lib/subscription/validation'
import {
    enhanceText,
    enhanceTextStream,
    mockEnhanceText,
    mockEnhanceTextStream,
    type EnhanceOptions,
} from '@/lib/ai/claude'
import { validateOutputQuality, isLanguageSupported } from '@/lib/ai/language-detection'
import { detectAndRoute } from '@/lib/ai/language-router'
import { formatEnhanceSSE, wantsEnhanceStream } from '@/lib/api/enhance-sse'
import { EnhanceRequestSchema, ApiErrorCode } from '@/types/api'
import { EnhancementMode, UsageLogInsert } from '@/types/database'

function useMockAi(): boolean {
    return process.env.MOCK_AI_RESPONSES === 'true'
}

type ErrorResponse = {
    code: ApiErrorCode
    message: string
    reason?: string
    tier?: string
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
    usageLogId?: string
    retryUsed?: boolean
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

async function ensureCanEnhance(
    userId: string,
    supabase: Awaited<ReturnType<typeof createClient>>
): Promise<{ ok: true } | { error: NextResponse }> {
    const canEnhance = await canMakeEnhancement(userId)
    if (canEnhance.allowed) {
        return { ok: true }
    }

    if (canEnhance.reason === 'SUBSCRIPTION_EXPIRED' || canEnhance.reason === 'NO_SUBSCRIPTION') {
        try {
            const freeDefaults = RUNTIME_SUBSCRIPTION_DEFAULTS.enhanceFreeInsert
            const now = new Date()
            const periodEnd = freeDefaults.validityDays
                ? new Date(
                      now.getTime() + freeDefaults.validityDays * 24 * 60 * 60 * 1000
                  ).toISOString()
                : null
            const { error: createError } = await (supabase.from('subscriptions') as any).insert({
                user_id: userId,
                lemon_squeezy_id: `free_${userId}_${Date.now()}`,
                status: 'active',
                tier: freeDefaults.tier,
                tier_name: 'free',
                credits_limit: freeDefaults.credits,
                credits_used: 0,
                validity_days: freeDefaults.validityDays,
                current_period_start: now.toISOString(),
                current_period_end: periodEnd,
            })

            if (!createError) {
                return { ok: true }
            }

            return {
                error: NextResponse.json({
                    success: false,
                    error: {
                        code: ApiErrorCode.USAGE_LIMIT_EXCEEDED,
                        message: 'Unable to create free plan',
                        reason: canEnhance.reason,
                    },
                }, { status: 403 }),
            }
        } catch {
            // fall through to limit response
        }
    }

    return {
        error: NextResponse.json({
            success: false,
            error: {
                code: ApiErrorCode.USAGE_LIMIT_EXCEEDED,
                message: 'Usage limit exceeded',
                reason: canEnhance.reason,
                tier: canEnhance.creditStatus?.tier_name,
            },
        }, { status: 403 }),
    }
}

async function persistEnhancement(params: {
    supabase: Awaited<ReturnType<typeof createClient>>
    userId: string
    text: string
    result: { enhancedText: string; tokensUsed: number; routeId?: string }
    outputLanguage: string
    detection: ReturnType<typeof detectAndRoute>['detection']
    routeId: string
    tone?: string
    platform?: string
    isEditorSession: boolean
}): Promise<{ usageLogId?: string; retryUsed: boolean }> {
    const {
        supabase,
        userId,
        text,
        result,
        outputLanguage,
        detection,
        routeId,
        tone,
        platform,
        isEditorSession,
    } = params

    await (supabase as any).rpc('consume_credits', { user_uuid: userId, credits_to_consume: 1 }).single()

    const usageLogData: UsageLogInsert = {
        user_id: userId,
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

    const { data: insertedLog, error: logError } = await (supabase as any)
        .from('usage_logs')
        .insert(usageLogData)
        .select('id, retry_used')
        .single()

    if (logError) {
        console.error('Usage log insert error:', logError)
    }

    return {
        usageLogId: insertedLog?.id,
        retryUsed: insertedLog?.retry_used ?? false,
    }
}

function createEnhanceStreamResponse(
    runEnhancement: (sendDelta: (text: string) => void) => Promise<{
        enhancedText: string
        tokensUsed: number
        routeId?: string
    }>,
    meta: {
        outputLanguage: string
        routeId: string
        detectionSummary?: string
    }
): Response {
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
        async start(controller) {
            const send = (event: 'delta' | 'done' | 'error', data: unknown) => {
                controller.enqueue(encoder.encode(formatEnhanceSSE(event, data)))
            }

            try {
                const result = await runEnhancement((text) => {
                    send('delta', { text })
                })

                send('done', {
                    success: true,
                    data: {
                        enhancedText: result.enhancedText,
                        tokensUsed: result.tokensUsed,
                        language: meta.outputLanguage,
                        routeId: result.routeId ?? meta.routeId,
                        detectionSummary: meta.detectionSummary,
                        usageLogId: (result as { usageLogId?: string }).usageLogId,
                        retryUsed: (result as { retryUsed?: boolean }).retryUsed ?? false,
                    },
                })
            } catch (error) {
                const message = error instanceof Error ? error.message : 'INTERNAL_ERROR'
                let code = ApiErrorCode.INTERNAL_ERROR
                let userMessage = 'Internal error'

                if (message === 'RATE_LIMIT_EXCEEDED') {
                    code = ApiErrorCode.RATE_LIMIT_EXCEEDED
                    userMessage = 'Rate limit exceeded'
                } else if (message === 'AI_SERVICE_ERROR') {
                    code = ApiErrorCode.AI_SERVICE_ERROR
                    userMessage = 'AI service error'
                } else if (message === 'QUALITY_CHECK_FAILED') {
                    code = ApiErrorCode.QUALITY_CHECK_FAILED
                    userMessage = 'Quality check failed'
                }

                send('error', {
                    success: false,
                    error: { code, message: userMessage },
                })
            } finally {
                controller.close()
            }
        },
    })

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
        },
    })
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
            stream: requestStream,
        } = validation.data

        const useStream = wantsEnhanceStream(
            { stream: requestStream },
            request.headers.get('accept')
        )

        if (!isLanguageSupported(outputLanguage)) {
            return createErrorResponse({
                code: ApiErrorCode.UNSUPPORTED_LANGUAGE,
                message: `Output language '${outputLanguage}' is not supported`,
            }, 400)
        }

        const { routeId, detection } = detectAndRoute(text, outputLanguage)

        const subscriptionCheck = await ensureCanEnhance(user.id, supabase)
        if ('error' in subscriptionCheck) {
            if (useStream) {
                const limitBody = await subscriptionCheck.error.json()
                return new Response(formatEnhanceSSE('error', limitBody), {
                    status: subscriptionCheck.error.status,
                    headers: { 'Content-Type': 'text/event-stream; charset=utf-8' },
                })
            }
            return subscriptionCheck.error
        }

        const enhanceOptions: EnhanceOptions = {
            text,
            outputLanguage,
            tone,
            platform,
            strength,
        }

        const runAi = async (onDelta: (text: string) => void) => {
            if (useMockAi()) {
                return useStream
                    ? mockEnhanceTextStream(enhanceOptions, onDelta)
                    : mockEnhanceText(enhanceOptions)
            }
            return useStream
                ? enhanceTextStream(enhanceOptions, onDelta)
                : enhanceText(enhanceOptions)
        }

        if (useStream) {
            return createEnhanceStreamResponse(
                async (sendDelta) => {
                    const result = await runAi(sendDelta)

                    const qualityCheck = validateOutputQuality(text, result.enhancedText, outputLanguage)
                    if (!qualityCheck.isValid) {
                        throw new Error('QUALITY_CHECK_FAILED')
                    }

                    const persisted = await persistEnhancement({
                        supabase,
                        userId: user.id,
                        text,
                        result,
                        outputLanguage,
                        detection,
                        routeId,
                        tone,
                        platform,
                        isEditorSession: isEditorSession || false,
                    })

                    return { ...result, ...persisted }
                },
                {
                    outputLanguage,
                    routeId,
                    detectionSummary: detection.inputSummaryAr,
                }
            )
        }

        const result = await runAi(() => {})

        const qualityCheck = validateOutputQuality(text, result.enhancedText, outputLanguage)
        if (!qualityCheck.isValid) {
            return createErrorResponse({
                code: ApiErrorCode.QUALITY_CHECK_FAILED,
                message: qualityCheck.reason || 'Quality check failed',
            }, 500)
        }

        const persisted = await persistEnhancement({
            supabase,
            userId: user.id,
            text,
            result,
            outputLanguage,
            detection,
            routeId,
            tone,
            platform,
            isEditorSession: isEditorSession || false,
        })

        return createSuccessResponse({
            enhancedText: result.enhancedText,
            tokensUsed: result.tokensUsed,
            language: outputLanguage,
            routeId: result.routeId ?? routeId,
            detectionSummary: detection.inputSummaryAr,
            usageLogId: persisted.usageLogId,
            retryUsed: persisted.retryUsed,
        })
    } catch (error) {
        console.error('Enhancement API error:', error)
        return createErrorResponse({ code: ApiErrorCode.INTERNAL_ERROR, message: 'Internal error' }, 500)
    }
}
