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
    current_period_end: string
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
 * Hook to create checkout session (placeholder implementation)
 */
export function useCreateCheckout() {
    return {
        mutate: (tier: SubscriptionTier) => {
            // TODO: Implement checkout creation
            console.log('Creating checkout for tier:', tier)
        },
        mutateAsync: async (tier: SubscriptionTier) => {
            // TODO: Implement checkout creation
            console.log('Creating checkout for tier:', tier)
            throw new Error('Checkout creation not implemented yet')
        },
        isLoading: false
    }
}

/**
 * Hook to access customer portal (placeholder implementation)
 */
export function useCustomerPortal() {
    return {
        mutate: () => {
            // TODO: Implement customer portal access
            console.log('Accessing customer portal')
        },
        mutateAsync: async () => {
            // TODO: Implement customer portal access
            console.log('Accessing customer portal')
            throw new Error('Customer portal access not implemented yet')
        },
        isLoading: false
    }
}

/**
 * Legacy hook for backwards compatibility
 */
export function useSubscriptionLegacy() {
    const { data: subscription, isLoading: loading } = useSubscription()
    return { subscription, loading }
}
