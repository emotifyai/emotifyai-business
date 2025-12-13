/**
 * Real usage statistics and history hooks
 * Connects to Supabase usage_logs table with proper error handling
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query'


// Types for usage statistics
export interface UsageStats {
    total_enhancements: number
    credits_used: number
    credits_remaining: number
    reset_date: string | null
    daily_usage: number
    weekly_usage: number
    monthly_usage: number
}

export interface UsageHistoryItem {
    id: string
    created_at: string
    input_text: string
    output_text: string
    language: string
    mode: string
    tokens_used: number
    credits_consumed: number
    success: boolean
}

// Legacy interface for backward compatibility
export interface LegacyUsageData {
    currentPeriod: {
        enhancementsUsed: number
        enhancementsLimit: number
    }
    history: Array<{
        date: string
        count: number
    }>
}

/**
 * Hook for fetching real-time usage statistics
 * Refreshes every 30 seconds and handles authentication errors
 */
export function useUsageStats() {
    return useQuery({
        queryKey: ['usage-stats'],
        queryFn: async (): Promise<UsageStats> => {
            const response = await fetch('/api/usage?type=stats')
            if (!response.ok) {
                throw new Error(`Failed to fetch usage stats: ${response.statusText}`)
            }
            
            const data = await response.json()
            if (!data.success) {
                throw new Error(`Failed to fetch usage stats: ${data.error?.message}`)
            }

            return data.data
        },
        refetchInterval: 30 * 1000, // Refresh every 30 seconds
        retry: (failureCount, error) => {
            // Don't retry authentication errors
            if (error.message.includes('Authentication required')) {
                return false
            }
            // Retry other errors up to 2 times
            return failureCount < 2
        },
        staleTime: 25 * 1000, // Consider data stale after 25 seconds
    })
}

/**
 * Hook for fetching usage history with pagination
 * Provides detailed enhancement activity tracking
 */
export function useUsageHistory(pageSize: number = 20) {
    return useInfiniteQuery({
        queryKey: ['usage-history', pageSize],
        initialPageParam: 0,
        queryFn: async ({ pageParam = 0 }: { pageParam: number }): Promise<{
            data: UsageHistoryItem[]
            nextPage: number | null
            hasMore: boolean
        }> => {
            const response = await fetch(`/api/usage?type=history&page=${pageParam}&pageSize=${pageSize}`)
            if (!response.ok) {
                throw new Error(`Failed to fetch usage history: ${response.statusText}`)
            }
            
            const result = await response.json()
            if (!result.success) {
                throw new Error(`Failed to fetch usage history: ${result.error?.message}`)
            }

            return {
                data: result.data.logs,
                nextPage: result.data.pagination.nextPage,
                hasMore: result.data.pagination.hasMore,
            }
        },
        getNextPageParam: (lastPage: { nextPage: number | null }) => lastPage.nextPage,
        refetchInterval: 30 * 1000, // Refresh every 30 seconds
        retry: (failureCount, error) => {
            // Don't retry authentication errors
            if (error.message.includes('Authentication required')) {
                return false
            }
            // Retry other errors up to 2 times
            return failureCount < 2
        },
        staleTime: 25 * 1000, // Consider data stale after 25 seconds
    })
}

/**
 * Legacy hook for backward compatibility with existing dashboard components
 * Transforms new usage data into the old format
 */
export function useUsage() {
    const { data: stats, isLoading, error } = useUsageStats()
    const { data: historyPages } = useUsageHistory(30) // Get recent history for chart

    // Transform data to legacy format
    const usage: LegacyUsageData | null = stats ? {
        currentPeriod: {
            enhancementsUsed: stats.credits_used,
            enhancementsLimit: stats.credits_used + stats.credits_remaining,
        },
        history: historyPages?.pages.flatMap((page: any) => 
            page.data.map((log: any) => ({
                date: log.created_at,
                count: log.credits_consumed,
            }))
        ) ?? [],
    } : null

    return { 
        usage, 
        loading: isLoading,
        error 
    }
}
