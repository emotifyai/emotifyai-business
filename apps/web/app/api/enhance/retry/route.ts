import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { enhanceText, mockEnhanceText, type EnhanceOptions } from '@/lib/ai/claude'
import { validateOutputQuality, isLanguageSupported } from '@/lib/ai/language-detection'
import { detectAndRoute } from '@/lib/ai/language-router'
import { EnhanceRetryRequestSchema, ApiErrorCode } from '@/types/api'
import { EnhancementMode, type RetryInsert, type UsageLogInsert } from '@/types/database'

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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResponse(
        { code: ApiErrorCode.UNAUTHORIZED, message: 'Authentication required' },
        401
      )
    }

    const body = await request.json()
    const validation = EnhanceRetryRequestSchema.safeParse(body)
    if (!validation.success) {
      return createErrorResponse(
        { code: ApiErrorCode.INVALID_REQUEST, message: 'Invalid request data' },
        400
      )
    }

    const {
      parentLogId,
      retryReason,
      retryReasonOther,
      text,
      outputLanguage,
      tone,
      platform,
      strength,
    } = validation.data

    if (!isLanguageSupported(outputLanguage)) {
      return createErrorResponse(
        {
          code: ApiErrorCode.UNSUPPORTED_LANGUAGE,
          message: `Output language '${outputLanguage}' is not supported`,
        },
        400
      )
    }

    const { data: parentLog, error: parentError } = await (supabase as any)
      .from('usage_logs')
      .select('id, user_id, retry_used, is_editor_session')
      .eq('id', parentLogId)
      .eq('user_id', user.id)
      .single()

    if (parentError || !parentLog) {
      return createErrorResponse(
        { code: ApiErrorCode.RETRY_NOT_ALLOWED, message: 'Transformation not found' },
        404
      )
    }

    if (parentLog.retry_used) {
      return createErrorResponse(
        { code: ApiErrorCode.RETRY_ALREADY_USED, message: 'Retry already used for this result' },
        409
      )
    }

    const retryRow: RetryInsert = {
      user_id: user.id,
      usage_log_id: parentLogId,
      retry_reason: retryReason,
      retry_reason_other: retryReasonOther ?? null,
    }

    const { error: retryInsertError } = await (supabase as any).from('retries').insert(retryRow)

    if (retryInsertError) {
      if (retryInsertError.code === '23505') {
        return createErrorResponse(
          { code: ApiErrorCode.RETRY_ALREADY_USED, message: 'Retry already used for this result' },
          409
        )
      }
      console.error('Retry insert error:', retryInsertError)
      return createErrorResponse(
        { code: ApiErrorCode.DATABASE_ERROR, message: 'Failed to save retry feedback' },
        500
      )
    }

    const { error: markUsedError } = await (supabase as any)
      .from('usage_logs')
      .update({ retry_used: true })
      .eq('id', parentLogId)
      .eq('user_id', user.id)

    if (markUsedError) {
      console.error('Mark retry_used error:', markUsedError)
      return createErrorResponse(
        { code: ApiErrorCode.DATABASE_ERROR, message: 'Failed to update transformation' },
        500
      )
    }

    const { routeId, detection } = detectAndRoute(text, outputLanguage)

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
      return createErrorResponse(
        {
          code: ApiErrorCode.QUALITY_CHECK_FAILED,
          message: qualityCheck.reason || 'Quality check failed',
        },
        500
      )
    }

    const usageLogData: UsageLogInsert = {
      user_id: user.id,
      input_text: text,
      output_text: result.enhancedText,
      language: detection.primaryScript === 'arabic' ? 'ar' : 'en',
      output_language: outputLanguage,
      mode: EnhancementMode.ENHANCE,
      tokens_used: result.tokensUsed,
      success: true,
      credits_consumed: 0,
      is_editor_session: parentLog.is_editor_session ?? true,
      tone: tone || undefined,
      platform: platform || undefined,
      detected_route: routeId || result.routeId || undefined,
      is_retry: true,
      retry_used: false,
    }

    const { data: insertedLog, error: logError } = await (supabase as any)
      .from('usage_logs')
      .insert(usageLogData)
      .select('id')
      .single()

    if (logError) {
      console.error('Retry usage log error:', logError)
      return createErrorResponse(
        { code: ApiErrorCode.DATABASE_ERROR, message: 'Failed to log retry enhancement' },
        500
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        enhancedText: result.enhancedText,
        tokensUsed: result.tokensUsed,
        language: outputLanguage,
        routeId: result.routeId ?? routeId,
        detectionSummary: detection.inputSummaryAr,
        usageLogId: insertedLog?.id,
        parentLogId,
        retryUsed: true,
      },
    })
  } catch (error) {
    console.error('Enhance retry API error:', error)
    return createErrorResponse(
      { code: ApiErrorCode.INTERNAL_ERROR, message: 'Internal error' },
      500
    )
  }
}
