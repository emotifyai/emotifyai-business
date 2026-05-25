/**
 * Enhancement API Route Tests
 */

jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {},
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) =>
      new Response(JSON.stringify(body), {
        status: init?.status ?? 200,
        headers: { 'content-type': 'application/json' },
      }),
  },
}))

import { POST } from '../route'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { canMakeEnhancement } from '@/lib/subscription/validation'
import { enhanceText, mockEnhanceText as mockEnhanceTextFn } from '@/lib/ai/claude'
import { validateOutputQuality, isLanguageSupported } from '@/lib/ai/language-detection'
import { ApiErrorCode } from '@/types/api'

jest.mock('@/lib/supabase/server')
jest.mock('@/lib/subscription/validation')
jest.mock('@/lib/ai/claude')
jest.mock('@/lib/ai/language-detection')

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockCanMakeEnhancement = canMakeEnhancement as jest.MockedFunction<typeof canMakeEnhancement>
const mockEnhanceText = enhanceText as jest.MockedFunction<typeof enhanceText>
const mockMockEnhanceText = mockEnhanceTextFn as jest.MockedFunction<typeof mockEnhanceTextFn>
const mockValidateOutputQuality = validateOutputQuality as jest.MockedFunction<typeof validateOutputQuality>
const mockIsLanguageSupported = isLanguageSupported as jest.MockedFunction<typeof isLanguageSupported>

const mockSupabase = {
  auth: { getUser: jest.fn() },
  from: jest.fn(() => ({
    insert: jest.fn().mockResolvedValue({ error: null }),
  })),
  rpc: jest.fn(() => ({
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
  })),
}

function createMockRequest(body: unknown): NextRequest {
  return {
    json: jest.fn().mockResolvedValue(body),
    headers: new Headers(),
  } as unknown as NextRequest
}

async function parseResponse(response: Response) {
  return JSON.parse(await response.text())
}

function assertResponse(response: unknown): Response {
  expect(response).toBeDefined()
  expect(response).toBeInstanceOf(Response)
  return response as Response
}

const validBody = {
  text: 'test text',
  mode: 'enhance',
  outputLanguage: 'en',
  tone: 'marketing',
  platform: 'store',
}

