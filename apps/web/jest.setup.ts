import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'

// Mock fetch API for test environment
global.fetch = jest.fn(() => Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
})
) as unknown as jest.MockedFunction<typeof fetch>

// Mock Request and Response for Next.js API tests
global.Request = class MockRequest {
  constructor(public url: string, public init?: any) {}
  json() { return Promise.resolve(this.init?.body ? JSON.parse(this.init.body) : {}) }
  headers = new Map()
} as any

global.Response = class MockResponse {
  ok: boolean
  status: number
  headers: Headers

  constructor(public body?: BodyInit | null, public init?: ResponseInit) {
    this.status = init?.status ?? 200
    this.ok = this.status >= 200 && this.status < 300
    this.headers = new Headers(init?.headers as HeadersInit)
  }

  static json(data: unknown, init?: ResponseInit) {
    return new MockResponse(JSON.stringify(data), {
      ...init,
      headers: { 'content-type': 'application/json', ...(init?.headers as Record<string, string>) },
    })
  }

  json() {
    return Promise.resolve(typeof this.body === 'string' ? JSON.parse(this.body) : this.body)
  }

  text() {
    return Promise.resolve(typeof this.body === 'string' ? this.body : JSON.stringify(this.body))
  }
} as typeof Response

global.Headers = class MockHeaders {
  private map = new Map<string, string>()

  constructor(init?: Record<string, string> | [string, string][] | Headers) {
    if (init) {
      if (init instanceof Headers) {
        init.forEach((value, key) => this.map.set(key.toLowerCase(), value))
      } else if (Array.isArray(init)) {
        init.forEach(([key, value]) => this.map.set(key.toLowerCase(), value))
      } else {
        Object.entries(init).forEach(([key, value]) => this.map.set(key.toLowerCase(), value))
      }
    }
  }

  append(name: string, value: string) {
    const key = name.toLowerCase()
    const existing = this.map.get(key)
    this.map.set(key, existing ? `${existing}, ${value}` : value)
  }

  get(name: string) {
    return this.map.get(name.toLowerCase()) ?? null
  }

  set(name: string, value: string) {
    this.map.set(name.toLowerCase(), value)
  }

  has(name: string) {
    return this.map.has(name.toLowerCase())
  }

  delete(name: string) {
    this.map.delete(name.toLowerCase())
  }

  forEach(callback: (value: string, key: string) => void) {
    this.map.forEach((value, key) => callback(value, key))
  }

  getSetCookie() {
    return []
  }

  [Symbol.iterator]() {
    return this.map[Symbol.iterator]()
  }
} as unknown as typeof Headers

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
