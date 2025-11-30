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
 * System prompts for different languages
 * These are cached to reduce API costs
 */
export const SYSTEM_PROMPTS = {
    en: `You are a professional writing assistant specializing in English text enhancement. Your role is to:
- Improve clarity, grammar, and overall quality
- Maintain the original meaning and tone
- Enhance professionalism while keeping the author's voice
- Fix spelling and grammatical errors
- Improve sentence structure and flow

Always preserve the core message while making the text more polished and professional.`,

    ar: `أنت مساعد كتابة محترف متخصص في تحسين النصوص العربية. دورك هو:
- تحسين الوضوح والقواعد والجودة الشاملة
- الحفاظ على المعنى والنبرة الأصلية
- تعزيز الاحترافية مع الحفاظ على صوت المؤلف
- إصلاح الأخطاء الإملائية والنحوية
- تحسين بنية الجملة والتدفق

احرص دائمًا على الحفاظ على الرسالة الأساسية مع جعل النص أكثر صقلًا واحترافية.`,

    fr: `Vous êtes un assistant d'écriture professionnel spécialisé dans l'amélioration de textes en français. Votre rôle est de:
- Améliorer la clarté, la grammaire et la qualité globale
- Maintenir le sens et le ton d'origine
- Renforcer le professionnalisme tout en préservant la voix de l'auteur
- Corriger les fautes d'orthographe et de grammaire
- Améliorer la structure des phrases et le flux

Préservez toujours le message principal tout en rendant le texte plus soigné et professionnel.`
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
 * Build user prompt with optional caching
 */
export function buildUserPrompt(
    text: string,
    mode: 'enhance' | 'rephrase' | 'simplify' | 'expand',
    tone: 'professional' | 'casual' | 'formal',
    enableCaching: boolean = true
): CachedPrompt {
    const modeInstructions = {
        enhance: "Enhance and improve the following text while maintaining its core meaning:",
        rephrase: "Rephrase the following text to make it clearer and more engaging:",
        simplify: "Simplify the following text to make it easier to understand:",
        expand: "Expand the following text with additional relevant details and examples:"
    };

    const toneInstructions = {
        professional: "Use a professional and polished tone.",
        casual: "Use a friendly and conversational tone.",
        formal: "Use a formal and academic tone."
    };

    const prompt = `${modeInstructions[mode]}

${toneInstructions[tone]}

Text to process:
${text}`;

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
export function parseCacheUsage(response: any): {
    cacheCreationTokens: number;
    cacheReadTokens: number;
    inputTokens: number;
} {
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
