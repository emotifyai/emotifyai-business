'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { SubscriptionTier, SubscriptionStatus } from '@/types/database'
import { buildCheckoutThankYouUrl } from '@/lib/checkout/thank-you-redirect'

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
                throw new Error('فشل جلب بيانات الاشتراك')
            }

            const result = await response.json()
            
            if (!result.success) {
                throw new Error(result.error?.message || 'فشل جلب بيانات الاشتراك')
            }

            return result.data
        },
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

/**
 * Create Lemon Squeezy checkout for a tier
 */
export function useCreateCheckout() {
    return useMutation({
        mutationFn: async (tier: SubscriptionTier) => {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    tier,
                    redirectUrl: buildCheckoutThankYouUrl(window.location.origin, tier),
                }),
            })
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.error ?? 'فشل إنشاء جلسة الدفع')
            }
            if (data.url) {
                window.location.href = data.url
            }
            return data
        },
    })
}

/**
 * Open Lemon Squeezy customer billing portal
 */
export function useCustomerPortal() {
    return useMutation({
        mutationFn: async () => {
            const response = await fetch('/api/billing/portal', {
                method: 'POST',
                credentials: 'include',
            })
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.error ?? 'فشل فتح بوابة الفوترة')
            }
            if (data.url) {
                window.location.href = data.url
            }
            return data
        },
    })
}

/**
 * Legacy hook for backwards compatibility
 */
export function useSubscriptionLegacy() {
    const { data: subscription, isLoading: loading } = useSubscription()
    return { subscription, loading }
}
