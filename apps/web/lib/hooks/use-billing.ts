'use client'

import { useQuery } from '@tanstack/react-query'
import type { BillingHistoryResponse } from '@/lib/billing/types'

export function useBillingHistory(enabled = true) {
  return useQuery({
    queryKey: ['billing-history'],
    queryFn: async (): Promise<BillingHistoryResponse> => {
      const response = await fetch('/api/billing/history', { credentials: 'include' })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('يرجى تسجيل الدخول')
        }
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.error?.message ?? 'فشل تحميل بيانات الفوترة')
      }

      return response.json()
    },
    enabled,
    staleTime: 2 * 60 * 1000,
    retry: false,
  })
}
