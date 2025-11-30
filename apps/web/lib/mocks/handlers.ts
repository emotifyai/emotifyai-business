/**
 * Mock Enhancement Handlers
 * 
 * Provides mock responses for AI text enhancement
 * Used only in development mode when MOCK_AI_RESPONSES=true
 */

export interface MockEnhancementResponse {
    enhanced_text: string;
    original_text: string;
    language: string;
    mode: string;
    cached: boolean;
}

/**
 * Mock enhancement responses by language
 */
export const mockEnhancementResponses: Record<string, string> = {
    en: "This is a professionally enhanced version of your text. The AI has improved clarity, grammar, and overall quality while maintaining your original meaning and tone.",
    ar: "هذا نص محسّن احترافيًا. قام الذكاء الاصطناعي بتحسين الوضوح والقواعد والجودة الشاملة مع الحفاظ على المعنى والنبرة الأصلية.",
    fr: "Ceci est une version professionnellement améliorée de votre texte. L'IA a amélioré la clarté, la grammaire et la qualité globale tout en maintenant votre sens et ton d'origine."
};

/**
 * Simulate network delay
 */
export const mockDelay = (ms: number = 500): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock enhancement service
 * Simulates the AI enhancement API
 */
export const mockEnhancementService = {
    /**
     * Mock text enhancement
     */
    async enhance(
        text: string,
        options: {
            mode?: 'enhance' | 'rephrase' | 'simplify';
            language?: 'en' | 'ar' | 'fr' | 'auto';
            tone?: 'professional' | 'casual' | 'formal';
        } = {}
    ): Promise<MockEnhancementResponse> {
        // Simulate network delay
        await mockDelay(300 + Math.random() * 200);

        const { mode = 'enhance', language = 'auto', tone = 'professional' } = options;

        // Detect language if auto
        const detectedLanguage = language === 'auto'
            ? detectLanguage(text)
            : language;

        // Get mock response for language
        const enhancedText = mockEnhancementResponses[detectedLanguage] || mockEnhancementResponses.en;

        console.log('[Mock] Enhanced text:', {
            original_length: text.length,
            enhanced_length: enhancedText.length,
            language: detectedLanguage,
            mode,
            tone
        });

        return {
            enhanced_text: enhancedText,
            original_text: text,
            language: detectedLanguage,
            mode,
            cached: Math.random() > 0.5 // Randomly simulate cache hits
        };
    },

    /**
     * Mock usage check
     */
    async checkUsage(): Promise<{
        used: number;
        limit: number;
        remaining: number;
    }> {
        await mockDelay(100);

        return {
            used: Math.floor(Math.random() * 50),
            limit: 50,
            remaining: 50 - Math.floor(Math.random() * 50)
        };
    }
};

/**
 * Simple language detection
 */
function detectLanguage(text: string): 'en' | 'ar' | 'fr' {
    // Arabic detection
    if (/[\u0600-\u06FF]/.test(text)) {
        return 'ar';
    }

    // French detection (simple heuristic)
    if (/[àâäéèêëïîôùûüÿæœç]/i.test(text)) {
        return 'fr';
    }

    // Default to English
    return 'en';
}

/**
 * Mock error scenarios for testing
 */
export const mockErrors = {
    rateLimitExceeded: () => ({
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        retry_after: 60
    }),

    quotaExceeded: () => ({
        error: 'Monthly quota exceeded',
        code: 'QUOTA_EXCEEDED',
        upgrade_url: '/pricing'
    }),

    invalidLanguage: () => ({
        error: 'Language not supported',
        code: 'INVALID_LANGUAGE',
        supported_languages: ['en', 'ar', 'fr']
    })
};
