/**
 * Prompt Caching for Claude API
 * 
 * Implements Claude's prompt caching to reduce costs and improve performance
 * Cache TTL: 5 minutes (Claude's limit)
 * 
 * @see https://docs.anthropic.com/claude/docs/prompt-caching
 */

export interface CachedPrompt {
    type: "text";
    text: string;
    cache_control?: {
        type: "ephemeral";
    };
}

export interface CacheStats {
    hits: number;
    misses: number;
    totalRequests: number;
    hitRate: number;
    estimatedSavings: number; // in tokens
}

/**
 * System prompts for different languages - PURIFIED VERSION
 * These are cached to reduce API costs
 * CRITICAL: Only return the enhanced text, no explanations or meta-commentary
 */
export const SYSTEM_PROMPTS = {
    en: `You are a professional text enhancement assistant. Your task is to improve the given text while maintaining its original meaning and tone.

CRITICAL INSTRUCTIONS:
- Return ONLY the enhanced text
- NO introductions like "Here's an improved version:"
- NO explanations or meta-commentary
- NO bullet points listing changes
- NO additional formatting or structure
- Just the clean, enhanced text

Enhance for: clarity, grammar, professionalism, spelling, and sentence structure.`,

    ar: `أنت مساعد تحسين النصوص المحترف. مهمتك هي تحسين النص المعطى مع الحفاظ على معناه ونبرته الأصلية.

تعليمات حاسمة:
- أرجع النص المحسن فقط
- لا تضع مقدمات مثل "هنا النسخة المحسنة:"
- لا تضع تفسيرات أو تعليقات إضافية
- لا تضع نقاط تشرح التغييرات
- لا تضع تنسيق أو هيكل إضافي
- فقط النص المحسن والنظيف

حسن من أجل: الوضوح، القواعد، الاحترافية، الإملاء، وبنية الجملة.`,

    fr: `Vous êtes un assistant professionnel d'amélioration de texte. Votre tâche est d'améliorer le texte donné tout en préservant son sens et son ton d'origine.

INSTRUCTIONS CRITIQUES:
- Retournez UNIQUEMENT le texte amélioré
- AUCUNE introduction comme "Voici une version améliorée:"
- AUCUNE explication ou méta-commentaire
- AUCUNE liste à puces des changements
- AUCUN formatage ou structure supplémentaire
- Juste le texte amélioré et propre

Améliorez pour: la clarté, la grammaire, le professionnalisme, l'orthographe et la structure des phrases.`
} as const;

/**
 * Build cached system prompt
 */
export function buildCachedSystemPrompt(language: 'en' | 'ar' | 'fr'): CachedPrompt {
    return {
        type: "text",
        text: SYSTEM_PROMPTS[language],
        cache_control: {
            type: "ephemeral"
        }
    };
}

/**
 * Build user prompt with optional caching - PURIFIED VERSION
 */
export function buildUserPrompt(
    text: string,
    tone: 'professional' | 'casual' | 'formal',
    enableCaching: boolean = true
): CachedPrompt {
    const toneInstructions = {
        professional: "Use a professional and polished tone.",
        casual: "Use a friendly and conversational tone.",
        formal: "Use a formal and academic tone."
    };

    const prompt = `${toneInstructions[tone]}

REMEMBER: Return ONLY the enhanced text. No explanations, no introductions, no meta-commentary.

Text to enhance:
${text}

Enhanced text:`;

    return {
        type: "text",
        text: prompt,
        ...(enableCaching && {
            cache_control: {
                type: "ephemeral"
            }
        })
    };
}

/**
 * Cache statistics tracker
 */
class CacheStatsTracker {
    private stats: CacheStats = {
        hits: 0,
        misses: 0,
        totalRequests: 0,
        hitRate: 0,
        estimatedSavings: 0
    };

    /**
     * Record a cache hit
     */
    recordHit(tokensSaved: number): void {
        this.stats.hits++;
        this.stats.totalRequests++;
        this.stats.estimatedSavings += tokensSaved;
        this.updateHitRate();
    }

    /**
     * Record a cache miss
     */
    recordMiss(): void {
        this.stats.misses++;
        this.stats.totalRequests++;
        this.updateHitRate();
    }

    /**
     * Update hit rate
     */
    private updateHitRate(): void {
        if (this.stats.totalRequests > 0) {
            this.stats.hitRate = (this.stats.hits / this.stats.totalRequests) * 100;
        }
    }

    /**
     * Get current stats
     */
    getStats(): CacheStats {
        return { ...this.stats };
    }

    /**
     * Reset stats
     */
    reset(): void {
        this.stats = {
            hits: 0,
            misses: 0,
            totalRequests: 0,
            hitRate: 0,
            estimatedSavings: 0
        };
    }

    /**
     * Log stats to console
     */
    logStats(): void {
        console.log('[Prompt Cache] Statistics:', {
            ...this.stats,
            hitRate: `${this.stats.hitRate.toFixed(2)}%`,
            estimatedSavings: `${this.stats.estimatedSavings} tokens`
        });
    }
}

// Export singleton instance
export const cacheStats = new CacheStatsTracker();

/**
 * Parse cache usage from Claude API response
 */
export function parseCacheUsage(response: unknown): {
    cacheCreationTokens: number;
    cacheReadTokens: number;
    inputTokens: number;
} {
    if (!response || typeof response !== 'object') {
        return {
            cacheCreationTokens: 0,
            cacheReadTokens: 0,
            inputTokens: 0
        };
    }

    // @ts-ignore
    const usage = response.usage || {};

    return {
        cacheCreationTokens: usage.cache_creation_input_tokens || 0,
        cacheReadTokens: usage.cache_read_input_tokens || 0,
        inputTokens: usage.input_tokens || 0
    };
}

/**
 * Calculate cost savings from caching
 */
export function calculateCacheSavings(cacheUsage: ReturnType<typeof parseCacheUsage>): {
    tokensSaved: number;
    percentageSaved: number;
    wasCacheHit: boolean;
} {
    const { cacheReadTokens, inputTokens } = cacheUsage;
    const wasCacheHit = cacheReadTokens > 0;

    // Cache reads are 90% cheaper than regular input tokens
    const tokensSaved = Math.floor(cacheReadTokens * 0.9);
    const totalTokens = inputTokens + cacheReadTokens;
    const percentageSaved = totalTokens > 0 ? (tokensSaved / totalTokens) * 100 : 0;

    return {
        tokensSaved,
        percentageSaved,
        wasCacheHit
    };
}
