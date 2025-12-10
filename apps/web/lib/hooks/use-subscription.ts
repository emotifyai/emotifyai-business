'use client'

import { useQuery } from '@tanstack/react-query'
import { SubscriptionTier, SubscriptionStatus } from '@/types/database'

export interface SubscriptionData {
    tier: SubscriptionTier
    status: SubscriptionStatus
    credits_limit: number
    credits_used: number
    credits_remaining: number
    credits_reset_date: string | null
    validity_days: number | null
    tier_name: string
}

/**
 * Hook to get current user's subscription data
 */
export function useSubscription() {
    return useQuery({
        queryKey: ['subscription'],
        queryFn: async (): Promise<SubscriptionData | null> => {
            const response = await fetch('/api/subscription', {
                credentials: 'include',
            })

            if (!response.ok) {
                if (response.status === 401) {
                    // User not authenticated
                    return null
                }
                throw new Error('Failed to fetch subscription data')
            }

            const result = await response.json()
            
            if (!result.success) {
                throw new Error(result.error?.message || 'Failed to fetch subscription data')
            }

            return result.data
        },
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

/**
 * Legacy hook for backwards compatibility
 */
export function useSubscriptionLegacy() {
    const { data: subscription, isLoading: loading } = useSubscription()
    return { subscription, loading }
}