describe('/api/enhance POST', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateClient.mockResolvedValue(mockSupabase as never)
    mockIsLanguageSupported.mockReturnValue(true)
    mockValidateOutputQuality.mockReturnValue({ isValid: true })
    delete process.env.MOCK_AI_RESPONSES
  })

  describe('Authentication', () => {
    it('should reject unauthenticated requests', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      })

      const response = assertResponse(await POST(createMockRequest(validBody)))
      const data = await parseResponse(response)

      expect(response.status).toBe(401)
      expect(data.error.code).toBe(ApiErrorCode.UNAUTHORIZED)
    })

    it('should accept authenticated requests', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      })
      mockCanMakeEnhancement.mockResolvedValue({ allowed: true })
      mockEnhanceText.mockResolvedValue({
        enhancedText: 'Enhanced text',
        tokensUsed: 50,
        language: 'en',
        routeId: 'en',
      })

      const response = assertResponse(await POST(createMockRequest(validBody)))
      expect(response.status).toBe(200)
    })
  })

  describe('Request Validation', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })
    })

    it('should reject invalid request body', async () => {
      const response = assertResponse(await POST(createMockRequest({ invalidField: true })))
      const data = await parseResponse(response)
      expect(response.status).toBe(400)
      expect(data.error.code).toBe(ApiErrorCode.INVALID_REQUEST)
    })

    it('should reject empty text', async () => {
      const response = assertResponse(
        await POST(createMockRequest({ ...validBody, text: '' }))
      )
      expect((await parseResponse(response)).error.code).toBe(ApiErrorCode.INVALID_REQUEST)
    })

    it('should reject text that is too long', async () => {
      const response = assertResponse(
        await POST(createMockRequest({ ...validBody, text: 'A'.repeat(10001) }))
      )
      expect((await parseResponse(response)).error.code).toBe(ApiErrorCode.INVALID_REQUEST)
    })
  })

  describe('Output language support', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })
      mockCanMakeEnhancement.mockResolvedValue({ allowed: true })
    })

    it('should reject invalid output language in schema', async () => {
      const response = assertResponse(
        await POST(createMockRequest({ ...validBody, outputLanguage: 'es' }))
      )
      const data = await parseResponse(response)

      expect(response.status).toBe(400)
      expect(data.error.code).toBe(ApiErrorCode.INVALID_REQUEST)
    })
  })

  describe('Subscription validation', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })
    })

    it('should reject when usage limit exceeded', async () => {
      mockCanMakeEnhancement.mockResolvedValue({
        allowed: false,
        reason: 'CREDIT_LIMIT_EXCEEDED',
      })

      const response = assertResponse(await POST(createMockRequest(validBody)))
      expect(response.status).toBe(403)
    })
  })

  describe('AI Enhancement', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })
      mockCanMakeEnhancement.mockResolvedValue({ allowed: true })
    })

    it('should use real AI when MOCK_AI_RESPONSES is false', async () => {
      process.env.MOCK_AI_RESPONSES = 'false'
      mockEnhanceText.mockResolvedValue({
        enhancedText: 'Enhanced marketing copy.',
        tokensUsed: 75,
        language: 'en',
        routeId: 'en',
      })

      await POST(
        createMockRequest({
          ...validBody,
          text: 'this is original text',
          tone: 'marketing',
        })
      )

      expect(mockEnhanceText).toHaveBeenCalledWith({
        text: 'this is original text',
        outputLanguage: 'en',
        tone: 'marketing',
        platform: 'store',
        strength: 5,
      })
      expect(mockMockEnhanceText).not.toHaveBeenCalled()
    })

    it('should use mock AI when MOCK_AI_RESPONSES is true', async () => {
      process.env.MOCK_AI_RESPONSES = 'true'
      mockMockEnhanceText.mockResolvedValue({
        enhancedText: '[ENHANCED] this is original text',
        tokensUsed: 100,
        language: 'en',
        routeId: 'ar-gulf',
      })

      const response = assertResponse(
        await POST(createMockRequest({ ...validBody, text: 'this is original text' }))
      )
      const data = await parseResponse(response)

      expect(mockMockEnhanceText).toHaveBeenCalled()
      expect(data.data.enhancedText).toBe('[ENHANCED] this is original text')
    })
  })

  describe('Quality Validation', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })
      mockCanMakeEnhancement.mockResolvedValue({ allowed: true })
      mockEnhanceText.mockResolvedValue({
        enhancedText: 'Low quality output',
        tokensUsed: 50,
        language: 'en',
      })
    })

    it('should reject low-quality AI output', async () => {
      mockValidateOutputQuality.mockReturnValue({
        isValid: false,
        reason: 'Output quality is too low',
      })

      const response = assertResponse(await POST(createMockRequest(validBody)))
      expect((await parseResponse(response)).error.code).toBe(ApiErrorCode.QUALITY_CHECK_FAILED)
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })
      mockCanMakeEnhancement.mockResolvedValue({ allowed: true })
    })

    it('should handle AI service errors', async () => {
      mockEnhanceText.mockRejectedValue(new Error('AI service unavailable'))
      const response = assertResponse(await POST(createMockRequest(validBody)))
      expect((await parseResponse(response)).error.code).toBe(ApiErrorCode.INTERNAL_ERROR)
    })
  })

  describe('Response Format', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })
      mockCanMakeEnhancement.mockResolvedValue({ allowed: true })
      mockEnhanceText.mockResolvedValue({
        enhancedText: 'Enhanced text output',
        tokensUsed: 75,
        language: 'en',
        routeId: 'en',
      })
    })

    it('should return success response with route metadata', async () => {
      const response = assertResponse(await POST(createMockRequest(validBody)))
      const data = await parseResponse(response)

      expect(data).toEqual({
        success: true,
        data: {
          enhancedText: 'Enhanced text output',
          tokensUsed: 75,
          language: 'en',
          routeId: expect.any(String),
          detectionSummary: expect.any(String),
        },
      })
    })
  })
})
