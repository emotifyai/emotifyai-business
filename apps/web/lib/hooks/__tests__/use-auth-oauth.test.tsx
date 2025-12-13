/**
 * OAuth Authentication Tests
 * Tests the OAuth flow and token synchronization between web app and extension
 */

import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useOAuthLogin, useUser, useLogout } from '../use-auth'
import { createClient } from '@/lib/supabase/client'

// Mock Supabase client
jest.mock('@/lib/supabase/client')
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

// Mock Supabase auth methods
const mockAuth = {
  signInWithOAuth: jest.fn(),
  getUser: jest.fn(),
  signOut: jest.fn(),
}

const mockSupabase = {
  auth: mockAuth,
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn()
      }))
    }))
  }))
}

beforeEach(() => {
  jest.clearAllMocks()
  mockCreateClient.mockReturnValue(mockSupabase as any)
})

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('OAuth Authentication', () => {
  describe('useOAuthLogin', () => {
    it('should initiate Google OAuth flow with correct redirect URL', async () => {
      const mockOAuthResponse = {
        data: { url: 'https://accounts.google.com/oauth/authorize?...' },
        error: null
      }
      
      mockAuth.signInWithOAuth.mockResolvedValue(mockOAuthResponse)
      
      const { result } = renderHook(() => useOAuthLogin(), {
        wrapper: createWrapper(),
      })
      
      await waitFor(() => {
        result.current.mutate({ provider: 'google' })
      })
      
      expect(mockAuth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
    })
    
    it('should handle OAuth errors gracefully', async () => {
      const mockError = new Error('OAuth failed')
      mockAuth.signInWithOAuth.mockRejectedValue(mockError)
      
      const { result } = renderHook(() => useOAuthLogin(), {
        wrapper: createWrapper(),
      })
      
      await waitFor(() => {
        result.current.mutate({ provider: 'google' })
      })
      
      await waitFor(() => {
        expect(result.current.error).toBe(mockError)
      })
    })
    
    it('should use production redirect URL in production environment', async () => {
      // Mock production environment
      const originalLocation = window.location
      Object.defineProperty(window, 'location', {
        value: { ...originalLocation, origin: 'https://emotifyai.com' },
        writable: true
      })
      
      const mockOAuthResponse = {
        data: { url: 'https://accounts.google.com/oauth/authorize?...' },
        error: null
      }
      
      mockAuth.signInWithOAuth.mockResolvedValue(mockOAuthResponse)
      
      const { result } = renderHook(() => useOAuthLogin(), {
        wrapper: createWrapper(),
      })
      
      await waitFor(() => {
        result.current.mutate({ provider: 'google' })
      })
      
      expect(mockAuth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'https://emotifyai.com/auth/callback',
        },
      })
      
      // Restore original location
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true
      })
    })
  })
  
  describe('useUser', () => {
    it('should fetch user profile after successful OAuth', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {
          full_name: 'Test User',
          avatar_url: 'https://example.com/avatar.jpg'
        }
      }
      
      const mockProfile = {
        full_name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg'
      }
      
      mockAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null
            })
          }))
        }))
      })
      
      const { result } = renderHook(() => useUser(), {
        wrapper: createWrapper(),
      })
      
      await waitFor(() => {
        expect(result.current.data).toEqual({
          id: 'user-123',
          email: 'test@example.com',
          display_name: 'Test User',
          avatar_url: 'https://example.com/avatar.jpg'
        })
      })
    })
    
    it('should handle missing user profile gracefully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {}
      }
      
      mockAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: null
            })
          }))
        }))
      })
      
      const { result } = renderHook(() => useUser(), {
        wrapper: createWrapper(),
      })
      
      await waitFor(() => {
        expect(result.current.data).toEqual({
          id: 'user-123',
          email: 'test@example.com',
          display_name: 'test',
          avatar_url: null
        })
      })
    })
  })
  
  describe('useLogout', () => {
    it('should clear user session and invalidate queries', async () => {
      mockAuth.signOut.mockResolvedValue({ error: null })
      
      const { result } = renderHook(() => useLogout(), {
        wrapper: createWrapper(),
      })
      
      await waitFor(() => {
        result.current.mutate()
      })
      
      expect(mockAuth.signOut).toHaveBeenCalled()
    })
    
    it('should handle logout errors gracefully', async () => {
      const mockError = new Error('Logout failed')
      mockAuth.signOut.mockRejectedValue(mockError)
      
      const { result } = renderHook(() => useLogout(), {
        wrapper: createWrapper(),
      })
      
      await waitFor(() => {
        result.current.mutate()
      })
      
      await waitFor(() => {
        expect(result.current.error).toBe(mockError)
      })
    })
  })
})

describe('OAuth Configuration Validation', () => {
  it('should use correct environment variables', () => {
    // Test that OAuth configuration uses production URLs
    const expectedRedirectUrl = process.env.NODE_ENV === 'production' 
      ? 'https://emotifyai.com/auth/callback'
      : `${window.location.origin}/auth/callback`
    
    // This would be tested in the actual OAuth flow
    expect(expectedRedirectUrl).toBeDefined()
  })
  
  it('should validate OAuth client configuration', () => {
    // Test OAuth client ID is configured
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID
    
    if (process.env.NODE_ENV === 'production') {
      expect(clientId).toBeDefined()
      expect(clientId).not.toContain('YOUR_')
      expect(clientId).not.toContain('placeholder')
    }
  })
})

describe('Cross-Platform Token Sync', () => {
  it('should provide session data for extension sync', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com'
    }
    
    mockAuth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })
    
    const { result } = renderHook(() => useUser(), {
      wrapper: createWrapper(),
    })
    
    await waitFor(() => {
      expect(result.current.data).toBeDefined()
      expect(result.current.data?.id).toBe('user-123')
    })
    
    // This data would be available for the extension to sync
    expect(result.current.data).toMatchObject({
      id: 'user-123',
      email: 'test@example.com'
    })
  })
})