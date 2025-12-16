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
    console.log('🦆 DUCK: Authenticating user...');
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('🦆 DUCK: Auth result - user:', !!user, 'error:', authError);
    
    if (authError || !user) {
        console.log('🦆 DUCK: ❌ Authentication failed');
        return { error: createErrorResponse({ code: ApiErrorCode.UNAUTHORIZED, message: 'Authentication required' }, 401) }
    }

    console.log('🦆 DUCK: ✅ User authenticated:', user.id);
    return { user, supabase }
}

export async function POST(request: NextRequest) {
    try {
        console.log('🦆 DUCK: /api/enhance POST request received');
        console.log('🦆 DUCK: Request headers:', Object.fromEntries(request.headers.entries()));
        
        const authResult = await authenticateUser()
        if ('error' in authResult) {
            console.log('🦆 DUCK: ❌ Authentication failed');
            return authResult.error
        }

        console.log('🦆 DUCK: ✅ Authentication successful, user ID:', authResult.user.id);
        
        const { user, supabase } = authResult
        const body = await request.json()
        console.log('🦆 DUCK: Request body received:', body);
        
        const validation = EnhanceRequestSchema.safeParse(body)
        console.log('🦆 DUCK: Validation result:', validation);

        if (!validation.success) {
            console.log('🦆 DUCK: ❌ Validation failed:', validation.error);
            return createErrorResponse({ code: ApiErrorCode.INVALID_REQUEST, message: 'Invalid request data' }, 400)
        }

        console.log('🦆 DUCK: ✅ Validation successful');

        const { text, language: requestedLanguage, tone } = validation.data
        console.log('🦆 DUCK: Parsed data - text length:', text?.length, 'language:', requestedLanguage, 'tone:', tone);
        
        const language = requestedLanguage || detectLanguage(text)
        console.log('🦆 DUCK: Detected/final language:', language);

        if (!isLanguageSupported(language)) {
            console.log('🦆 DUCK: ❌ Language not supported:', language);
            return createErrorResponse({
                code: ApiErrorCode.UNSUPPORTED_LANGUAGE,
                message: `Language '${language}' is not supported`
            }, 400)
        }

        console.log('🦆 DUCK: ✅ Language supported, checking usage limits...');
        
        const canEnhance = await canMakeEnhancement(user.id)
        console.log('🦆 DUCK: Usage limit check result:', canEnhance);
        
        if (!canEnhance.allowed) {
            console.log('🦆 DUCK: ❌ Usage limit exceeded');
            return createErrorResponse({
                code: ApiErrorCode.USAGE_LIMIT_EXCEEDED,
                message: 'Usage limit exceeded'
            }, 403)
        }

        console.log('🦆 DUCK: ✅ Usage limit check passed');

        const enhanceOptions: EnhanceOptions = { text, language, tone }
        console.log('🦆 DUCK: Enhancement options:', enhanceOptions);
        console.log('🦆 DUCK: Using mock AI:', USE_MOCK);
        
        const result = USE_MOCK ? await mockEnhanceText(enhanceOptions) : await enhanceText(enhanceOptions)
        console.log('🦆 DUCK: Enhancement result:', result);

        const qualityCheck = validateOutputQuality(text, result.enhancedText, language)
        console.log('🦆 DUCK: Quality check result:', qualityCheck);
        
        if (!qualityCheck.isValid) {
            console.log('🦆 DUCK: ❌ Quality check failed');
            return createErrorResponse({
                code: ApiErrorCode.QUALITY_CHECK_FAILED,
                message: 'Quality check failed'
            }, 500)
        }

        console.log('🦆 DUCK: ✅ Quality check passed');

        console.log('🦆 DUCK: Logging usage to database...');
        
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
        
        console.log('🦆 DUCK: Usage log data:', usageLogData);
        
        // @ts-ignore
        await supabase.from('usage_logs').insert(usageLogData)

        console.log('🦆 DUCK: ✅ Usage logged successfully');
        
        const successResponse = {
            enhancedText: result.enhancedText,
            tokensUsed: result.tokensUsed,
            language: result.language
        };
        
        console.log('🦆 DUCK: ✅ Returning success response:', successResponse);
        return createSuccessResponse(successResponse);
    } catch (error) {
        console.log('🦆 DUCK: ❌ Enhancement API error:', error);
        console.error('Enhancement API error:', error)
        return createErrorResponse({ code: ApiErrorCode.INTERNAL_ERROR, message: 'Internal error' }, 500)
    }
}
