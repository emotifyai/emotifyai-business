/**
 * Prompt Caching for Claude API + composition entry points
 * @see https://docs.anthropic.com/claude/docs/prompt-caching
 */

import type { PromptRouteId, UserGenerationOptions } from './prompts/types'
import type { DetectionResult } from './prompts/types'
import {
  buildCachedSystemPrompt as composeCachedSystem,
  buildVariableLayer,
  composePrompt,
} from './prompts/composer'
export { SYSTEM_PROMPTS } from './prompts/languages/registry'
import { detectAndRoute } from './language-router'

export interface CachedPrompt {
  type: 'text'
  text: string
  cache_control?: {
    type: 'ephemeral'
  }
}

export interface CacheStats {
  hits: number
  misses: number
  totalRequests: number
  hitRate: number
  estimatedSavings: number
}

/** Build cached system prompt for a route (stable across requests) */
export function buildCachedSystemPrompt(routeId: PromptRouteId): CachedPrompt {
  return composeCachedSystem(routeId)
}

/** Build per-request variable user message (not cached) */
export function buildVariableUserPrompt(
  text: string,
  options: UserGenerationOptions,
  detection: DetectionResult,
  routeId: PromptRouteId
): CachedPrompt {
  return {
    type: 'text',
    text: buildVariableLayer(text, options, detection, routeId),
  }
}

/** Full pipeline: detect → route → compose */
export function buildEnhancementPrompts(text: string, options: UserGenerationOptions) {
  const { routeId, detection } = detectAndRoute(text, options.outputLanguage)
  const composition = composePrompt(text, options, detection, routeId)
  return {
    routeId,
    detection,
    systemPrompt: buildCachedSystemPrompt(routeId),
    userPrompt: {
      type: 'text' as const,
      text: composition.variableLayerText,
    },
  }
}

/** @deprecated Use buildEnhancementPrompts — kept for tests migrating gradually */
export function buildUserPrompt(
  text: string,
  tone: UserGenerationOptions['tone'] | 'professional',
  _enableCaching = false,
  outputLanguage?: string,
  strength?: number
): CachedPrompt {
  const opts: UserGenerationOptions = {
    outputLanguage:
      outputLanguage === 'ar' || outputLanguage === 'ar_gulf'
        ? 'ar_gulf'
        : outputLanguage === 'ar_msa'
          ? 'ar_msa'
          : 'en',
    tone: tone === 'professional' ? 'marketing' : tone,
    platform: 'store',
    strength,
  }
  const { userPrompt } = buildEnhancementPrompts(text, opts)
  return userPrompt
}

class CacheStatsTracker {
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    hitRate: 0,
    estimatedSavings: 0,
  }

  recordHit(tokensSaved: number): void {
    this.stats.hits++
    this.stats.totalRequests++
    this.stats.estimatedSavings += tokensSaved
    this.updateHitRate()
  }

  recordMiss(): void {
    this.stats.misses++
    this.stats.totalRequests++
    this.updateHitRate()
  }

  private updateHitRate(): void {
    if (this.stats.totalRequests > 0) {
      this.stats.hitRate = (this.stats.hits / this.stats.totalRequests) * 100
    }
  }

  getStats(): CacheStats {
    return { ...this.stats }
  }

  reset(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      hitRate: 0,
      estimatedSavings: 0,
    }
  }

  logStats(): void {
    console.log('[Prompt Cache] Statistics:', {
      ...this.stats,
      hitRate: `${this.stats.hitRate.toFixed(2)}%`,
      estimatedSavings: `${this.stats.estimatedSavings} tokens`,
    })
  }
}

export const cacheStats = new CacheStatsTracker()

export function parseCacheUsage(response: unknown): {
  cacheCreationTokens: number
  cacheReadTokens: number
  inputTokens: number
} {
  if (!response || typeof response !== 'object') {
    return { cacheCreationTokens: 0, cacheReadTokens: 0, inputTokens: 0 }
  }
  const usage = (response as { usage?: Record<string, number> }).usage || {}
  return {
    cacheCreationTokens: usage.cache_creation_input_tokens || 0,
    cacheReadTokens: usage.cache_read_input_tokens || 0,
    inputTokens: usage.input_tokens || 0,
  }
}

export function calculateCacheSavings(cacheUsage: ReturnType<typeof parseCacheUsage>): {
  tokensSaved: number
  percentageSaved: number
  wasCacheHit: boolean
} {
  const { cacheReadTokens, inputTokens } = cacheUsage
  const wasCacheHit = cacheReadTokens > 0
  const tokensSaved = Math.floor(cacheReadTokens * 0.9)
  const totalTokens = inputTokens + cacheReadTokens
  const percentageSaved = totalTokens > 0 ? (tokensSaved / totalTokens) * 100 : 0
  return { tokensSaved, percentageSaved, wasCacheHit }
}
