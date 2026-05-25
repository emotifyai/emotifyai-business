import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useUsageStats, useUsageHistory } from '../use-usage'

const mockUsageStats = {
  total_enhancements: 5,
  credits_used: 25,
  credits_remaining: 75,
  reset_date: '2024-01-31T00:00:00Z',
  daily_usage: 5,
  weekly_usage: 5,
  monthly_usage: 5,
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
    success: true,
  },
]

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useUsageStats', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock) = jest.fn()
  })

  it('fetches usage statistics successfully', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockUsageStats }),
    })

    const { result } = renderHook(() => useUsageStats(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.data).toEqual(mockUsageStats)
  })

  it('handles API errors', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('فشل جلب إحصائيات الاستخدام: Unauthorized'))

    const { result } = renderHook(() => useUsageStats(), { wrapper: createWrapper() })

    await waitFor(
      () => {
        expect(result.current.isError).toBe(true)
      },
      { timeout: 8000 }
    )

    expect(result.current.error?.message).toContain('فشل جلب إحصائيات الاستخدام')
  })
})

describe('useUsageHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock) = jest.fn()
  })

  it('fetches usage history successfully', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          logs: mockUsageLogs,
          pagination: { page: 0, pageSize: 20, totalCount: 1, hasMore: false, nextPage: null },
        },
      }),
    })

    const { result } = renderHook(() => useUsageHistory(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.data?.pages[0].data).toEqual(mockUsageLogs)
  })

  it('handles API errors', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: false,
        error: { message: 'يرجى تسجيل الدخول' },
      }),
    })

    const { result } = renderHook(() => useUsageHistory(), { wrapper: createWrapper() })

    await waitFor(
      () => {
        expect(result.current.isError).toBe(true)
      },
      { timeout: 8000 }
    )

    expect(result.current.error?.message).toContain('فشل جلب سجل الاستخدام')
  })
})
