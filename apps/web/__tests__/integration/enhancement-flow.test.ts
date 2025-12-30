/**
 * Enhancement Flow Integration Tests
 * Tests the complete enhancement flow from API request to Claude response
 */

import { NextRequest } from 'next/server'
import { POST } from '@/app/api/enhance/route'
import { createClient } from '@/lib/supabase/server'
import { enhanceText } from '@/lib/ai/claude'

// Mock Supabase but allow real Claude integration
jest.mock('@/lib/supabase/server')

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

// Mock Supabase client with realistic responses
const mockSupabase = {
  auth: {
    getUser: jest.fn()
  },
  from: jest.fn(() => ({
    insert: jest.fn().mockResolvedValue({ error: null })
  })),
  rpc: jest.fn()
}

// Helper to create mock request
function createMockRequest(body: any): NextRequest {
  return {
    json: jest.fn().mockResolvedValue(body),
    headers: new Headers()
  } as any
}

// Helper to parse JSON response
async function parseResponse(response: Response) {
  return JSON.parse(await response.text())
}

describe('Enhancement Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateClient.mockResolvedValue(mockSupabase as any)
    
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { 
        user: { 
          id: 'test-user-123', 
          email: 'test@example.com' 
        } 
      },
      error: null
    })
    
    // Mock subscription validation - user has credits
    mockSupabase.rpc
      .mockReturnValueOnce({
        single: jest.fn().mockResolvedValue({ data: true, error: null })
      })
      .mockReturnValueOnce({
        single: jest.fn().mockResolvedValue({
          data: {
            tier_name: 'basic_monthly',
            credits_limit: 350,
            credits_used: 100,
            credits_remaining: 250,
            credits_reset_date: '2024-02-01T00:00:00Z',
            validity_days: null,
            is_expired: false,
            can_use: true
          },
          error: null
        })
      })
  })

  describe('Real Claude Integration', () => {
    // Skip these tests if no API key is provided
    const hasApiKey = !!process.env.ANTHROPIC_API_KEY
    
    const skipIfNoApiKey = hasApiKey ? it : it.skip

    skipIfNoApiKey('should enhance English text using real Claude API', async () => {
      const request = createMockRequest({
        text: 'this is a simple text that needs improvement',
        mode: 'enhance',
        language: 'en',
        tone: 'professional'
      })

      const response = await POST(request)
      const data = await parseResponse(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()
      expect(data.data.enhancedText).toBeDefined()
      expect(data.data.enhancedText).not.toBe('this is a simple text that needs improvement')
      expect(data.data.tokensUsed).toBeGreaterThan(0)
      expect(data.data.language).toBe('en')
      
      // Enhanced text should be different and improved
      expect(data.data.enhancedText.length).toBeGreaterThan(20)
      expect(data.data.enhancedText).toMatch(/[A-Z]/) // Should start with capital
    }, 30000) // 30 second timeout for API call

    skipIfNoApiKey('should enhance Arabic text using real Claude API', async () => {
      const request = createMockRequest({
        text: 'هذا نص بسيط يحتاج إلى تحسين',
        mode: 'enhance',
        language: 'ar',
        tone: 'formal'
      })

      const response = await POST(request)
      const data = await parseResponse(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.enhancedText).toBeDefined()
      expect(data.data.enhancedText).not.toBe('هذا نص بسيط يحتاج إلى تحسين')
      expect(data.data.language).toBe('ar')
      
      // Should contain Arabic characters
      expect(data.data.enhancedText).toMatch(/[\u0600-\u06FF]/)
    }, 30000)

    skipIfNoApiKey('should enhance French text using real Claude API', async () => {
      const request = createMockRequest({
        text: 'ceci est un texte simple qui a besoin d\'amélioration',
        mode: 'enhance',
        language: 'fr',
        tone: 'casual'
      })

      const response = await POST(request)
      const data = await parseResponse(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.enhancedText).toBeDefined()
      expect(data.data.enhancedText).not.toBe('ceci est un texte simple qui a besoin d\'amélioration')
      expect(data.data.language).toBe('fr')
      
      // Should contain French characteristics
      expect(data.data.enhancedText.length).toBeGreaterThan(20)
    }, 30000)

    skipIfNoApiKey('should handle different tones correctly', async () => {
      const baseText = 'i need help with my project'
      const tones: Array<'professional' | 'casual' | 'formal'> = ['professional', 'casual', 'formal']
      
      const results = []
      
      for (const tone of tones) {
        // Reset mocks for each request
        mockSupabase.rpc
          .mockReturnValueOnce({
            single: jest.fn().mockResolvedValue({ data: true, error: null })
          })
          .mockReturnValueOnce({
            single: jest.fn().mockResolvedValue({
              data: {
                tier_name: 'basic_monthly',
                credits_limit: 350,
                credits_used: 100,
                credits_remaining: 250,
                credits_reset_date: '2024-02-01T00:00:00Z',
                validity_days: null,
                is_expired: false,
                can_use: true
              },
              error: null
            })
          })
        
        const request = createMockRequest({
          text: baseText,
          mode: 'enhance',
          language: 'en',
          tone
        })

        const response = await POST(request)
        const data = await parseResponse(response)
        
        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        
        results.push({
          tone,
          enhancedText: data.data.enhancedText
        })
      }
      
      // All results should be different
      const texts = results.map(r => r.enhancedText)
      expect(new Set(texts).size).toBe(3) // All unique
      
      // Each should be enhanced from original
      texts.forEach(text => {
        expect(text).not.toBe(baseText)
        expect(text.length).toBeGreaterThan(baseText.length)
      })
    }, 60000) // Longer timeout for multiple API calls
  })

  describe('Mock Mode Integration', () => {
    beforeEach(() => {
      process.env.MOCK_AI_RESPONSES = 'true'
    })

    afterEach(() => {
      delete process.env.MOCK_AI_RESPONSES
    })

    it('should use mock responses when configured', async () => {
      const request = createMockRequest({
        text: 'test text for mocking',
        mode: 'enhance',
        language: 'en'
      })

      const response = await POST(request)
      const data = await parseResponse(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.enhancedText).toBe('[ENHANCED] test text for mocking')
      expect(data.data.tokensUsed).toBe(100)
      expect(data.data.language).toBe('en')
    })

    it('should simulate realistic delay in mock mode', async () => {
      const startTime = Date.now()
      
      const request = createMockRequest({
        text: 'test text',
        mode: 'enhance'
      })

      await POST(request)
      
      const endTime = Date.now()
      expect(endTime - startTime).toBeGreaterThanOrEqual(500)
    })
  })

  describe('Error Scenarios Integration', () => {
    it('should handle subscription limit exceeded', async () => {
      // Mock user with no credits
      mockSupabase.rpc
        .mockReturnValueOnce({
          single: jest.fn().mockResolvedValue({ data: false, error: null })
        })
        .mockReturnValueOnce({
          single: jest.fn().mockResolvedValue({
            data: {
              tier_name: 'basic_monthly',
              credits_limit: 350,
              credits_used: 350,
              credits_remaining: 0,
              credits_reset_date: '2024-02-01T00:00:00Z',
              validity_days: null,
              is_expired: false,
              can_use: false
            },
            error: null
          })
        })

      const request = createMockRequest({
        text: 'test text',
        mode: 'enhance'
      })

      const response = await POST(request)
      const data = await parseResponse(response)

      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('USAGE_LIMIT_EXCEEDED')
    })

    it('should handle expired subscription', async () => {
      // Mock expired subscription
      mockSupabase.rpc
        .mockReturnValueOnce({
          single: jest.fn().mockResolvedValue({ data: false, error: null })
        })
        .mockReturnValueOnce({
          single: jest.fn().mockResolvedValue({
            data: {
              tier_name: 'free',
              credits_limit: 50,
              credits_used: 25,
              credits_remaining: 25,
              credits_reset_date: null,
              validity_days: 10,
              is_expired: true,
              can_use: false
            },
            error: null
          })
        })

      const request = createMockRequest({
        text: 'test text',
        mode: 'enhance'
      })

      const response = await POST(request)
      const data = await parseResponse(response)

      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('USAGE_LIMIT_EXCEEDED')
    })

    it('should handle unauthenticated requests', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      })

      const request = createMockRequest({
        text: 'test text',
        mode: 'enhance'
      })

      const response = await POST(request)
      const data = await parseResponse(response)

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('UNAUTHORIZED')
    })
  })



  describe('Language Detection Integration', () => {
    it('should auto-detect language when not provided', async () => {
      process.env.MOCK_AI_RESPONSES = 'true'
      
      const request = createMockRequest({
        text: 'مرحبا بكم في تطبيقنا الجديد',
        mode: 'enhance'
        // No language specified
      })

      const response = await POST(request)
      const data = await parseResponse(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      // Should detect Arabic and return it
      expect(data.data.language).toBe('ar')
      
      delete process.env.MOCK_AI_RESPONSES
    })

    it('should reject unsupported languages', async () => {
      const request = createMockRequest({
        text: 'Hola mundo, esto es español',
        mode: 'enhance',
        language: 'es' // Unsupported language
      })

      const response = await POST(request)
      const data = await parseResponse(response)

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('UNSUPPORTED_LANGUAGE')
      expect(data.error.message).toContain('es')
    })
  })

  describe('Performance and Reliability', () => {
    const skipIfNoApiKey = !!process.env.ANTHROPIC_API_KEY ? it : it.skip

    skipIfNoApiKey('should handle concurrent requests', async () => {
      const requests = Array.from({ length: 3 }, (_, i) => {
        // Reset mocks for each request
        mockSupabase.rpc
          .mockReturnValueOnce({
            single: jest.fn().mockResolvedValue({ data: true, error: null })
          })
          .mockReturnValueOnce({
            single: jest.fn().mockResolvedValue({
              data: {
                tier_name: 'basic_monthly',
                credits_limit: 350,
                credits_used: 100,
                credits_remaining: 250,
                credits_reset_date: '2024-02-01T00:00:00Z',
                validity_days: null,
                is_expired: false,
                can_use: true
              },
              error: null
            })
          })
        
        return createMockRequest({
          text: `test text ${i + 1} for concurrent processing`,
          mode: 'enhance',
          language: 'en'
        })
      })

      const startTime = Date.now()
      const responses = await Promise.all(
        requests.map(request => POST(request))
      )
      const endTime = Date.now()

      // All should succeed
      responses.forEach(async (response, i) => {
        expect(response.status).toBe(200)
        const data = await parseResponse(response)
        expect(data.success).toBe(true)
        expect(data.data.enhancedText).toContain(`test text ${i + 1}`)
      })

      // Should complete in reasonable time (concurrent, not sequential)
      expect(endTime - startTime).toBeLessThan(45000) // Less than 45 seconds for 3 requests
    }, 60000)

    it('should handle large text inputs efficiently', async () => {
      process.env.MOCK_AI_RESPONSES = 'true'
      
      const largeText = 'This is a large text input. '.repeat(100) // ~2800 characters
      
      const request = createMockRequest({
        text: largeText,
        mode: 'enhance',
        language: 'en'
      })

      const startTime = Date.now()
      const response = await POST(request)
      const endTime = Date.now()
      
      expect(response.status).toBe(200)
      expect(endTime - startTime).toBeLessThan(2000) // Should be fast in mock mode
      
      delete process.env.MOCK_AI_RESPONSES
    })
  })
})