/**
 * Claude AI Integration Tests
 */

jest.mock('@anthropic-ai/sdk', () => {
  const create = jest.fn()
  ;(globalThis as { __anthropicMockCreate?: jest.Mock }).__anthropicMockCreate = create

  class APIError extends Error {
    status: number
    constructor(status: number, _body?: unknown, message?: string, _headers?: unknown) {
      super(message ?? 'APIError')
      this.status = status
      this.name = 'APIError'
    }
  }

  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      messages: { create },
    })),
    APIError,
  }
})

const getMockCreate = () =>
  (globalThis as { __anthropicMockCreate?: jest.Mock }).__anthropicMockCreate!

import { APIError } from '@anthropic-ai/sdk'
import { enhanceText, mockEnhanceText, type EnhanceOptions } from '../claude'
import { buildCachedSystemPrompt, buildEnhancementPrompts, cacheStats } from '../prompt-cache'

const defaultOptions: EnhanceOptions = {
  text: 'test text',
  outputLanguage: 'en',
  tone: 'marketing',
  platform: 'store',
}

const originalEnv = process.env

beforeEach(() => {
  process.env = {
    ...originalEnv,
    ANTHROPIC_API_KEY: 'test-api-key',
    ANTHROPIC_MODEL: 'claude-3-5-sonnet-20241022',
    ANTHROPIC_MAX_TOKENS: '1024',
  }
  jest.clearAllMocks()
  cacheStats.reset()
})

afterEach(() => {
  process.env = originalEnv
})

describe('Claude AI Integration', () => {
  describe('enhanceText', () => {
    it('should enhance English text successfully', async () => {
      getMockCreate().mockResolvedValue({
        content: [{ type: 'text', text: 'Enhanced English product copy.' }],
        usage: {
          input_tokens: 50,
          output_tokens: 25,
          cache_creation_input_tokens: 0,
          cache_read_input_tokens: 0,
        },
      })

      const result = await enhanceText({
        ...defaultOptions,
        text: 'this is original text',
      })

      expect(result.enhancedText).toBe('Enhanced English product copy.')
      expect(result.tokensUsed).toBe(75)
      expect(result.language).toBe('en')
      expect(getMockCreate()).toHaveBeenCalled()
    })

    it('should enhance Gulf Arabic output', async () => {
      getMockCreate().mockResolvedValue({
        content: [{ type: 'text', text: 'نص خليجي محسّن للمنتج.' }],
        usage: { input_tokens: 60, output_tokens: 30 },
      })

      const result = await enhanceText({
        text: 'شوي المنتج زين',
        outputLanguage: 'ar_gulf',
        tone: 'emotional',
        platform: 'whatsapp',
      })

      expect(result.language).toBe('ar_gulf')
      expect(result.enhancedText).toMatch(/[\u0600-\u06FF]/)
    })

    it('should handle cache hits correctly', async () => {
      getMockCreate().mockResolvedValue({
        content: [{ type: 'text', text: 'Enhanced text with cache hit.' }],
        usage: {
          input_tokens: 20,
          output_tokens: 15,
          cache_read_input_tokens: 40,
        },
      })

      const result = await enhanceText(defaultOptions)
      expect(result.cached).toBe(true)
      expect(result.cacheStats?.tokensSaved).toBe(36)
    })

    it('should retry on rate limit then succeed', async () => {
      const rateLimitError = new APIError(429, undefined, 'Rate limit exceeded')
      getMockCreate()
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce({
          content: [{ type: 'text', text: 'Enhanced after retry' }],
          usage: { input_tokens: 30, output_tokens: 20 },
        })

      const startTime = Date.now()
      const result = await enhanceText(defaultOptions)
      expect(result.enhancedText).toBe('Enhanced after retry')
      expect(Date.now() - startTime).toBeGreaterThan(500)
    })

    it('should throw after max retries on rate limit', async () => {
      const rateLimit = new APIError(429, undefined, 'Rate limit')
      getMockCreate()
        .mockRejectedValueOnce(rateLimit)
        .mockRejectedValueOnce(rateLimit)
        .mockRejectedValueOnce(rateLimit)
      await expect(enhanceText(defaultOptions)).rejects.toThrow('RATE_LIMIT_EXCEEDED')
    })

    it('should handle API errors', async () => {
      getMockCreate().mockRejectedValue(new APIError(400, undefined, 'Invalid'))
      await expect(enhanceText(defaultOptions)).rejects.toThrow('AI_SERVICE_ERROR')
    })

    it('should handle unexpected errors', async () => {
      getMockCreate().mockRejectedValue(new Error('Network error'))
      await expect(enhanceText(defaultOptions)).rejects.toThrow('INTERNAL_ERROR')
    })
  })

  describe('mockEnhanceText', () => {
    it('should return mock enhancement with delay', async () => {
      const result = await mockEnhanceText({
        ...defaultOptions,
        text: 'original text',
      })
      expect(result.enhancedText).toBe('[ENHANCED] original text')
    })
  })

  describe('prompt construction', () => {
    it('should build cached system prompt for route', () => {
      const prompt = buildCachedSystemPrompt('en')
      expect(prompt.text).toContain('EmotifyAI')
      expect(prompt.cache_control).toEqual({ type: 'ephemeral' })
    })

    it('should build enhancement prompts with variable layer', () => {
      const { userPrompt, routeId } = buildEnhancementPrompts('شوي تدري والله منتج زين', {
        outputLanguage: 'ar_gulf',
        tone: 'exclusive',
        platform: 'instagram',
      })
      expect(routeId).toBe('ar-gulf')
      expect(userPrompt.text).toContain('حصري')
      expect(userPrompt.text).toContain('إنستغرام')
    })
  })
})
