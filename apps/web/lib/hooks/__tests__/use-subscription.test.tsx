import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSubscription } from '../use-subscription'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch as any

beforeEach(() => {
    jest.clearAllMocks()
})

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    })
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
}

describe('useSubscription', () => {
    it('should return subscription data for authenticated user', async () => {
        const mockSubscription = {
            tier: 'basic_monthly',
            status: 'active',
            credits_limit: 350,
            credits_used: 50,
            credits_remaining: 300,
            credits_reset_date: '2024-02-01T00:00:00Z',
            validity_days: null,
            tier_name: 'Basic Monthly',
            current_period_end: '2024-02-01T00:00:00Z'
        }

        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ success: true, data: mockSubscription })
        } as Response)

        const { result } = renderHook(() => useSubscription(), {
            wrapper: createWrapper()
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.data).toEqual(mockSubscription)
        expect(result.current.error).toBeNull()
    })

    it('should handle unauthenticated user', async () => {
        mockFetch.mockResolvedValue({
            ok: false,
            status: 401,
            json: async () => ({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } })
        } as Response)

        const { result } = renderHook(() => useSubscription(), {
            wrapper: createWrapper()
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.error).toBeNull()
        expect(result.current.data).toBeNull()
    })

    it('should handle subscription not found', async () => {
        mockFetch.mockResolvedValue({
            ok: false,
            status: 404,
            json: async () => ({ success: false, error: { code: 'NOT_FOUND', message: 'No subscription found' } })
        } as Response)

        const { result } = renderHook(() => useSubscription(), {
            wrapper: createWrapper()
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.error).toBeTruthy()
        expect(result.current.data).toBeUndefined()
    })
})