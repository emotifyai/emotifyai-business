import Anthropic, { APIError } from '@anthropic-ai/sdk'
import {
  buildEnhancementPrompts,
  cacheStats,
  parseCacheUsage,
  calculateCacheSavings,
} from './prompt-cache'
import { completePurification } from './output-purifier'
import type { UserGenerationOptions } from './prompts/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  dangerouslyAllowBrowser: process.env.NODE_ENV === 'test',
})

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022'
const MAX_TOKENS = parseInt(process.env.ANTHROPIC_MAX_TOKENS || '1024', 10)

export interface EnhanceOptions {
  text: string
  outputLanguage: UserGenerationOptions['outputLanguage']
  tone: UserGenerationOptions['tone']
  platform: UserGenerationOptions['platform']
  strength?: number
}

export interface EnhanceResult {
  enhancedText: string
  tokensUsed: number
  language: string
  routeId?: string
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

function purifyLanguageKey(output: UserGenerationOptions['outputLanguage']): 'en' | 'ar' | 'fr' {
  if (output === 'en') return 'en'
  return 'ar'
}

export async function enhanceText(options: EnhanceOptions): Promise<EnhanceResult> {
  const { text, outputLanguage, tone, platform, strength = 5 } = options

  const userOptions: UserGenerationOptions = {
    outputLanguage,
    tone,
    platform,
    strength,
  }

  let retries = 0
  const maxRetries = 3

  while (retries < maxRetries) {
    try {
      const { systemPrompt, userPrompt, routeId } = buildEnhancementPrompts(text, userOptions)

      const message = await anthropic.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: [systemPrompt],
        messages: [
          {
            role: 'user',
            content: [userPrompt],
          },
        ],
      })

      const rawText = message.content
        .filter((block) => block.type === 'text')
        .map((block) => (block as Anthropic.TextBlock).text)
        .join('\n')

      const purificationResult = completePurification(rawText, purifyLanguageKey(outputLanguage))
      const enhancedText = purificationResult.cleanText

      const cacheUsage = parseCacheUsage(message)
      const savings = calculateCacheSavings(cacheUsage)

      if (savings.wasCacheHit) {
        cacheStats.recordHit(savings.tokensSaved)
      } else {
        cacheStats.recordMiss()
      }

      const tokensUsed = message.usage.input_tokens + message.usage.output_tokens

      if (cacheStats.getStats().totalRequests % 10 === 0) {
        cacheStats.logStats()
      }

      return {
        enhancedText,
        tokensUsed,
        language: outputLanguage,
        routeId,
        cached: savings.wasCacheHit,
        cacheStats: {
          tokensSaved: savings.tokensSaved,
          percentageSaved: savings.percentageSaved,
        },
        purification: {
          wasImpure: purificationResult.wasImpure,
          issues: purificationResult.issues,
          confidence: purificationResult.confidence,
        },
      }
    } catch (error) {
      if (error instanceof APIError) {
        if (error.status === 429) {
          retries++
          if (retries >= maxRetries) {
            throw new Error('RATE_LIMIT_EXCEEDED')
          }
          const delay = Math.pow(2, retries) * 1000
          await new Promise((resolve) => setTimeout(resolve, delay))
          continue
        }
        console.error('Anthropic API error:', error)
        throw new Error('AI_SERVICE_ERROR')
      }
      console.error('Unexpected error:', error)
      throw new Error('INTERNAL_ERROR')
    }
  }

  throw new Error('MAX_RETRIES_EXCEEDED')
}

export async function mockEnhanceText(options: EnhanceOptions): Promise<EnhanceResult> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return {
    enhancedText: `[ENHANCED] ${options.text}`,
    tokensUsed: 100,
    language: options.outputLanguage,
    routeId: 'ar-gulf',
  }
}
