import Anthropic, { APIError } from '@anthropic-ai/sdk'
import {
  buildEnhancementPrompts,
  cacheStats,
  parseCacheUsage,
  calculateCacheSavings,
} from './prompt-cache'
import { completePurification } from './output-purifier'
import type { UserGenerationOptions } from './prompts/types'

// Always connect to Anthropic directly. System-level proxies (e.g. agentrouter.org)
// can intercept requests and block benign content. We explicitly bypass them here.
// Note: Bun does NOT override system env vars with .env.local values, so we hardcode
// the real Anthropic endpoint and use a dedicated env var name to avoid conflicts.
const ANTHROPIC_BASE_URL = 'https://api.anthropic.com'
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_DIRECT_KEY || process.env.ANTHROPIC_API_KEY || ''

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
  baseURL: ANTHROPIC_BASE_URL,
  dangerouslyAllowBrowser: process.env.NODE_ENV === 'test',
})

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'
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
        
        const errorBody = error.error as any
        if (error.status === 400 && (errorBody?.error?.code === 'content-blocked' || errorBody?.code === 'content-blocked')) {
          console.error('Anthropic API content blocked:', error)
          throw new Error('CONTENT_BLOCKED')
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

export type EnhanceStreamDeltaCallback = (delta: string) => void | Promise<void>

/**
 * Stream enhancement tokens via Anthropic Messages API, then purify the full output.
 */
export async function enhanceTextStream(
  options: EnhanceOptions,
  onDelta: EnhanceStreamDeltaCallback
): Promise<EnhanceResult> {
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

      console.log('[DUCK ai/prompts] Sending to Anthropic:', {
        model: MODEL,
        systemLen: systemPrompt.text.length,
        userLen: userPrompt.text.length,
        systemPreview: systemPrompt.text.slice(0, 100) + '...',
        userPreview: userPrompt.text.slice(0, 100) + '...',
      })

      const stream = anthropic.messages.stream({
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

      let rawText = ''
      stream.on('text', (textDelta) => {
        rawText += textDelta
        void onDelta(textDelta)
      })

      const message = await stream.finalMessage()

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
        
        const errorBody = error.error as any
        if (error.status === 400 && (errorBody?.error?.code === 'content-blocked' || errorBody?.code === 'content-blocked')) {
          console.error('Anthropic API content blocked:', error)
          throw new Error('CONTENT_BLOCKED')
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

export async function mockEnhanceTextStream(
  options: EnhanceOptions,
  onDelta: EnhanceStreamDeltaCallback
): Promise<EnhanceResult> {
  const full = `[ENHANCED] ${options.text}`
  const chunkSize = 8
  for (let i = 0; i < full.length; i += chunkSize) {
    const piece = full.slice(i, i + chunkSize)
    await new Promise((resolve) => setTimeout(resolve, 30))
    await onDelta(piece)
  }
  return {
    enhancedText: full,
    tokensUsed: 100,
    language: options.outputLanguage,
    routeId: 'ar-gulf',
  }
}
