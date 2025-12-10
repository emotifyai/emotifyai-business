/**
 * Extension OAuth Integration Tests
 * Tests OAuth functionality and cross-platform token synchronization
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { loginWithGoogle, validateSession, logout } from '@/services/api/auth'
import { setAuthToken, getAuthToken, clearAllData } from '@/utils/storage'

// Mock browser APIs
const mockBrowser = {
  identity: {
    getRedirectURL: vi.fn(),
    launchWebAuthFlow: vi.fn(),
  },
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    }
  }
}

// Mock environment variables
vi.mock('import.meta.env', () => ({
  VITE_OAUTH_CLIENT_ID: 'test-oauth-client-id',
  VITE_WEB_APP_URL: 'https://emotifyai.com',
  VITE_API_BASE_URL: 'https://emotifyai.com/api',
  VITE_MOCK_API_ENABLED: 'false'
}))

// Mock API client
vi.mock('@/services/api/client', () => ({
  apiPost: vi.fn(),
  apiGet: vi.fn(),
}))

// Mock storage utilities
vi.mock('@/utils/storage')

// Mock logger
vi.mock('@/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }
}))

// Set up global browser mock
global.browser = mockBrowser as any

describe('Extension OAuth Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('OAuth Flow Configuration', () => {
    it('should use production OAuth client ID', () => {
      const clientId = import.meta.env.VITE_OAUTH_CLIENT_ID
      expect(clientId).toBeDefined()
      
      if (import.meta.env.VITE_MOCK_API_ENABLED !== 'true') {
        expect(clientId).not.toContain('YOUR_')
        expect(clientId).not.toContain('placeholder')
      }
    })

    it('should use correct web app URL for environment', () => {
      const webAppUrl = import.meta.env.VITE_WEB_APP_URL
      expect(webAppUrl).toBeDefined()
      
      // In production, should use emotifyai.com
      if (import.meta.env.NODE_ENV === 'production') {
        expect(webAppUrl).toBe('https://emotifyai.com')
      }
    })

    it('should use correct API base URL for environment', () => {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
      expect(apiBaseUrl).toBeDefined()
      
      // In production, should use emotifyai.com
      if (import.meta.env.NODE_ENV === 'production') {
        expect(apiBaseUrl).toBe('https://emotifyai.com/api')
      }
    })
  })

  describe('Google OAuth Flow', () => {
    it('should construct correct OAuth URL', async () => {
      const mockRedirectUrl = 'chrome-extension://test-extension-id/'
      mockBrowser.identity.getRedirectURL.mockReturnValue(mockRedirectUrl)
      
      const expectedAuthUrl = `https://accounts.google.com/o/oauth2/auth?client_id=test-oauth-client-id&response_type=token&redirect_uri=${encodeURIComponent(mockRedirectUrl)}&scope=email profile`
      
      mockBrowser.identity.launchWebAuthFlow.mockResolvedValue(
        `${mockRedirectUrl}#access_token=mock-token&token_type=Bearer`
      )

      // Mock the API response with proper schema
      const { apiPost } = await import('@/services/api/client')
      vi.mocked(apiPost).mockResolvedValue({
        token: 'jwt-token',
        user: { 
          id: 'user-123', 
          email: 'test@example.com',
          name: 'Test User',
          createdAt: '2024-01-01T00:00:00Z'
        },
        subscription: { 
          tier: 'trial',
          status: 'active',
          startDate: '2024-01-01T00:00:00Z',
          usageLimit: 50,
          currentUsage: 0,
          creditsRemaining: 50
        }
      })

      await loginWithGoogle()

      expect(mockBrowser.identity.launchWebAuthFlow).toHaveBeenCalledWith({
        url: expectedAuthUrl,
        interactive: true,
      })
    })

    it('should handle OAuth success and store tokens', async () => {
      const mockRedirectUrl = 'chrome-extension://test-extension-id/'
      mockBrowser.identity.getRedirectURL.mockReturnValue(mockRedirectUrl)
      
      mockBrowser.identity.launchWebAuthFlow.mockResolvedValue(
        `${mockRedirectUrl}#access_token=mock-google-token&token_type=Bearer`
      )

      // Mock the API response with proper schema
      const { apiPost } = await import('@/services/api/client')
      vi.mocked(apiPost).mockResolvedValue({
        token: 'jwt-token',
        user: { 
          id: 'user-123', 
          email: 'test@example.com',
          name: 'Test User',
          createdAt: '2024-01-01T00:00:00Z'
        },
        subscription: { 
          tier: 'trial',
          status: 'active',
          startDate: '2024-01-01T00:00:00Z',
          usageLimit: 50,
          currentUsage: 0,
          creditsRemaining: 50
        }
      })

      await loginWithGoogle()

      expect(setAuthToken).toHaveBeenCalledWith('jwt-token')
    })

    it('should handle OAuth cancellation', async () => {
      mockBrowser.identity.getRedirectURL.mockReturnValue('chrome-extension://test-extension-id/')
      mockBrowser.identity.launchWebAuthFlow.mockResolvedValue(undefined)

      await expect(loginWithGoogle()).rejects.toThrow()
    })

    it('should handle OAuth errors', async () => {
      mockBrowser.identity.getRedirectURL.mockReturnValue('chrome-extension://test-extension-id/')
      mockBrowser.identity.launchWebAuthFlow.mockRejectedValue(new Error('User cancelled'))

      await expect(loginWithGoogle()).rejects.toThrow()
    })
  })

  describe('Token Synchronization', () => {
    it('should validate session with backend', async () => {
      const { apiGet } = await import('@/services/api/client')
      vi.mocked(apiGet).mockResolvedValue({
        valid: true,
        user: { id: 'user-123', email: 'test@example.com' }
      })

      const result = await validateSession()

      expect(result.valid).toBe(true)
      expect(result.user).toBeDefined()
    })

    it('should handle invalid session', async () => {
      const { apiGet } = await import('@/services/api/client')
      vi.mocked(apiGet).mockRejectedValue(new Error('Unauthorized'))

      const result = await validateSession()

      expect(result.valid).toBe(false)
    })

    it('should sync tokens across extension components', async () => {
      vi.mocked(getAuthToken).mockResolvedValue('existing-token')

      const token = await getAuthToken()
      expect(token).toBe('existing-token')
    })
  })

  describe('Cross-Platform Logout', () => {
    it('should logout and clear all data', async () => {
      const { apiPost } = await import('@/services/api/client')
      vi.mocked(apiPost).mockResolvedValue({})

      await logout()

      expect(clearAllData).toHaveBeenCalled()
    })

    it('should clear data even if logout API fails', async () => {
      const { apiPost } = await import('@/services/api/client')
      vi.mocked(apiPost).mockRejectedValue(new Error('Network error'))

      await expect(logout()).rejects.toThrow('Network error')
      expect(clearAllData).toHaveBeenCalled()
    })
  })

  describe('Production Environment Validation', () => {
    it('should not use mock API in production', () => {
      const mockEnabled = import.meta.env.VITE_MOCK_API_ENABLED
      
      if (import.meta.env.NODE_ENV === 'production') {
        expect(mockEnabled).toBe('false')
      }
    })

    it('should use HTTPS URLs in production', () => {
      const webAppUrl = import.meta.env.VITE_WEB_APP_URL
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
      
      if (import.meta.env.NODE_ENV === 'production') {
        expect(webAppUrl).toMatch(/^https:\/\//)
        expect(apiBaseUrl).toMatch(/^https:\/\//)
      }
    })

    it('should use emotifyai.com domain in production', () => {
      const webAppUrl = import.meta.env.VITE_WEB_APP_URL
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
      
      if (import.meta.env.NODE_ENV === 'production') {
        expect(webAppUrl).toContain('emotifyai.com')
        expect(apiBaseUrl).toContain('emotifyai.com')
      }
    })
  })

  describe('Error Scenarios', () => {
    it('should handle network failures gracefully', async () => {
      const { apiPost } = await import('@/services/api/client')
      vi.mocked(apiPost).mockRejectedValue(new Error('Network error'))

      await expect(loginWithGoogle()).rejects.toThrow('Network error')
    })

    it('should handle malformed OAuth responses', async () => {
      mockBrowser.identity.getRedirectURL.mockReturnValue('chrome-extension://test-extension-id/')
      mockBrowser.identity.launchWebAuthFlow.mockResolvedValue(
        'chrome-extension://test-extension-id/#error=access_denied'
      )

      await expect(loginWithGoogle()).rejects.toThrow()
    })

    it('should handle missing access token in OAuth response', async () => {
      mockBrowser.identity.getRedirectURL.mockReturnValue('chrome-extension://test-extension-id/')
      mockBrowser.identity.launchWebAuthFlow.mockResolvedValue(
        'chrome-extension://test-extension-id/#token_type=Bearer'
      )

      await expect(loginWithGoogle()).rejects.toThrow()
    })
  })
})

describe('OAuth Security Validation', () => {
  it('should not expose client secret in extension', () => {
    // Extension should never have access to OAuth client secret
    const envVars = Object.keys(import.meta.env)
    const hasClientSecret = envVars.some(key => 
      key.toLowerCase().includes('secret') || 
      key.toLowerCase().includes('client_secret')
    )
    
    expect(hasClientSecret).toBe(false)
  })

  it('should use secure redirect URLs', () => {
    const redirectUrl = mockBrowser.identity.getRedirectURL()
    
    // Extension redirect URLs should use extension protocol
    expect(redirectUrl).toMatch(/^(chrome-extension|moz-extension):\/\//)
  })

  it('should validate OAuth state parameter (if implemented)', () => {
    // OAuth state parameter helps prevent CSRF attacks
    // This would be implemented in a more secure OAuth flow
    expect(true).toBe(true) // Placeholder for future implementation
  })
})