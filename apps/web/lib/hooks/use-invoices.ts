'use client'

import { useQuery } from '@tanstack/react-query'
import type { BillingInvoicesResponse } from '@/lib/billing/types'

export function useInvoices(enabled = true) {
  return useQuery({
    queryKey: ['billing-invoices'],
    queryFn: async (): Promise<BillingInvoicesResponse> => {
      const response = await fetch('/api/billing/invoices', {
        credentials: 'include',
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('يرجى تسجيل الدخول')
        }
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.error?.message ?? 'فشل تحميل سجل الفواتير')
      }

      return response.json()
    },
    enabled,
    staleTime: 2 * 60 * 1000,
    retry: false,
  })
}
