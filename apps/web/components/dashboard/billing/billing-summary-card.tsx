'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button, Progress } from '@emotifyai/ui'
import type { BillingSummary } from '@/lib/billing/types'
import { formatDateAr } from '@/lib/utils'

interface BillingSummaryCardProps {
  summary: BillingSummary
  onManageBilling?: () => void
  isPortalLoading?: boolean
}

export function BillingSummaryCard({
  summary,
  onManageBilling,
  isPortalLoading,
}: BillingSummaryCardProps) {
  const usagePct =
    summary.creditsLimit > 0
      ? Math.min(100, (summary.creditsUsed / summary.creditsLimit) * 100)
      : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>ملخص الاشتراك</CardTitle>
          <Badge variant="default">{summary.statusLabel}</Badge>
        </div>
        <CardDescription>
          {summary.planName}
          {summary.nextBillingDate
            ? ` — التجديد القادم: ${formatDateAr(summary.nextBillingDate)}`
            : ` — صالح حتى: ${formatDateAr(summary.currentPeriodEnd)}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">استخدام الرصيد</span>
            <span className="font-medium">
              {summary.creditsUsed} / {summary.creditsLimit}
            </span>
          </div>
          <Progress value={usagePct} className="h-2" />
        </div>
        {summary.portalAvailable && onManageBilling && (
          <Button
            variant="outline"
            className="w-full"
            onClick={onManageBilling}
            disabled={isPortalLoading}
          >
            {isPortalLoading ? 'جاري التحميل…' : 'إدارة الفوترة والفواتير'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
