import Anthropic from '@anthropic-ai/sdk';
import {
    buildCachedSystemPrompt,
    buildUserPrompt,
    cacheStats,
    parseCacheUsage,
    calculateCacheSavings
} from './prompt-cache';

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
})

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022'
const MAX_TOKENS = parseInt(process.env.ANTHROPIC_MAX_TOKENS || '1024', 10)

export interface EnhanceOptions {
    text: string
    language?: string
    tone?: 'formal' | 'casual' | 'professional'
}

export interface EnhanceResult {
    enhancedText: string
    tokensUsed: number
    language: string
    cached?: boolean
    cacheStats?: {
        tokensSaved: number
        percentageSaved: number
    }
}

/**
 * Enhance text using Claude AI
 * Implements retry logic with exponential backoff
 */
export async function enhanceText(options: EnhanceOptions): Promise<EnhanceResult> {
    const { text, language = 'en', tone = 'professional' } = options

    let retries = 0
    const maxRetries = 3

    while (retries < maxRetries) {
        try {
            // Detect language if needed
            const detectedLanguage = language as 'en' | 'ar' | 'fr';

            // Build cached prompts
            const systemPrompt = buildCachedSystemPrompt(detectedLanguage);
            const userPromptContent = buildUserPrompt(text, tone, true);

            const message = await anthropic.messages.create({
                model: MODEL,
                max_tokens: MAX_TOKENS,
                system: [systemPrompt],
                messages: [
                    {
                        role: 'user',
                        content: [userPromptContent],
                    },
                ],
            })

            // Extract the text from the response
            const enhancedText = message.content
                .filter((block) => block.type === 'text')
                .map((block) => (block as Anthropic.TextBlock).text)
                .join('\n')

            // Parse cache usage
            const cacheUsage = parseCacheUsage(message);
            const savings = calculateCacheSavings(cacheUsage);

            // Track cache statistics
            if (savings.wasCacheHit) {
                cacheStats.recordHit(savings.tokensSaved);
            } else {
                cacheStats.recordMiss();
            }

            // Calculate total tokens used
            const tokensUsed = message.usage.input_tokens + message.usage.output_tokens

            // Log cache stats periodically
            if (cacheStats.getStats().totalRequests % 10 === 0) {
                cacheStats.logStats();
            }

            return {
                enhancedText,
                tokensUsed,
                language: detectedLanguage,
                cached: savings.wasCacheHit,
                cacheStats: {
                    tokensSaved: savings.tokensSaved,
                    percentageSaved: savings.percentageSaved
                }
            }
        } catch (error) {
            if (error instanceof Anthropic.APIError) {
                // Handle rate limiting with exponential backoff
                if (error.status === 429) {
                    retries++
                    if (retries >= maxRetries) {
                        throw new Error('RATE_LIMIT_EXCEEDED')
                    }

                    const delay = Math.pow(2, retries) * 1000 // Exponential backoff
                    await new Promise((resolve) => setTimeout(resolve, delay))
                    continue
                }

                // Handle other API errors
                console.error('Anthropic API error:', error)
                throw new Error('AI_SERVICE_ERROR')
            }

            // Handle unexpected errors
            console.error('Unexpected error:', error)
            throw new Error('INTERNAL_ERROR')
        }
    }

    throw new Error('MAX_RETRIES_EXCEEDED')
}



/**
 * Mock enhancement for development/testing
 * Set MOCK_AI_RESPONSES=true in .env.local to use this
 */
export async function mockEnhanceText(options: EnhanceOptions): Promise<EnhanceResult> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const { text } = options

    return {
        enhancedText: `[ENHANCED] ${text}`,
        tokensUsed: 100,
        language: options.language || 'en',
    }
}
