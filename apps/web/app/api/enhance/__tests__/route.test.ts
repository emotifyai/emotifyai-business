/**
 * Enhancement API Route Tests
 * Tests the /api/enhance endpoint with authentication, validation, and AI integration
 */

import { POST } from '../route'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { canMakeEnhancement, consumeCredits } from '@/lib/subscription/validation'
import { enhanceText, mockEnhanceText as mockEnhanceTextFn } from '@/lib/ai/claude'
import { detectLanguage, validateOutputQuality, isLanguageSupported } from '@/lib/ai/language-detection'
import { ApiErrorCode } from '@/types/api'

// Mock all dependencies
jest.mock('@/lib/supabase/server')
jest.mock('@/lib/subscription/validation')
jest.mock('@/lib/ai/claude')
jest.mock('@/lib/ai/language-detection')

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockCanMakeEnhancement = canMakeEnhancement as jest.MockedFunction<typeof canMakeEnhancement>
const mockConsumeCredits = consumeCredits as jest.MockedFunction<typeof consumeCredits>
const mockEnhanceText = enhanceText as jest.MockedFunction<typeof enhanceText>
const mockMockEnhanceText = mockEnhanceTextFn as jest.MockedFunction<typeof mockEnhanceTextFn>
const mockDetectLanguage = detectLanguage as jest.MockedFunction<typeof detectLanguage>
const mockValidateOutputQuality = validateOutputQuality as jest.MockedFunction<typeof validateOutputQuality>
const mockIsLanguageSupported = isLanguageSupported as jest.MockedFunction<typeof isLanguageSupported>

// Mock Supabase client
const mockSupabase = {
  auth: {
    getUser: jest.fn()
  },
  from: jest.fn(() => ({
    insert: jest.fn().mockResolvedValue({ error: null })
  }))
}

// Helper to create mock request
function createMockRequest(body: any, headers: Record<string, string> = {}): NextRequest {
  return {
    json: jest.fn().mockResolvedValue(body),
    headers: new Headers(headers)
  } as any
}

// Helper to parse JSON response
async function parseResponse(response: Response) {
  return JSON.parse(await response.text())
}

// Helper to assert response is defined and return it
function assertResponse(response: any): Response {
  expect(response).toBeDefined()
  expect(response).toBeInstanceOf(Response)
  return response as Response
}

