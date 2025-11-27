'use client'

import { useQuery } from '@tanstack/react-query'
import { delay, mockSubscription } from '@/lib/mock-data'
import type { Subscription } from '@/types/database'

/**
 * Get current user's subscription
 */
export function useSubscription() {
    return useQuery({
        queryKey: ['subscription'],
        queryFn: async (): Promise<Subscription | null> => {
            await delay(400)
            return mockSubscription
        },
    })
}

/**
 * Create checkout session for subscription purchase
 */
export function useCreateCheckout() {
    // This would be implemented when connecting to real Lemon Squeezy API
    // For now, just a placeholder
    return {
        mutate: (tier: string) => {
            console.log(`Creating checkout for tier: ${tier}`)
        },
    }
}

/**
 * Get customer portal URL
 */
export function useCustomerPortal() {
    // This would be implemented when connecting to real Lemon Squeezy API
    // For now, just a placeholder
    return {
        mutate: () => {
            console.log('Opening customer portal')
        },
    }
}
