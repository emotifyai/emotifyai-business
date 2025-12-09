import { http, HttpResponse, delay } from 'msw';
import {
    getCurrentMockUser,
    getCurrentMockSubscription,
    getCurrentMockUsageStats,
    getMockEnhancedText,
} from './data';
import { detectLanguage, isLanguageSupported } from '@/utils/language-detector';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const handlers = [
    // Auth - Login
    http.post(`${API_BASE_URL}/auth/login`, async () => {
        await delay(500); // Simulate network delay

        return HttpResponse.json({
            token: 'mock-jwt-token-' + Date.now(),
            user: getCurrentMockUser(),
            subscription: getCurrentMockSubscription(),
        });
    }),

    // Auth - Logout
    http.post(`${API_BASE_URL}/auth/logout`, async () => {
        await delay(200);
        return HttpResponse.json({ success: true });
    }),

    // Auth - Validate Session
    http.get(`${API_BASE_URL}/auth/session`, async () => {
        await delay(300);

        return HttpResponse.json({
            valid: true,
            user: getCurrentMockUser(),
        });
    }),

    // Subscription - Get Current
    http.get(`${API_BASE_URL}/subscription`, async () => {
        await delay(400);

        return HttpResponse.json({
            subscription: getCurrentMockSubscription(),
        });
    }),

    // Usage - Get Stats
    http.get(`${API_BASE_URL}/usage`, async () => {
        await delay(300);

        return HttpResponse.json({
            usage: getCurrentMockUsageStats(),
        });
    }),

    // AI - Enhance Text
    http.post(`${API_BASE_URL}/ai/enhance`, async ({ request }) => {
        await delay(1500); // Simulate AI processing time

        const body = await request.json() as { text: string; options?: { language?: string } };
        const { text, options } = body;

        if (!text || text.trim().length === 0) {
            return HttpResponse.json(
                { code: 'INVALID_INPUT', message: 'Text is required' },
                { status: 400 }
            );
        }

        // Check usage limits
        const currentUsage = getCurrentMockUsageStats();
        if (currentUsage.used >= currentUsage.limit) {
            return HttpResponse.json(
                {
                    code: 'USAGE_LIMIT_EXCEEDED',
                    message: 'You have reached your usage limit',
                    details: { used: currentUsage.used, limit: currentUsage.limit },
                },
                { status: 429 }
            );
        }

        // Detect language
        const detectedLanguage = options?.language === 'auto' || !options?.language
            ? detectLanguage(text)
            : options.language;

        // Check if language is supported
        if (!isLanguageSupported(detectedLanguage)) {
            return HttpResponse.json(
                {
                    code: 'LANGUAGE_NOT_SUPPORTED',
                    message: `Language "${detectedLanguage}" is not fully supported. We currently support English, Arabic, and French.`,
                    details: { detectedLanguage },
                },
                { status: 400 }
            );
        }

        // Generate mock enhanced text
        const enhancedText = getMockEnhancedText(text, detectedLanguage);

        return HttpResponse.json({
            enhancedText,
            detectedLanguage,
            confidence: 0.95,
        });
    }),

    // AI - Detect Language
    http.post(`${API_BASE_URL}/ai/detect-language`, async ({ request }) => {
        await delay(200);

        const body = await request.json() as { text: string };
        const { text } = body;

        const detectedLanguage = detectLanguage(text);
        const supported = isLanguageSupported(detectedLanguage);

        return HttpResponse.json({
            language: detectedLanguage,
            supported,
            confidence: 0.9,
        });
    }),
];
