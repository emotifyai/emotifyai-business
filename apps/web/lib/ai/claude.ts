import Anthropic from '@anthropic-ai/sdk';
import {
    buildCachedSystemPrompt,
    buildUserPrompt,
    cacheStats,
    parseCacheUsage,
    calculateCacheSavings
} from './prompt-cache';
import { completePurification } from './output-purifier';

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    dangerouslyAllowBrowser: process.env.NODE_ENV === 'test', // Allow in test environment
})

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022'
const MAX_TOKENS = parseInt(process.env.ANTHROPIC_MAX_TOKENS || '1024', 10)

export interface EnhanceOptions {
    text: string
    language?: string
    outputLanguage?: string
    tone?: 'emotional' | 'professional' | 'marketing'
    strength?: number
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
    purification?: {
        wasImpure: boolean
        issues: string[]
        confidence: 'high' | 'medium' | 'low'
    }
}

/**
 * Enhance text using Claude AI
 * Implements retry logic with exponential backoff
 */
export async function enhanceText(options: EnhanceOptions): Promise<EnhanceResult> {
    const { 
        text, 
        language = 'en', 
        outputLanguage, 
        tone = 'professional',
        strength = 3 
    } = options

    let retries = 0
    const maxRetries = 3

    while (retries < maxRetries) {
        try {
            // Detect language if needed
            const detectedLanguage = language as 'en' | 'ar' | 'fr';
            const finalOutputLanguage = outputLanguage || detectedLanguage;

            // Build cached prompts
            const systemPrompt = buildCachedSystemPrompt(detectedLanguage);
            const userPromptContent = buildUserPrompt(
                text, 
                tone, 
                true, 
                finalOutputLanguage as 'en' | 'ar' | 'fr',
                strength
            );

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

            // Extract the raw text from the response
            const rawText = message.content
                .filter((block) => block.type === 'text')
                .map((block) => (block as Anthropic.TextBlock).text)
                .join('\n')

            // PURIFICATION: Clean the AI output
            const purificationResult = completePurification(rawText, finalOutputLanguage as 'en' | 'ar' | 'fr');
            
            // Use purified text as the final result
            const enhancedText = purificationResult.cleanText;

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

            // Log purification results in development
            if (process.env.NODE_ENV === 'development' && purificationResult.wasImpure) {
                console.log('[Purification] Cleaned impure output:', {
                    issues: purificationResult.issues,
                    confidence: purificationResult.confidence,
                    originalLength: rawText.length,
                    cleanedLength: enhancedText.length
                });
            }

            return {
                enhancedText,
                tokensUsed,
                language: finalOutputLanguage,
                cached: savings.wasCacheHit,
                cacheStats: {
                    tokensSaved: savings.tokensSaved,
                    percentageSaved: savings.percentageSaved
                },
                purification: {
                    wasImpure: purificationResult.wasImpure,
                    issues: purificationResult.issues,
                    confidence: purificationResult.confidence
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
