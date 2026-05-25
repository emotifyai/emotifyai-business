/**
 * Prompt Caching Tests
 */

import {
  buildCachedSystemPrompt,
  buildEnhancementPrompts,
  buildUserPrompt,
  cacheStats,
  parseCacheUsage,
  calculateCacheSavings,
  type CachedPrompt,
} from '../prompt-cache'
import type { PromptRouteId } from '../prompts/types'

describe('Prompt Caching', () => {
  beforeEach(() => {
    cacheStats.reset()
  })

  describe('buildCachedSystemPrompt', () => {
    const routeCases: [PromptRouteId, string][] = [
      ['ar-gulf', 'إيموتيفاي'],
      ['en', 'EmotifyAI'],
      ['ar-msa', 'فصحى'],
    ]

    it.each(routeCases)('builds cached prompt for route %s', (routeId, marker) => {
      const prompt = buildCachedSystemPrompt(routeId)
      expect(prompt).toEqual({
        type: 'text',
        text: expect.stringContaining(marker),
        cache_control: { type: 'ephemeral' },
      } satisfies CachedPrompt)
    })

    it('always includes ephemeral cache control', () => {
      const routes: PromptRouteId[] = ['ar-gulf', 'en', 'fallback-multilingual']
      routes.forEach((routeId) => {
        expect(buildCachedSystemPrompt(routeId).cache_control).toEqual({ type: 'ephemeral' })
      })
    })
  })

  describe('buildEnhancementPrompts', () => {
    it('returns system and user prompts for a route', () => {
      const result = buildEnhancementPrompts('شوي تدري والله ساعة ذكية زين وايد', {
        outputLanguage: 'ar_gulf',
        tone: 'marketing',
        platform: 'store',
      })

      expect(result.routeId).toBe('ar-gulf')
      expect(result.systemPrompt.cache_control?.type).toBe('ephemeral')
      expect(result.userPrompt.text).toContain('تسويقي')
      expect(result.userPrompt.text).toContain('متجر')
    })
  })

  describe('buildUserPrompt (deprecated shim)', () => {
    const testText = 'This is a test text that needs enhancement.'

    it('maps professional tone to marketing layer', () => {
      const prompt = buildUserPrompt(testText, 'professional', true)
      expect(prompt.type).toBe('text')
      expect(prompt.text).toContain('تسويقي')
      expect(prompt.text).toContain(testText)
    })

    it('includes product text in variable layer', () => {
      const prompt = buildUserPrompt(testText, 'marketing', false, 'ar_gulf')
      expect(prompt.text).toContain(testText)
      expect(prompt.cache_control).toBeUndefined()
    })
  })

  describe('CacheStatsTracker', () => {
    it('should start with zero stats', () => {
      expect(cacheStats.getStats()).toEqual({
        hits: 0,
        misses: 0,
        totalRequests: 0,
        hitRate: 0,
        estimatedSavings: 0,
      })
    })

    it('should record cache hits correctly', () => {
      cacheStats.recordHit(100)
      cacheStats.recordHit(50)
      const stats = cacheStats.getStats()
      expect(stats.hits).toBe(2)
      expect(stats.totalRequests).toBe(2)
      expect(stats.estimatedSavings).toBe(150)
      expect(stats.hitRate).toBe(100)
    })

    it('should record cache misses correctly', () => {
      cacheStats.recordMiss()
      cacheStats.recordMiss()
      const stats = cacheStats.getStats()
      expect(stats.misses).toBe(2)
      expect(stats.totalRequests).toBe(2)
      expect(stats.hitRate).toBe(0)
    })

    it('should calculate hit rate correctly with mixed results', () => {
      cacheStats.recordHit(100)
      cacheStats.recordMiss()
      cacheStats.recordHit(50)
      cacheStats.recordMiss()
      const stats = cacheStats.getStats()
      expect(stats.hits).toBe(2)
      expect(stats.misses).toBe(2)
      expect(stats.totalRequests).toBe(4)
      expect(stats.hitRate).toBe(50)
      expect(stats.estimatedSavings).toBe(150)
    })

    it('should reset stats correctly', () => {
      cacheStats.recordHit(100)
      cacheStats.reset()
      expect(cacheStats.getStats()).toEqual({
        hits: 0,
        misses: 0,
        totalRequests: 0,
        hitRate: 0,
        estimatedSavings: 0,
      })
    })
  })

  describe('parseCacheUsage', () => {
    it('should parse cache usage from API response', () => {
      const usage = parseCacheUsage({
        usage: {
          cache_creation_input_tokens: 50,
          cache_read_input_tokens: 100,
          input_tokens: 200,
        },
      })
      expect(usage).toEqual({
        cacheCreationTokens: 50,
        cacheReadTokens: 100,
        inputTokens: 200,
      })
    })

    it('should handle missing usage data', () => {
      expect(parseCacheUsage({})).toEqual({
        cacheCreationTokens: 0,
        cacheReadTokens: 0,
        inputTokens: 0,
      })
    })
  })

  describe('calculateCacheSavings', () => {
    it('should calculate savings for cache hit', () => {
      const savings = calculateCacheSavings({
        cacheCreationTokens: 0,
        cacheReadTokens: 100,
        inputTokens: 50,
      })
      expect(savings).toEqual({
        tokensSaved: 90,
        percentageSaved: 60,
        wasCacheHit: true,
      })
    })

    it('should floor token savings', () => {
      const savings = calculateCacheSavings({
        cacheCreationTokens: 0,
        cacheReadTokens: 33,
        inputTokens: 50,
      })
      expect(savings.tokensSaved).toBe(29)
    })
  })
})
