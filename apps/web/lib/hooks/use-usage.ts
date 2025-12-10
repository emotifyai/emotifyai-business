/**
 * Real usage statistics and history hooks
 * Connects to Supabase usage_logs table with proper error handling
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { UsageLog } from '@/types/database'

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
    const supabase = createClient()

    return useQuery({
        queryKey: ['usage-stats'],
        queryFn: async (): Promise<UsageStats> => {
            // Check authentication first
            const { data: { user }, error: authError } = await supabase.auth.getUser()
            
            if (authError || !user) {
                throw new Error('Authentication required to fetch usage statistics')
            }

            // Get user's current subscription and credit status
            const { data: subscription, error: subError } = await supabase
                .from('subscriptions')
                .select('credits_limit, credits_used, credits_reset_date, tier_name')
                .eq('user_id', user.id)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            if (subError && subError.code !== 'PGRST116') { // PGRST116 = no rows returned
                throw new Error(`Failed to fetch subscription: ${subError.message}`)
            }

            // Default to free plan if no subscription found
            const credits_limit = subscription?.credits_limit ?? 50
            const credits_used = subscription?.credits_used ?? 0
            const credits_remaining = Math.max(0, credits_limit - credits_used)
            const reset_date = subscription?.credits_reset_date ?? null

            // Calculate usage breakdowns from usage_logs
            const now = new Date()
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

            // Get daily usage
            const { count: daily_usage, error: dailyError } = await supabase
                .from('usage_logs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('success', true)
                .gte('created_at', oneDayAgo.toISOString())

            if (dailyError) {
                throw new Error(`Failed to fetch daily usage: ${dailyError.message}`)
            }

            // Get weekly usage
            const { count: weekly_usage, error: weeklyError } = await supabase
                .from('usage_logs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('success', true)
                .gte('created_at', oneWeekAgo.toISOString())

            if (weeklyError) {
                throw new Error(`Failed to fetch weekly usage: ${weeklyError.message}`)
            }

            // Get monthly usage
            const { count: monthly_usage, error: monthlyError } = await supabase
                .from('usage_logs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('success', true)
                .gte('created_at', oneMonthAgo.toISOString())

            if (monthlyError) {
                throw new Error(`Failed to fetch monthly usage: ${monthlyError.message}`)
            }

            // Get total enhancements (all time)
            const { count: total_enhancements, error: totalError } = await supabase
                .from('usage_logs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('success', true)

            if (totalError) {
                throw new Error(`Failed to fetch total usage: ${totalError.message}`)
            }

            return {
                total_enhancements: total_enhancements ?? 0,
                credits_used,
                credits_remaining,
                reset_date,
                daily_usage: daily_usage ?? 0,
                weekly_usage: weekly_usage ?? 0,
                monthly_usage: monthly_usage ?? 0,
            }
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
    const supabase = createClient()

    return useInfiniteQuery({
        queryKey: ['usage-history', pageSize],
        initialPageParam: 0,
        queryFn: async ({ pageParam = 0 }: { pageParam: number }): Promise<{
            data: UsageHistoryItem[]
            nextPage: number | null
            hasMore: boolean
        }> => {
            // Check authentication first
            const { data: { user }, error: authError } = await supabase.auth.getUser()
            
            if (authError || !user) {
                throw new Error('Authentication required to fetch usage history')
            }

            const from = pageParam * pageSize
            const to = from + pageSize - 1

            const { data: logs, error, count } = await supabase
                .from('usage_logs')
                .select(`
                    id,
                    created_at,
                    input_text,
                    output_text,
                    language,
                    mode,
                    tokens_used,
                    credits_consumed,
                    success
                `, { count: 'exact' })
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .range(from, to)

            if (error) {
                throw new Error(`Failed to fetch usage history: ${error.message}`)
            }

            const totalCount = count ?? 0
            const hasMore = to < totalCount - 1
            const nextPage = hasMore ? pageParam + 1 : null

            return {
                data: logs?.map(log => ({
                    id: log.id,
                    created_at: log.created_at,
                    input_text: log.input_text,
                    output_text: log.output_text,
                    language: log.language,
                    mode: log.mode,
                    tokens_used: log.tokens_used,
                    credits_consumed: log.credits_consumed,
                    success: log.success,
                })) ?? [],
                nextPage,
                hasMore,
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
