'use client'

import { useState } from 'react'
import { Alert, AlertDescription, Skeleton } from '@emotifyai/ui'
import { AlertCircle } from 'lucide-react'
import { useBillingHistory } from '@/lib/hooks/use-billing'
import { hasActivePaidSubscription } from '@/lib/billing/paid-tier'
import { SubscriptionTier } from '@/types/database'
import type { SubscriptionData } from '@/lib/hooks/use-subscription'
import { BillingEmptyState } from './billing-empty-state'
import { BillingSummaryCard } from './billing-summary-card'
import { BillingInvoicesTable } from './billing-invoices-table'
import { BillingPaymentsTable } from './billing-payments-table'

interface BillingAnalyticsProps {
  subscription: SubscriptionData
}

export function BillingAnalytics({ subscription }: BillingAnalyticsProps) {
  const isPaidActive = hasActivePaidSubscription(
    subscription.tier,
    subscription.status
  )
  const { data, isLoading, error } = useBillingHistory(isPaidActive)
  const [portalLoading, setPortalLoading] = useState(false)

  if (!isPaidActive) {
    return <BillingEmptyState />
  }

  if (isLoading) {
    return <BillingAnalyticsSkeleton />
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    )
  }

  if (!data?.summary) {
    return <BillingEmptyState />
  }

  const handlePortal = async () => {
    if (subscription.tier === SubscriptionTier.LIFETIME_LAUNCH) return
    try {
      setPortalLoading(true)
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const json = await res.json()
      if (json.url) window.location.href = json.url
    } finally {
      setPortalLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {data.message && (
        <Alert>
          <AlertDescription>{data.message}</AlertDescription>
        </Alert>
      )}

      <BillingSummaryCard
        summary={data.summary}
        onManageBilling={data.summary.portalAvailable ? handlePortal : undefined}
        isPortalLoading={portalLoading}
      />

      <BillingInvoicesTable
        invoices={data.invoices}
        message={
          !data.lemonConfigured
            ? 'تفاصيل الفواتير متاحة بعد تفعيل الاشتراك'
            : undefined
        }
      />

      <BillingPaymentsTable payments={data.payments} />
    </div>
  )
}

function BillingAnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-[200px] w-full" />
      <Skeleton className="h-[280px] w-full" />
      <Skeleton className="h-[280px] w-full" />
    </div>
  )
}
