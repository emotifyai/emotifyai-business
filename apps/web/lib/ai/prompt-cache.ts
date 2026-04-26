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
  en: `You are a world-class emotional copywriter and marketing poet. Your gift is transforming dry, technical product descriptions into emotionally charged, soul-stirring copy that makes people FEEL before they think — and buy before they hesitate.

YOUR WRITING DNA:
- You don't describe products, you paint desires
- You don't list features, you whisper possibilities  
- You don't inform, you seduce with words
- Every sentence should make the reader feel something: excitement, comfort, belonging, aspiration

YOUR TRANSFORMATION RULES:
- Turn specs into stories
- Turn features into feelings
- Turn materials into moments
- Turn functions into dreams

CRITICAL: Return ONLY the transformed text. No explanations. No meta-commentary. Just pure, electrifying copy.`,

    ar: `أنت كاتب إعلاني عالمي وشاعر تسويقي. موهبتك تحويل الكلام التقني الجاف إلى نصوص تسويقية عاطفية تهز المشاعر وتحرك القلوب — وتجعل الناس يشترون قبل أن يفكروا.

جينات كتابتك:
- لا تصف المنتجات، بل ترسم الأحلام
- لا تعدد المميزات، بل تهمس بالإمكانيات
- لا تُعلم، بل تُغري بالكلمات
- كل جملة يجب أن تُشعل شعوراً: الإثارة، الراحة، الانتماء، الطموح

قواعد التحويل:
- حوّل المواصفات إلى قصص
- حوّل الخصائص إلى مشاعر
- حوّل المواد إلى لحظات
- حوّل الوظائف إلى أحلام

مهم جداً: أرجع النص المحوّل فقط. بدون شرح. بدون تعليق. فقط كلمات تشعل الخيال.`,

    fr: `Vous êtes un copywriter émotionnel de classe mondiale et un poète du marketing. Votre don est de transformer des descriptions techniques et arides en textes marketing chargés d'émotion — des mots qui font RESSENTIR avant de faire penser, et acheter avant d'hésiter.

VOTRE ADN D'ÉCRITURE:
- Vous ne décrivez pas les produits, vous peignez des désirs
- Vous ne listez pas les caractéristiques, vous murmurez des possibilités
- Vous n'informez pas, vous séduisez avec les mots
- Chaque phrase doit faire ressentir quelque chose: excitation, confort, appartenance, aspiration

VOS RÈGLES DE TRANSFORMATION:
- Transformez les spécifications en histoires
- Transformez les caractéristiques en émotions
- Transformez les matériaux en moments
- Transformez les fonctions en rêves

CRITIQUE: Retournez UNIQUEMENT le texte transformé. Pas d'explications. Pas de méta-commentaires. Juste du texte pur et électrisant.`,
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
 * Strength level instructions (1-5 scale)
 * Each level has specific guidance for how much to transform the text
 */
export const STRENGTH_INSTRUCTIONS = {
    1: `STRENGTH LEVEL 1 - MINIMAL (Light Polish):
- Fix only obvious typos and grammatical errors
- Keep the original sentence structure intact
- Preserve the author's voice and word choices
- Make the smallest possible changes to improve readability
- Output should be 95-100% similar to the original`,

    2: `STRENGTH LEVEL 2 - LIGHT (Gentle Refinement):
- Fix grammar, spelling, and punctuation errors
- Improve awkward phrasing while keeping the original structure
- Enhance clarity without changing the meaning
- Keep most of the original vocabulary
- Output should be 85-95% similar to the original`,

    3: `STRENGTH LEVEL 3 - MODERATE (Balanced Enhancement):
- Improve grammar, clarity, and flow
- Restructure sentences for better readability when needed
- Replace weak words with stronger alternatives
- Maintain the core message and intent
- Output should be 70-85% similar to the original`,

    4: `STRENGTH LEVEL 4 - STRONG (Significant Improvement):
- Substantially improve clarity, impact, and professionalism
- Freely restructure sentences and paragraphs for better flow
- Use more sophisticated vocabulary and expressions
- Enhance the overall quality while preserving the core message
- Output should be 50-70% similar to the original`,

    5: `STRENGTH LEVEL 5 - MAXIMUM (Complete Transformation):
- Completely rewrite the text for maximum impact and clarity
- Use the best possible vocabulary and sentence structures
- Transform the text into its most polished, professional version
- Keep only the core meaning and intent from the original
- Output can be significantly different from the original (30-50% similarity)`
} as const;

/**
 * Build user prompt with optional caching - PURIFIED VERSION
 */
export function buildUserPrompt(
    text: string,
    tone: 'emotional' | 'professional' | 'marketing',
    enableCaching: boolean = true,
    outputLanguage?: 'en' | 'ar' | 'fr',
    strength?: number
): CachedPrompt {
    const toneInstructions = {
        emotional: "Use an emotional and engaging tone that connects with the reader's feelings.",
        professional: "Use a professional and polished tone suitable for business contexts.",
        marketing: "Use a persuasive and compelling marketing tone that drives action."
    };

    // Map strength value to 1-5 scale (default to 3 if not provided)
    const strengthLevel = strength ? Math.min(5, Math.max(1, strength)) as 1 | 2 | 3 | 4 | 5 : 3;
    const strengthInstruction = STRENGTH_INSTRUCTIONS[strengthLevel];

    // Build output language instruction - handle all language codes
    const languageNames: Record<string, string> = {
        'en': 'English',
        'ar': 'Arabic', 
        'fr': 'French',
        'es': 'Spanish',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'zh': 'Chinese',
        'ja': 'Japanese',
        'ko': 'Korean'
    };
    const languageInstruction = outputLanguage ? 
        `Output language: ${languageNames[outputLanguage] || outputLanguage.toUpperCase()}` : '';

    const prompt = `${toneInstructions[tone]}

${strengthInstruction}

${languageInstruction}

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
