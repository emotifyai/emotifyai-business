'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

/**
 * Hook to get current authenticated user
 */
export function useUser() {
    return useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const supabase = createClient()
            const { data: { user }, error } = await supabase.auth.getUser()

            if (error) throw error
            if (!user) return null

            // Get user profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            return {
                id: user.id,
                email: user.email!,
                display_name: (profile as any)?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                avatar_url: (profile as any)?.avatar_url || user.user_metadata?.avatar_url || null,
            }
        },
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

/**
 * Hook to login with email and password
 */
export function useLogin() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ email, password }: { email: string; password: string }) => {
            const supabase = createClient()
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            if (error) throw error
            return data
        },
        onSuccess: () => {
            // Invalidate user query to refetch user data
            queryClient.invalidateQueries({ queryKey: ['user'] })
        },
    })
}

/**
 * Hook to signup with email and password
 */
export function useSignup() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            email,
            password,
            displayName
        }: {
            email: string;
            password: string;
            displayName?: string
        }) => {
            const supabase = createClient()
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: displayName,
                    },
                },
            })
            if (error) throw error
            return data
        },
        onSuccess: () => {
            // Invalidate user query to refetch user data
            queryClient.invalidateQueries({ queryKey: ['user'] })
        },
    })
}

/**
 * Hook to login with OAuth providers
 */
export function useOAuthLogin() {
    return useMutation({
        mutationFn: async ({ 
            provider, 
            source, 
            plan, 
            redirectTo 
        }: { 
            provider: 'google'
            source?: string
            plan?: string
            redirectTo?: string
        }) => {
            const supabase = createClient()
            
            // Build callback URL with parameters
            const callbackUrl = new URL('/auth/callback', window.location.origin)
            if (source) callbackUrl.searchParams.set('source', source)
            if (plan) callbackUrl.searchParams.set('plan', plan)
            if (redirectTo) callbackUrl.searchParams.set('redirect_to', redirectTo)
            
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: callbackUrl.toString(),
                },
            })
            if (error) throw error
            return data
        },
    })
}

/**
 * Hook to logout user
 */
export function useLogout() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async () => {
            const supabase = createClient()
            const { error } = await supabase.auth.signOut()
            if (error) throw error
        },
        onSuccess: () => {
            // Clear all queries on logout
            queryClient.clear()
        },
    })
}

/**
 * Legacy hook for backwards compatibility
 */
export function useAuth() {
    const { data: user, isLoading: loading } = useUser()
    return { user, loading }
}
