import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'

// Add Node.js shims for Anthropic SDK
import '@anthropic-ai/sdk/shims/node'

// Mock fetch API for test environment
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
) as jest.Mock

// Mock Request and Response for Next.js API tests
global.Request = class MockRequest {
  constructor(public url: string, public init?: any) {}
  json() { return Promise.resolve(this.init?.body ? JSON.parse(this.init.body) : {}) }
  headers = new Map()
} as any

global.Response = class MockResponse {
  constructor(public body?: any, public init?: any) {}
  static json(data: any, init?: any) {
    return new MockResponse(JSON.stringify(data), { ...init, headers: { 'content-type': 'application/json' } })
  }
  json() { return Promise.resolve(typeof this.body === 'string' ? JSON.parse(this.body) : this.body) }
  text() { return Promise.resolve(typeof this.body === 'string' ? this.body : JSON.stringify(this.body)) }
  ok = true
  status = 200
} as any

global.Headers = class MockHeaders extends Map {
  constructor(init?: any) {
    super()
    if (init) {
      Object.entries(init).forEach(([key, value]) => this.set(key, value as string))
    }
  }
} as any

// Cleanup after each test
afterEach(() => {
    cleanup()
})

// Mock environment variables for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

// AI/Claude test environment variables
process.env.ANTHROPIC_MODEL = 'claude-3-5-haiku-20241022'
process.env.ANTHROPIC_MAX_TOKENS = '1024'

// Mock console.error to reduce noise in tests unless explicitly testing errors
const originalError = console.error
beforeAll(() => {
    console.error = (...args: any[]) => {
        if (
            typeof args[0] === 'string' && 
            (args[0].includes('Warning:') || args[0].includes('Error fetching'))
        ) {
            return
        }
        originalError.call(console, ...args)
    }
})

afterAll(() => {
    console.error = originalError
})

// Global test timeout for AI integration tests
jest.setTimeout(30000)
