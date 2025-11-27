'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { delay, mockUser } from '@/lib/mock-data'
import type { Profile } from '@/types/database'

// =============================================================================
// AUTH HOOKS
// =============================================================================

/**
 * Get current authenticated user
 */
export function useUser() {
    return useQuery({
        queryKey: ['user'],
        queryFn: async (): Promise<Profile | null> => {
            await delay(300)
            // In mock mode, always return mock user
            // In production, this would call Supabase auth
            return mockUser
        },
    })
}

/**
 * Login mutation
 */
export function useLogin() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ email, password }: { email: string; password: string }) => {
            await delay(800)
            // Mock login - always succeeds
            return { user: mockUser }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user'] })
        },
    })
}

/**
 * Signup mutation
 */
export function useSignup() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ email, password, displayName }: { email: string; password: string; displayName?: string }) => {
            await delay(1000)
            // Mock signup - always succeeds
            return { user: { ...mockUser, display_name: displayName || mockUser.display_name } }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user'] })
        },
    })
}

/**
 * Logout mutation
 */
export function useLogout() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async () => {
            await delay(300)
            // Mock logout
            return { success: true }
        },
        onSuccess: () => {
            queryClient.setQueryData(['user'], null)
            queryClient.clear()
        },
    })
}

/**
 * OAuth login
 */
export function useOAuthLogin() {
    return useMutation({
        mutationFn: async ({ provider }: { provider: 'google' | 'github' }) => {
            await delay(500)
            // In production, this would redirect to OAuth provider
            // For mock, we'll just simulate success
            console.log(`OAuth login with ${provider}`)
            return { success: true, redirectUrl: '/dashboard' }
        },
    })
}
