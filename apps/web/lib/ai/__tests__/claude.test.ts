/**
 * Claude AI Integration Tests
 * Tests the Claude API integration, prompt caching, and error handling
 */

import { enhanceText, mockEnhanceText, type EnhanceOptions } from '../claude'
import { buildCachedSystemPrompt, buildUserPrompt, cacheStats } from '../prompt-cache'
import Anthropic from '@anthropic-ai/sdk'

// Mock Anthropic SDK
jest.mock('@anthropic-ai/sdk')
const MockAnthropic = Anthropic as jest.MockedClass<typeof Anthropic>

// Mock the claude module to reset the client
jest.mock('../claude', () => {
  const originalModule = jest.requireActual('../claude')
  return {
    ...originalModule,
    // We'll override the client in tests
  }
})

// Mock environment variables
const originalEnv = process.env
beforeEach(() => {
  process.env = {
    ...originalEnv,
    ANTHROPIC_API_KEY: 'test-api-key',
    ANTHROPIC_MODEL: 'claude-3-5-sonnet-20241022',
    ANTHROPIC_MAX_TOKENS: '1024'
  }
  jest.clearAllMocks()
  cacheStats.reset()
})

afterEach(() => {
  process.env = originalEnv
})

describe('Claude AI Integration', () => {
  let mockMessages: jest.Mock

  beforeEach(() => {
    mockMessages = jest.fn()
    MockAnthropic.mockImplementation(() => ({
      messages: {
        create: mockMessages
      }
    }) as any)
  })

  describe('enhanceText', () => {

    it('should enhance text successfully with English', async () => {
      const mockResponse = {
        content: [
          {
            type: 'text',
            text: 'This is an enhanced version of the original text with improved clarity and professionalism.'
          }
        ],
        usage: {
          input_tokens: 50,
          output_tokens: 25,
          cache_creation_input_tokens: 0,
          cache_read_input_tokens: 0
        }
      }

      mockMessages.mockResolvedValue(mockResponse)

      const options: EnhanceOptions = {
        text: 'this is original text',
        language: 'en',
        tone: 'professional'
      }

      const result = await enhanceText(options)

      expect(result).toEqual({
        enhancedText: 'This is an enhanced version of the original text with improved clarity and professionalism.',
        tokensUsed: 75,
        language: 'en',
        cached: false,
        cacheStats: {
          tokensSaved: 0,
          percentageSaved: 0
        }
      })

      expect(mockMessages).toHaveBeenCalledWith({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: [expect.objectContaining({
          type: 'text',
          cache_control: { type: 'ephemeral' }
        })],
        messages: [
          {
            role: 'user',
            content: [expect.objectContaining({
              type: 'text',
              cache_control: { type: 'ephemeral' }
            })]
          }
        ]
      })
    })

    it('should enhance text successfully with Arabic', async () => {
      const mockResponse = {
        content: [
          {
            type: 'text',
            text: 'هذا نص محسن باللغة العربية مع وضوح أفضل واحترافية عالية.'
          }
        ],
        usage: {
          input_tokens: 60,
          output_tokens: 30,
          cache_creation_input_tokens: 0,
          cache_read_input_tokens: 0
        }
      }

      mockMessages.mockResolvedValue(mockResponse)

      const options: EnhanceOptions = {
        text: 'نص عربي أصلي',
        language: 'ar',
        tone: 'formal'
      }

      const result = await enhanceText(options)

      expect(result.language).toBe('ar')
      expect(result.enhancedText).toBe('هذا نص محسن باللغة العربية مع وضوح أفضل واحترافية عالية.')
      expect(result.tokensUsed).toBe(90)
    })

    it('should enhance text successfully with French', async () => {
      const mockResponse = {
        content: [
          {
            type: 'text',
            text: 'Ceci est une version améliorée du texte original avec une clarté et un professionnalisme accrus.'
          }
        ],
        usage: {
          input_tokens: 55,
          output_tokens: 28,
          cache_creation_input_tokens: 0,
          cache_read_input_tokens: 0
        }
      }

      mockMessages.mockResolvedValue(mockResponse)

      const options: EnhanceOptions = {
        text: 'texte français original',
        language: 'fr',
        tone: 'casual'
      }

      const result = await enhanceText(options)

      expect(result.language).toBe('fr')
      expect(result.enhancedText).toBe('Ceci est une version améliorée du texte original avec une clarté et un professionnalisme accrus.')
    })

    it('should handle cache hits correctly', async () => {
      const mockResponse = {
        content: [
          {
            type: 'text',
            text: 'Enhanced text with cache hit.'
          }
        ],
        usage: {
          input_tokens: 20,
          output_tokens: 15,
          cache_creation_input_tokens: 0,
          cache_read_input_tokens: 40 // Cache hit
        }
      }

      mockMessages.mockResolvedValue(mockResponse)

      const options: EnhanceOptions = {
        text: 'test text',
        language: 'en',
        tone: 'professional'
      }

      const result = await enhanceText(options)

      expect(result.cached).toBe(true)
      expect(result.cacheStats?.tokensSaved).toBe(36) // 40 * 0.9
      expect(result.cacheStats?.percentageSaved).toBeGreaterThan(0)
    })

    it('should handle rate limiting with exponential backoff', async () => {
      const rateLimitError = new Anthropic.APIError(
        429,
        { status: 429 } as any,
        'Rate limit exceeded',
        {} as any
      )

      const mockResponse = {
        content: [{ type: 'text', text: 'Enhanced after retry' }],
        usage: { input_tokens: 30, output_tokens: 20 }
      }

      mockMessages
        .mockRejectedValueOnce(rateLimitError)
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce(mockResponse)

      const options: EnhanceOptions = {
        text: 'test text',
        language: 'en'
      }

      const startTime = Date.now()
      const result = await enhanceText(options)
      const endTime = Date.now()

      expect(result.enhancedText).toBe('Enhanced after retry')
      expect(endTime - startTime).toBeGreaterThan(1000) // Should have delays
    })

    it('should throw error after max retries exceeded', async () => {
      const rateLimitError = new Anthropic.APIError(
        429,
        { status: 429 } as any,
        'Rate limit exceeded',
        {} as any
      )

      mockMessages.mockRejectedValue(rateLimitError)

      const options: EnhanceOptions = {
        text: 'test text',
        language: 'en'
      }

      await expect(enhanceText(options)).rejects.toThrow('MAX_RETRIES_EXCEEDED')
    })

    it('should handle API errors correctly', async () => {
      const apiError = new Anthropic.APIError(
        400,
        { status: 400 } as any,
        'Invalid request',
        {} as any
      )

      mockMessages.mockRejectedValue(apiError)

      const options: EnhanceOptions = {
        text: 'test text',
        language: 'en'
      }

      await expect(enhanceText(options)).rejects.toThrow('AI_SERVICE_ERROR')
    })

    it('should handle unexpected errors', async () => {
      const unexpectedError = new Error('Network error')
      mockMessages.mockRejectedValue(unexpectedError)

      const options: EnhanceOptions = {
        text: 'test text',
        language: 'en'
      }

      await expect(enhanceText(options)).rejects.toThrow('INTERNAL_ERROR')
    })

    it('should use default values for optional parameters', async () => {
      const mockResponse = {
        content: [{ type: 'text', text: 'Enhanced text' }],
        usage: { input_tokens: 30, output_tokens: 20 }
      }

      mockMessages.mockResolvedValue(mockResponse)

      const options: EnhanceOptions = {
        text: 'test text'
      }

      const result = await enhanceText(options)

      expect(result.language).toBe('en') // Default language
      expect(mockMessages).toHaveBeenCalledWith(
        expect.objectContaining({
          system: [expect.objectContaining({
            text: expect.stringContaining('English text enhancement')
          })]
        })
      )
    })
  })

  describe('mockEnhanceText', () => {
    it('should return mock enhancement with delay', async () => {
      const startTime = Date.now()
      
      const options: EnhanceOptions = {
        text: 'original text',
        language: 'en',
        tone: 'professional'
      }

      const result = await mockEnhanceText(options)
      const endTime = Date.now()

      expect(result).toEqual({
        enhancedText: '[ENHANCED] original text',
        tokensUsed: 100,
        language: 'en'
      })

      expect(endTime - startTime).toBeGreaterThanOrEqual(500) // Should have delay
    })

    it('should use default language when not provided', async () => {
      const options: EnhanceOptions = {
        text: 'test text'
      }

      const result = await mockEnhanceText(options)

      expect(result.language).toBe('en')
    })
  })

  describe('prompt construction', () => {
    it('should build cached system prompt correctly', () => {
      const prompt = buildCachedSystemPrompt('en')

      expect(prompt).toEqual({
        type: 'text',
        text: expect.stringContaining('professional writing assistant'),
        cache_control: { type: 'ephemeral' }
      })
    })

    it('should build user prompt with caching enabled', () => {
      const prompt = buildUserPrompt('test text', 'professional', true)

      expect(prompt).toEqual({
        type: 'text',
        text: expect.stringContaining('Use a professional and polished tone'),
        cache_control: { type: 'ephemeral' }
      })
    })

    it('should build user prompt without caching', () => {
      const prompt = buildUserPrompt('test text', 'casual', false)

      expect(prompt).toEqual({
        type: 'text',
        text: expect.stringContaining('Use a friendly and conversational tone')
      })
      expect(prompt.cache_control).toBeUndefined()
    })
  })

  describe('error handling edge cases', () => {
    it('should handle empty API response', async () => {
      const mockResponse = {
        content: [],
        usage: { input_tokens: 10, output_tokens: 0 }
      }

      mockMessages.mockResolvedValue(mockResponse)

      const options: EnhanceOptions = {
        text: 'test text',
        language: 'en'
      }

      const result = await enhanceText(options)

      expect(result.enhancedText).toBe('')
      expect(result.tokensUsed).toBe(10)
    })

    it('should handle mixed content types in response', async () => {
      const mockResponse = {
        content: [
          { type: 'text', text: 'First part' },
          { type: 'image', source: { type: 'base64', data: 'abc123' } },
          { type: 'text', text: 'Second part' }
        ],
        usage: { input_tokens: 30, output_tokens: 20 }
      }

      mockMessages.mockResolvedValue(mockResponse)

      const options: EnhanceOptions = {
        text: 'test text',
        language: 'en'
      }

      const result = await enhanceText(options)

      expect(result.enhancedText).toBe('First part\nSecond part')
    })
  })
})