describe('/api/enhance POST', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateClient.mockResolvedValue(mockSupabase as any)
    
    // Default mocks
    mockDetectLanguage.mockReturnValue('en')
    mockIsLanguageSupported.mockReturnValue(true)
    mockValidateOutputQuality.mockReturnValue({ isValid: true })
    
    // Reset environment
    delete process.env.MOCK_AI_RESPONSES
  })

  describe('Authentication', () => {
    it('should reject unauthenticated requests', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      })

      const request = createMockRequest({
        text: 'test text',
        mode: 'enhance'
      })

      const rawResponse = await POST(request)
      const response = assertResponse(rawResponse)
      const data = await parseResponse(response)

      expect(response.status).toBe(401)
      expect(data).toEqual({
        success: false,
        error: {
          code: ApiErrorCode.UNAUTHORIZED,
          message: 'Authentication required'
        }
      })
    })

    it('should accept authenticated requests', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      mockCanMakeEnhancement.mockResolvedValue({ allowed: true })
      mockEnhanceText.mockResolvedValue({
        enhancedText: 'Enhanced text',
        tokensUsed: 50,
        language: 'en'
      })

      const request = createMockRequest({
        text: 'test text',
        mode: 'enhance'
      })

      const rawResponse = await POST(request); const response = assertResponse(rawResponse)
      expect(response.status).toBe(200)
    })
  })

  describe('Request Validation', () => {
    beforeEach(() => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
    })

    it('should reject invalid request body', async () => {
      const request = createMockRequest({
        // Missing required fields
        invalidField: 'value'
      })

      const rawResponse = await POST(request); const response = assertResponse(rawResponse)
      const data = await parseResponse(response)

      expect(response.status).toBe(400)
      expect(data).toEqual({
        success: false,
        error: {
          code: ApiErrorCode.INVALID_REQUEST,
          message: 'Invalid request data'
        }
      })
    })

    it('should reject empty text', async () => {
      const request = createMockRequest({
        text: '',
        mode: 'enhance'
      })

      const rawResponse = await POST(request); const response = assertResponse(rawResponse)
      const data = await parseResponse(response)

      expect(response.status).toBe(400)
      expect(data.error.code).toBe(ApiErrorCode.INVALID_REQUEST)
    })

    it('should reject text that is too long', async () => {
      const request = createMockRequest({
        text: 'A'.repeat(10001), // Over 10000 character limit
        mode: 'enhance'
      })

      const rawResponse = await POST(request); const response = assertResponse(rawResponse)
      const data = await parseResponse(response)

      expect(response.status).toBe(400)
      expect(data.error.code).toBe(ApiErrorCode.INVALID_REQUEST)
    })

    it('should accept valid request with all fields', async () => {
      mockCanMakeEnhancement.mockResolvedValue({ allowed: true })
      mockEnhanceText.mockResolvedValue({
        enhancedText: 'Enhanced text',
        tokensUsed: 50,
        language: 'en'
      })

      const request = createMockRequest({
        text: 'test text',
        mode: 'enhance',
        language: 'en',
        tone: 'professional'
      })

      const rawResponse = await POST(request); const response = assertResponse(rawResponse)
      expect(response.status).toBe(200)
    })

    it('should accept valid request with minimal fields', async () => {
      mockCanMakeEnhancement.mockResolvedValue({ allowed: true })
      mockEnhanceText.mockResolvedValue({
        enhancedText: 'Enhanced text',
        tokensUsed: 50,
        language: 'en'
      })

      const request = createMockRequest({
        text: 'test text',
        mode: 'enhance'
      })

      const rawResponse = await POST(request); const response = assertResponse(rawResponse)
      expect(response.status).toBe(200)
    })
  })

  describe('Language Detection and Support', () => {
    beforeEach(() => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      mockCanMakeEnhancement.mockResolvedValue({ allowed: true })
    })

    it('should use provided language when specified', async () => {
      mockEnhanceText.mockResolvedValue({
        enhancedText: 'Enhanced text',
        tokensUsed: 50,
        language: 'fr'
      })

      const request = createMockRequest({
        text: 'Bonjour monde',
        mode: 'enhance',
        language: 'fr'
      })

      await POST(request)

      expect(mockDetectLanguage).not.toHaveBeenCalled()
      expect(mockIsLanguageSupported).toHaveBeenCalledWith('fr')
    })

    it('should detect language when not provided', async () => {
      mockDetectLanguage.mockReturnValue('ar')
      mockEnhanceText.mockResolvedValue({
        enhancedText: 'Enhanced text',
        tokensUsed: 50,
        language: 'ar'
      })

      const request = createMockRequest({
        text: 'مرحبا بكم',
        mode: 'enhance'
      })

      await POST(request)

      expect(mockDetectLanguage).toHaveBeenCalledWith('مرحبا بكم')
      expect(mockIsLanguageSupported).toHaveBeenCalledWith('ar')
    })

    it('should reject unsupported languages', async () => {
      mockIsLanguageSupported.mockReturnValue(false)

      const request = createMockRequest({
        text: 'Hola mundo',
        mode: 'enhance',
        language: 'es'
      })

      const rawResponse = await POST(request); const response = assertResponse(rawResponse)
      const data = await parseResponse(response)

      expect(response.status).toBe(400)
      expect(data).toEqual({
        success: false,
        error: {
          code: ApiErrorCode.UNSUPPORTED_LANGUAGE,
          message: "Language 'es' is not supported"
        }
      })
    })
  })

  describe('Subscription and Usage Validation', () => {
    beforeEach(() => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
    })

    it('should reject requests when usage limit exceeded', async () => {
      mockCanMakeEnhancement.mockResolvedValue({
        allowed: false,
        reason: 'CREDIT_LIMIT_EXCEEDED',
        creditStatus: {
          tier_name: 'basic_monthly',
          credits_limit: 350,
          credits_used: 350,
          credits_remaining: 0,
          credits_reset_date: '2024-02-01T00:00:00Z',
          validity_days: null,
          is_expired: false,
          can_use: false
        }
      })

      const request = createMockRequest({
        text: 'test text',
        mode: 'enhance'
      })

      const rawResponse = await POST(request); const response = assertResponse(rawResponse)
      const data = await parseResponse(response)

      expect(response.status).toBe(403)
      expect(data).toEqual({
        success: false,
        error: {
          code: ApiErrorCode.USAGE_LIMIT_EXCEEDED,
          message: 'Usage limit exceeded'
        }
      })
    })

    it('should reject requests for expired subscriptions', async () => {
      mockCanMakeEnhancement.mockResolvedValue({
        allowed: false,
        reason: 'SUBSCRIPTION_EXPIRED'
      })

      const request = createMockRequest({
        text: 'test text',
        mode: 'enhance'
      })

      const rawResponse = await POST(request); const response = assertResponse(rawResponse)
      const data = await parseResponse(response)

      expect(response.status).toBe(403)
      expect(data.error.code).toBe(ApiErrorCode.USAGE_LIMIT_EXCEEDED)
    })

    it('should allow requests for users with available credits', async () => {
      mockCanMakeEnhancement.mockResolvedValue({ allowed: true })
      mockEnhanceText.mockResolvedValue({
        enhancedText: 'Enhanced text',
        tokensUsed: 50,
        language: 'en'
      })

      const request = createMockRequest({
        text: 'test text',
        mode: 'enhance'
      })

      const rawResponse = await POST(request); const response = assertResponse(rawResponse)
      expect(response.status).toBe(200)
    })
  })

  describe('AI Enhancement', () => {
    beforeEach(() => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      mockCanMakeEnhancement.mockResolvedValue({ allowed: true })
    })

    it('should use real AI when MOCK_AI_RESPONSES is false', async () => {
      process.env.MOCK_AI_RESPONSES = 'false'
      
      mockEnhanceText.mockResolvedValue({
        enhancedText: 'This is professionally enhanced text with improved clarity.',
        tokensUsed: 75,
        language: 'en'
      })

      const request = createMockRequest({
        text: 'this is original text',
        mode: 'enhance',
        tone: 'professional'
      })

      const rawResponse = await POST(request); const response = assertResponse(rawResponse)
      const data = await parseResponse(response)

      expect(mockEnhanceText).toHaveBeenCalledWith({
        text: 'this is original text',
        language: 'en',
        tone: 'professional'
      })
      expect(mockMockEnhanceText).not.toHaveBeenCalled()
      expect(data.success).toBe(true)
      expect(data.data.enhancedText).toBe('This is professionally enhanced text with improved clarity.')
    })

    it('should use mock AI when MOCK_AI_RESPONSES is true', async () => {
      process.env.MOCK_AI_RESPONSES = 'true'
      
      mockMockEnhanceText.mockResolvedValue({
        enhancedText: '[ENHANCED] this is original text',
        tokensUsed: 100,
        language: 'en'
      })

      const request = createMockRequest({
        text: 'this is original text',
        mode: 'enhance'
      })

      const rawResponse = await POST(request); const response = assertResponse(rawResponse)
      const data = await parseResponse(response)

      expect(mockMockEnhanceText).toHaveBeenCalledWith({
        text: 'this is original text',
        language: 'en',
        tone: undefined
      })
      expect(mockEnhanceText).not.toHaveBeenCalled()
      expect(data.success).toBe(true)
      expect(data.data.enhancedText).toBe('[ENHANCED] this is original text')
    })

    it('should pass correct options to AI service', async () => {
      mockEnhanceText.mockResolvedValue({
        enhancedText: 'Enhanced text',
        tokensUsed: 50,
        language: 'fr'
      })

      const request = createMockRequest({
        text: 'Texte français original',
        mode: 'enhance',
        language: 'fr',
        tone: 'casual'
      })

      await POST(request)

      expect(mockEnhanceText).toHaveBeenCalledWith({
        text: 'Texte français original',
        language: 'fr',
        tone: 'casual'
      })
    })
  })

  describe('Quality Validation', () => {
    beforeEach(() => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      mockCanMakeEnhancement.mockResolvedValue({ allowed: true })
    })

    it('should reject low-quality AI output', async () => {
      mockEnhanceText.mockResolvedValue({
        enhancedText: 'Low quality output',
        tokensUsed: 50,
        language: 'en'
      })

      mockValidateOutputQuality.mockReturnValue({
        isValid: false,
        reason: 'Output quality is too low'
      })

      const request = createMockRequest({
        text: 'test text',
        mode: 'enhance'
      })

      const rawResponse = await POST(request); const response = assertResponse(rawResponse)
      const data = await parseResponse(response)

      expect(response.status).toBe(500)
      expect(data).toEqual({
        success: false,
        error: {
          code: ApiErrorCode.QUALITY_CHECK_FAILED,
          message: 'Quality check failed'
        }
      })
    })

    it('should accept high-quality AI output', async () => {
      mockEnhanceText.mockResolvedValue({
        enhancedText: 'High quality enhanced output',
        tokensUsed: 50,
        language: 'en'
      })

      mockValidateOutputQuality.mockReturnValue({
        isValid: true
      })

      const request = createMockRequest({
        text: 'test text',
        mode: 'enhance'
      })

      const rawResponse = await POST(request); const response = assertResponse(rawResponse)
      const data = await parseResponse(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('Usage Logging', () => {
    beforeEach(() => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      mockCanMakeEnhancement.mockResolvedValue({ allowed: true })
      mockEnhanceText.mockResolvedValue({
        enhancedText: 'Enhanced text',
        tokensUsed: 50,
        language: 'en'
      })
    })

    it('should log successful enhancement usage', async () => {
      const mockInsert = jest.fn().mockResolvedValue({ error: null })
      mockSupabase.from.mockReturnValue({
        insert: mockInsert
      })

      const request = createMockRequest({
        text: 'original text',
        mode: 'enhance'
      })

      await POST(request)

      expect(mockSupabase.from).toHaveBeenCalledWith('usage_logs')
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'user-123',
        input_text: 'original text',
        output_text: 'Enhanced text',
        language: 'en',
        tokens_used: 50,
        success: true
      })
    })

    it('should continue even if logging fails', async () => {
      const mockInsert = jest.fn().mockResolvedValue({ 
        error: new Error('Database error') 
      })
      mockSupabase.from.mockReturnValue({
        insert: mockInsert
      })

      const request = createMockRequest({
        text: 'test text',
        mode: 'enhance'
      })

      const rawResponse = await POST(request); const response = assertResponse(rawResponse)
      const data = await parseResponse(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      mockCanMakeEnhancement.mockResolvedValue({ allowed: true })
    })

    it('should handle AI service errors', async () => {
      mockEnhanceText.mockRejectedValue(new Error('AI service unavailable'))

      const request = createMockRequest({
        text: 'test text',
        mode: 'enhance'
      })

      const rawResponse = await POST(request); const response = assertResponse(rawResponse)
      const data = await parseResponse(response)

      expect(response.status).toBe(500)
      expect(data).toEqual({
        success: false,
        error: {
          code: ApiErrorCode.INTERNAL_ERROR,
          message: 'Internal error'
        }
      })
    })

    it('should handle malformed JSON requests', async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        headers: new Headers()
      } as any

      const rawResponse = await POST(request); const response = assertResponse(rawResponse)
      const data = await parseResponse(response)

      expect(response.status).toBe(500)
      expect(data.error.code).toBe(ApiErrorCode.INTERNAL_ERROR)
    })

    it('should handle database connection errors', async () => {
      mockCreateClient.mockRejectedValue(new Error('Database connection failed'))

      const request = createMockRequest({
        text: 'test text',
        mode: 'enhance'
      })

      const rawResponse = await POST(request); const response = assertResponse(rawResponse)
      const data = await parseResponse(response)

      expect(response.status).toBe(500)
      expect(data.error.code).toBe(ApiErrorCode.INTERNAL_ERROR)
    })
  })

  describe('Response Format', () => {
    beforeEach(() => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      mockCanMakeEnhancement.mockResolvedValue({ allowed: true })
    })

    it('should return correct success response format', async () => {
      mockEnhanceText.mockResolvedValue({
        enhancedText: 'Enhanced text output',
        tokensUsed: 75,
        language: 'en'
      })

      const request = createMockRequest({
        text: 'test text',
        mode: 'enhance'
      })

      const rawResponse = await POST(request); const response = assertResponse(rawResponse)
      const data = await parseResponse(response)

      expect(data).toEqual({
        success: true,
        data: {
          enhancedText: 'Enhanced text output',
          tokensUsed: 75,
          language: 'en'
        }
      })
    })

    it('should return correct error response format', async () => {
      mockCanMakeEnhancement.mockResolvedValue({
        allowed: false,
        reason: 'USAGE_LIMIT_EXCEEDED'
      })

      const request = createMockRequest({
        text: 'test text',
        mode: 'enhance'
      })

      const rawResponse = await POST(request); const response = assertResponse(rawResponse)
      const data = await parseResponse(response)

      expect(data).toEqual({
        success: false,
        error: {
          code: ApiErrorCode.USAGE_LIMIT_EXCEEDED,
          message: 'Usage limit exceeded'
        }
      })
    })
  })
})
