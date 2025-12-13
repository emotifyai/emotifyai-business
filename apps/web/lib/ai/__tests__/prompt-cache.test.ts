/**
 * Prompt Caching Tests
 * Tests the Claude prompt caching functionality for cost optimization
 */

import {
  buildCachedSystemPrompt,
  buildUserPrompt,
  cacheStats,
  parseCacheUsage,
  calculateCacheSavings,
  SYSTEM_PROMPTS,
  type CachedPrompt
} from '../prompt-cache'

describe('Prompt Caching', () => {
  beforeEach(() => {
    cacheStats.reset()
  })

  describe('SYSTEM_PROMPTS', () => {
    it('should contain prompts for all supported languages', () => {
      expect(SYSTEM_PROMPTS.en).toBeDefined()
      expect(SYSTEM_PROMPTS.ar).toBeDefined()
      expect(SYSTEM_PROMPTS.fr).toBeDefined()
    })

    it('should have meaningful English prompt', () => {
      const prompt = SYSTEM_PROMPTS.en
      expect(prompt).toContain('professional writing assistant')
      expect(prompt).toContain('English text enhancement')
      expect(prompt).toContain('Improve clarity')
      expect(prompt).toContain('grammar')
    })

    it('should have meaningful Arabic prompt', () => {
      const prompt = SYSTEM_PROMPTS.ar
      expect(prompt).toContain('مساعد كتابة محترف')
      expect(prompt).toContain('النصوص العربية')
      expect(prompt).toContain('تحسين الوضوح')
      expect(prompt).toContain('القواعد')
    })

    it('should have meaningful French prompt', () => {
      const prompt = SYSTEM_PROMPTS.fr
      expect(prompt).toContain('assistant d\'écriture professionnel')
      expect(prompt).toContain('textes en français')
      expect(prompt).toContain('clarté')
      expect(prompt).toContain('grammaire')
    })
  })

  describe('buildCachedSystemPrompt', () => {
    it('should build cached prompt for English', () => {
      const prompt = buildCachedSystemPrompt('en')
      
      expect(prompt).toEqual({
        type: 'text',
        text: SYSTEM_PROMPTS.en,
        cache_control: {
          type: 'ephemeral'
        }
      })
    })

    it('should build cached prompt for Arabic', () => {
      const prompt = buildCachedSystemPrompt('ar')
      
      expect(prompt).toEqual({
        type: 'text',
        text: SYSTEM_PROMPTS.ar,
        cache_control: {
          type: 'ephemeral'
        }
      })
    })

    it('should build cached prompt for French', () => {
      const prompt = buildCachedSystemPrompt('fr')
      
      expect(prompt).toEqual({
        type: 'text',
        text: SYSTEM_PROMPTS.fr,
        cache_control: {
          type: 'ephemeral'
        }
      })
    })

    it('should always include cache control', () => {
      const languages: Array<'en' | 'ar' | 'fr'> = ['en', 'ar', 'fr']
      
      languages.forEach(lang => {
        const prompt = buildCachedSystemPrompt(lang)
        expect(prompt.cache_control).toEqual({ type: 'ephemeral' })
      })
    })
  })

  describe('buildUserPrompt', () => {
    const testText = 'This is a test text that needs enhancement.'

    it('should build prompt with professional tone', () => {
      const prompt = buildUserPrompt(testText, 'professional', true)
      
      expect(prompt.type).toBe('text')
      expect(prompt.text).toContain('Use a professional and polished tone')
      expect(prompt.text).toContain(testText)
      expect(prompt.cache_control).toEqual({ type: 'ephemeral' })
    })

    it('should build prompt with casual tone', () => {
      const prompt = buildUserPrompt(testText, 'casual', true)
      
      expect(prompt.text).toContain('Use a friendly and conversational tone')
      expect(prompt.text).toContain(testText)
    })

    it('should build prompt with formal tone', () => {
      const prompt = buildUserPrompt(testText, 'formal', true)
      
      expect(prompt.text).toContain('Use a formal and academic tone')
      expect(prompt.text).toContain(testText)
    })

    it('should include cache control when enabled', () => {
      const prompt = buildUserPrompt(testText, 'professional', true)
      
      expect(prompt.cache_control).toEqual({ type: 'ephemeral' })
    })

    it('should exclude cache control when disabled', () => {
      const prompt = buildUserPrompt(testText, 'professional', false)
      
      expect(prompt.cache_control).toBeUndefined()
    })

    it('should include enhancement instructions', () => {
      const prompt = buildUserPrompt(testText, 'professional', true)
      
      expect(prompt.text).toContain('Enhance and improve the following text')
      expect(prompt.text).toContain('maintaining its core meaning')
      expect(prompt.text).toContain('Text to process:')
    })

    it('should handle different text inputs', () => {
      const texts = [
        'Short text',
        'This is a much longer text that contains multiple sentences and should be handled properly by the prompt builder.',
        'Text with special characters: @#$%^&*()',
        'Text with numbers: 123 456 789',
        'Text with emojis: 🚀 🌟 💯'
      ]

      texts.forEach(text => {
        const prompt = buildUserPrompt(text, 'professional', true)
        expect(prompt.text).toContain(text)
        expect(prompt.type).toBe('text')
      })
    })
  })

  describe('CacheStatsTracker', () => {
    it('should start with zero stats', () => {
      const stats = cacheStats.getStats()
      
      expect(stats).toEqual({
        hits: 0,
        misses: 0,
        totalRequests: 0,
        hitRate: 0,
        estimatedSavings: 0
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
      expect(stats.estimatedSavings).toBe(0)
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
      cacheStats.recordMiss()
      
      cacheStats.reset()
      
      const stats = cacheStats.getStats()
      expect(stats).toEqual({
        hits: 0,
        misses: 0,
        totalRequests: 0,
        hitRate: 0,
        estimatedSavings: 0
      })
    })

    it('should log stats without errors', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      cacheStats.recordHit(100)
      cacheStats.recordMiss()
      cacheStats.logStats()
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Prompt Cache] Statistics:',
        expect.objectContaining({
          hits: 1,
          misses: 1,
          totalRequests: 2,
          hitRate: '50.00%',
          estimatedSavings: '100 tokens'
        })
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('parseCacheUsage', () => {
    it('should parse cache usage from API response', () => {
      const mockResponse = {
        usage: {
          cache_creation_input_tokens: 50,
          cache_read_input_tokens: 100,
          input_tokens: 200
        }
      }
      
      const usage = parseCacheUsage(mockResponse)
      
      expect(usage).toEqual({
        cacheCreationTokens: 50,
        cacheReadTokens: 100,
        inputTokens: 200
      })
    })

    it('should handle missing usage data', () => {
      const mockResponse = {}
      
      const usage = parseCacheUsage(mockResponse)
      
      expect(usage).toEqual({
        cacheCreationTokens: 0,
        cacheReadTokens: 0,
        inputTokens: 0
      })
    })

    it('should handle partial usage data', () => {
      const mockResponse = {
        usage: {
          input_tokens: 150
        }
      }
      
      const usage = parseCacheUsage(mockResponse)
      
      expect(usage).toEqual({
        cacheCreationTokens: 0,
        cacheReadTokens: 0,
        inputTokens: 150
      })
    })

    it('should handle null/undefined response', () => {
      expect(parseCacheUsage(null)).toEqual({
        cacheCreationTokens: 0,
        cacheReadTokens: 0,
        inputTokens: 0
      })
      
      expect(parseCacheUsage(undefined)).toEqual({
        cacheCreationTokens: 0,
        cacheReadTokens: 0,
        inputTokens: 0
      })
    })
  })

  describe('calculateCacheSavings', () => {
    it('should calculate savings for cache hit', () => {
      const cacheUsage = {
        cacheCreationTokens: 0,
        cacheReadTokens: 100,
        inputTokens: 50
      }
      
      const savings = calculateCacheSavings(cacheUsage)
      
      expect(savings).toEqual({
        tokensSaved: 90, // 100 * 0.9
        percentageSaved: 60, // 90 / (50 + 100) * 100
        wasCacheHit: true
      })
    })

    it('should calculate no savings for cache miss', () => {
      const cacheUsage = {
        cacheCreationTokens: 50,
        cacheReadTokens: 0,
        inputTokens: 100
      }
      
      const savings = calculateCacheSavings(cacheUsage)
      
      expect(savings).toEqual({
        tokensSaved: 0,
        percentageSaved: 0,
        wasCacheHit: false
      })
    })

    it('should handle zero tokens', () => {
      const cacheUsage = {
        cacheCreationTokens: 0,
        cacheReadTokens: 0,
        inputTokens: 0
      }
      
      const savings = calculateCacheSavings(cacheUsage)
      
      expect(savings).toEqual({
        tokensSaved: 0,
        percentageSaved: 0,
        wasCacheHit: false
      })
    })

    it('should calculate correct percentage for different scenarios', () => {
      // High cache hit ratio
      const highCacheUsage = {
        cacheCreationTokens: 0,
        cacheReadTokens: 200,
        inputTokens: 50
      }
      
      const highSavings = calculateCacheSavings(highCacheUsage)
      expect(highSavings.percentageSaved).toBeCloseTo(72, 0) // 180 / 250 * 100
      
      // Low cache hit ratio
      const lowCacheUsage = {
        cacheCreationTokens: 0,
        cacheReadTokens: 50,
        inputTokens: 200
      }
      
      const lowSavings = calculateCacheSavings(lowCacheUsage)
      expect(lowSavings.percentageSaved).toBeCloseTo(18, 0) // 45 / 250 * 100
    })

    it('should floor token savings', () => {
      const cacheUsage = {
        cacheCreationTokens: 0,
        cacheReadTokens: 33, // 33 * 0.9 = 29.7
        inputTokens: 50
      }
      
      const savings = calculateCacheSavings(cacheUsage)
      
      expect(savings.tokensSaved).toBe(29) // Should be floored
    })
  })

  describe('integration scenarios', () => {
    it('should work with typical API response flow', () => {
      // Simulate typical API response
      const mockResponse = {
        usage: {
          cache_creation_input_tokens: 0,
          cache_read_input_tokens: 150,
          input_tokens: 75,
          output_tokens: 50
        }
      }
      
      // Parse usage
      const usage = parseCacheUsage(mockResponse)
      expect(usage.cacheReadTokens).toBe(150)
      
      // Calculate savings
      const savings = calculateCacheSavings(usage)
      expect(savings.wasCacheHit).toBe(true)
      expect(savings.tokensSaved).toBe(135) // 150 * 0.9
      
      // Record in stats
      cacheStats.recordHit(savings.tokensSaved)
      
      const stats = cacheStats.getStats()
      expect(stats.hits).toBe(1)
      expect(stats.estimatedSavings).toBe(135)
    })

    it('should handle cache miss flow', () => {
      const mockResponse = {
        usage: {
          cache_creation_input_tokens: 200,
          cache_read_input_tokens: 0,
          input_tokens: 100,
          output_tokens: 75
        }
      }
      
      const usage = parseCacheUsage(mockResponse)
      const savings = calculateCacheSavings(usage)
      
      expect(savings.wasCacheHit).toBe(false)
      expect(savings.tokensSaved).toBe(0)
      
      cacheStats.recordMiss()
      
      const stats = cacheStats.getStats()
      expect(stats.misses).toBe(1)
      expect(stats.estimatedSavings).toBe(0)
    })
  })
})