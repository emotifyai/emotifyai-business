'use client'

import { useQuery } from '@tanstack/react-query'
import { delay, mockUsageStats, mockUsageLogs } from '@/lib/mock-data'

/**
 * Get usage statistics for current period
 */
export function useUsageStats() {
    return useQuery({
        queryKey: ['usage', 'stats'],
        queryFn: async () => {
            await delay(400)
            return mockUsageStats
        },
    })
}

/**
 * Get usage history
 */
export function useUsageHistory() {
    return useQuery({
        queryKey: ['usage', 'history'],
        queryFn: async () => {
            await delay(500)
            return mockUsageLogs
        },
    })
}
