import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useUsageStats, useUsageHistory } from '../use-usage'
import { createClient } from '@/lib/supabase/client'

// Mock Supabase client
jest.mock('@/lib/supabase/client')

const mockSupabaseClient = {
    auth: {
        getUser: jest.fn()
    },
    from: jest.fn()
}

const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com'
}

const mockSubscription = {
    credits_limit: 100,
    credits_used: 25,
    credits_reset_date: '2024-01-31T00:00:00Z',
    tier_name: 'pro_monthly'
}

const mockUsageLogs = [
    {
        id: '1',
        created_at: '2024-01-15T10:00:00Z',
        input_text: 'Test input',
        output_text: 'Test output',
        language: 'en',
        mode: 'enhance',
        tokens_used: 10,
        credits_consumed: 1,
        success: true
    }
]

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false }
        }
    })
    
    return function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        )
    }
}

describe('useUsageStats', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(createClient as jest.Mock).mockReturnValue(mockSupabaseClient)
    })

    it('fetches usage statistics successfully', async () => {
        // Mock successful authentication
        mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: mockUser },
            error: null
        })

        // Mock subscription query chain
        const mockSubscriptionQuery = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
                data: mockSubscription,
                error: null
            })
        }

        // Mock usage count query chain
        const mockUsageCountQuery = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            gte: jest.fn().mockResolvedValue({ count: 5, error: null })
        }

        mockSupabaseClient.from.mockImplementation((table: string) => {
            if (table === 'subscriptions') {
                return mockSubscriptionQuery
            }
            if (table === 'usage_logs') {
                return mockUsageCountQuery
            }
            return mockUsageCountQuery
        })

        const { result } = renderHook(() => useUsageStats(), {
            wrapper: createWrapper()
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.data).toMatchObject({
            credits_used: 25,
            credits_remaining: 75,
            reset_date: '2024-01-31T00:00:00Z',
            daily_usage: 5,
            weekly_usage: 5,
            monthly_usage: 5
        })
        expect(result.current.data?.total_enhancements).toBeGreaterThanOrEqual(0)
    })

    it('handles authentication errors', async () => {
        // Mock authentication failure
        mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: { message: 'Not authenticated' }
        })

        const { result } = renderHook(() => useUsageStats(), {
            wrapper: createWrapper()
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.error).toBeTruthy()
        expect(result.current.error?.message).toContain('Authentication required')
    })
})

describe('useUsageHistory', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(createClient as jest.Mock).mockReturnValue(mockSupabaseClient)
    })

    it('fetches usage history successfully', async () => {
        // Mock successful authentication
        mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: mockUser },
            error: null
        })

        // Mock usage logs query
        const mockHistoryQuery = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            range: jest.fn().mockResolvedValue({
                data: mockUsageLogs,
                error: null,
                count: 1
            })
        }

        mockSupabaseClient.from.mockReturnValue(mockHistoryQuery)

        const { result } = renderHook(() => useUsageHistory(), {
            wrapper: createWrapper()
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect((result.current.data?.pages[0] as any).data).toEqual([
            {
                id: '1',
                created_at: '2024-01-15T10:00:00Z',
                input_text: 'Test input',
                output_text: 'Test output',
                language: 'en',
                mode: 'enhance',
                tokens_used: 10,
                credits_consumed: 1,
                success: true
            }
        ])
    })

    it('handles authentication errors', async () => {
        // Mock authentication failure
        mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: { message: 'Not authenticated' }
        })

        const { result } = renderHook(() => useUsageHistory(), {
            wrapper: createWrapper()
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.error).toBeTruthy()
        expect(result.current.error?.message).toContain('Authentication required')
    })
})