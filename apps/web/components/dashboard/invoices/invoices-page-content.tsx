'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@emotifyai/ui'
import { AlertCircle, Receipt } from 'lucide-react'
import { useInvoices } from '@/lib/hooks/use-invoices'
import type { BillingInvoiceRow, InvoicePurchaseType } from '@/lib/billing/types'
import { InvoicesTable } from './invoices-table'

type FilterTab = 'all' | InvoicePurchaseType

function filterInvoices(
  invoices: BillingInvoiceRow[],
  tab: FilterTab
): BillingInvoiceRow[] {
  if (tab === 'all') return invoices
  return invoices.filter((row) => row.purchaseType === tab)
}

export function InvoicesPageContent() {
  const { data, isLoading, error } = useInvoices()
  const [tab, setTab] = useState<FilterTab>('all')

  const filtered = useMemo(
    () => filterInvoices(data?.invoices ?? [], tab),
    [data?.invoices, tab]
  )

  const planCount = useMemo(
    () => (data?.invoices ?? []).filter((r) => r.purchaseType === 'plan').length,
    [data?.invoices]
  )
  const bundleCount = useMemo(
    () => (data?.invoices ?? []).filter((r) => r.purchaseType === 'bundle').length,
    [data?.invoices]
  )

  if (isLoading) {
    return <InvoicesSkeleton />
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    )
  }

  if (!data?.hasBillingHistory) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-muted-foreground" />
            <CardTitle>لا توجد فواتير بعد</CardTitle>
          </div>
          <CardDescription>
            بعد الاشتراك في خطة مدفوعة أو شراء حزمة تحويلات ستظهر هنا فواتيرك
            وإيصالاتك.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="glow" asChild className="w-full sm:w-auto">
            <Link href="/pricing">عرض الخطط والأسعار</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {data?.message ? (
        <Alert>
          <AlertDescription>{data.message}</AlertDescription>
        </Alert>
      ) : null}

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as FilterTab)}
        dir="rtl"
      >
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all">
            الكل ({data?.invoices.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="plan">خطط ({planCount})</TabsTrigger>
          <TabsTrigger value="bundle">حزم ({bundleCount})</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-6">
          <InvoicesTable invoices={filtered} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function InvoicesSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-[360px] w-full" />
    </div>
  )
}
