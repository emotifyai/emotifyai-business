'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { delay, mockApiKeys } from '@/lib/mock-data'
import type { ApiKey } from '@/types/database'

/**
 * Get all API keys for current user
 */
export function useApiKeys() {
    return useQuery({
        queryKey: ['api-keys'],
        queryFn: async (): Promise<ApiKey[]> => {
            await delay(400)
            return mockApiKeys
        },
    })
}

/**
 * Create new API key
 */
export function useCreateApiKey() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ name }: { name: string }) => {
            await delay(600)
            // Mock API key creation
            const newKey: ApiKey = {
                id: `key-${Date.now()}`,
                user_id: 'mock-user-id-123',
                created_at: new Date().toISOString(),
                key_hash: `hashed_${Date.now()}`,
                name,
                last_used_at: null,
                revoked: false,
            }
            return {
                ...newKey,
                key: `vb_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`, // Only returned once
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['api-keys'] })
        },
    })
}

/**
 * Revoke an API key
 */
export function useRevokeApiKey() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id }: { id: string }) => {
            await delay(400)
            // Mock revoke
            return { success: true, id }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['api-keys'] })
        },
    })
}
