import { apiPost } from './client';
import { logger } from '@/utils/logger';
import { performanceMonitor } from '@/utils/performance';
import { LanguageNotSupportedError } from '@/utils/errors';
import type { EnhanceOptions, RewriteResponse } from '@/types';
import { RewriteResponseSchema } from '@/schemas/validation';

export async function enhanceText(
    text: string,
    options: EnhanceOptions = {}
): Promise<RewriteResponse> {
    try {
        logger.info('Enhancing text...', { textLength: text.length, options });

        // Track backend API performance
        performanceMonitor.start('backend-api-enhance', {
            textLength: text.length,
            language: options.language || 'auto',
        });

        // Call the new API endpoint format
        const response = await apiPost<{
            success: boolean;
            data?: {
                enhancedText: string;
                tokensUsed: number;
                language: string;
            };
            error?: {
                code: string;
                message: string;
            };
        }>('enhance', {
            text,
            language: options.language,
            tone: options.tone || 'professional'
        });

        const backendDuration = performanceMonitor.end('backend-api-enhance');

        if (!response.success || !response.data) {
            throw new Error(response.error?.message || 'Enhancement failed');
        }

        // Convert to expected format
        const result: RewriteResponse = {
            enhancedText: response.data.enhancedText,
            detectedLanguage: response.data.language,
            confidence: 0.95, // High confidence since we have purified output
            tokensUsed: response.data.tokensUsed
        };

        // Validate response
        const validated = RewriteResponseSchema.parse(result);

        logger.info('Text enhanced successfully', {
            detectedLanguage: validated.detectedLanguage,
            confidence: validated.confidence,
            backendLatency: backendDuration ? `${backendDuration.toFixed(2)}ms` : 'N/A',
            purified: true // Indicate this is purified output
        });

        return validated;
    } catch (error: any) {
        performanceMonitor.end('backend-api-enhance', { error: true });

        if (error.code === 'UNSUPPORTED_LANGUAGE') {
            throw new LanguageNotSupportedError(
                error.details?.detectedLanguage || 'unknown',
                error.message
            );
        }
        logger.error('Text enhancement failed', error);
        throw error;
    }
}

export async function detectLanguage(text: string): Promise<{
    language: string;
    supported: boolean;
    confidence: number;
}> {
    try {
        const response = await apiPost<{
            language: string;
            supported: boolean;
            confidence: number;
        }>('ai/detect-language', { text });

        return response;
    } catch (error) {
        logger.error('Language detection failed', error);
        throw error;
    }
}

export async function validateLanguageSupport(language: string): Promise<boolean> {
    try {
        const response = await apiPost<{ supported: boolean }>('ai/validate-language', {
            language,
        });
        return response.supported;
    } catch (error) {
        logger.error('Language validation failed', error);
        return false;
    }
}
