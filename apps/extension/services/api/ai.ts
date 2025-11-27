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

        const response = await apiPost<RewriteResponse>('ai/enhance', {
            text,
            options,
        });

        const backendDuration = performanceMonitor.end('backend-api-enhance');

        // Validate response
        const validated = RewriteResponseSchema.parse(response);

        logger.info('Text enhanced successfully', {
            detectedLanguage: validated.detectedLanguage,
            confidence: validated.confidence,
            backendLatency: backendDuration ? `${backendDuration.toFixed(2)}ms` : 'N/A',
        });

        return validated;
    } catch (error: any) {
        performanceMonitor.end('backend-api-enhance', { error: true });

        if (error.code === 'LANGUAGE_NOT_SUPPORTED') {
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
