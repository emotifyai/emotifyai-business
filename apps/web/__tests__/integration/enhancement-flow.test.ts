/**
 * Enhancement Flow Integration Tests
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

import { NextRequest } from 'next/server'
import { POST } from '@/app/api/enhance/route'
import { createClient } from '@/lib/supabase/server'
import { canMakeEnhancement } from '@/lib/subscription/validation'
import { mockEnhanceText } from '@/lib/ai/claude'

const mockMockEnhance = mockEnhanceText as jest.MockedFunction<typeof mockEnhanceText>

jest.mock('@/lib/supabase/server')
jest.mock('@/lib/subscription/validation')
jest.mock('@/lib/ai/claude', () => ({
  enhanceText: jest.fn(),
  mockEnhanceText: jest.fn(),
}))

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockCanMakeEnhancement = canMakeEnhancement as jest.MockedFunction<typeof canMakeEnhancement>

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

const hasApiKey =
  !!process.env.ANTHROPIC_API_KEY && process.env.RUN_CLAUDE_INTEGRATION === '1'
const apiIt = hasApiKey ? it : it.skip

describe('Enhancement Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateClient.mockResolvedValue(mockSupabase as never)
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-123', email: 'test@example.com' } },
      error: null,
    })
    mockCanMakeEnhancement.mockResolvedValue({ allowed: true })
  })

  describe('Real Claude Integration', () => {
    apiIt('should enhance English text using real Claude API', async () => {
      const response = await POST(
        createMockRequest({
          text: 'this is a simple text that needs improvement',
          mode: 'enhance',
          outputLanguage: 'en',
          tone: 'marketing',
          platform: 'store',
        })
      )
      const data = await parseResponse(response as Response)

      expect(response).toBeDefined()
      expect((response as Response).status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.enhancedText.length).toBeGreaterThan(10)
      expect(data.data.language).toBe('en')
    }, 30000)
  })

  describe('Mock Mode Integration', () => {
    beforeEach(() => {
      process.env.MOCK_AI_RESPONSES = 'true'
      mockMockEnhance.mockResolvedValue({
        enhancedText: '[ENHANCED] test text for mocking',
        tokensUsed: 100,
        language: 'en',
        routeId: 'en',
      })
    })

    afterEach(() => {
      delete process.env.MOCK_AI_RESPONSES
    })

    it('should use mock responses when configured', async () => {
      const response = await POST(
        createMockRequest({
          text: 'test text for mocking',
          mode: 'enhance',
          outputLanguage: 'en',
        })
      )
      const data = await parseResponse(response as Response)

      expect((response as Response).status).toBe(200)
      expect(data.data.enhancedText).toBe('[ENHANCED] test text for mocking')
      expect(data.data.language).toBe('en')
    })
  })

  describe('Error Scenarios Integration', () => {
    it('should handle unauthenticated requests', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      })

      const response = await POST(
        createMockRequest({ text: 'test text', mode: 'enhance' })
      )
      const data = await parseResponse(response as Response)

      expect((response as Response).status).toBe(401)
      expect(data.error.code).toBe('UNAUTHORIZED')
    })

    it('should reject invalid output language in schema', async () => {
      const response = await POST(
        createMockRequest({
          text: 'Hola mundo',
          mode: 'enhance',
          outputLanguage: 'es',
        })
      )
      const data = await parseResponse(response as Response)

      expect((response as Response).status).toBe(400)
      expect(data.error.code).toBe('INVALID_REQUEST')
    })
  })
})
