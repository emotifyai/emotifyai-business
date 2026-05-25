'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Button,
} from '@emotifyai/ui'
import { History, ExternalLink } from 'lucide-react'
import type { BillingPayment } from '@/lib/billing/types'
import { formatDateAr } from '@/lib/utils'

interface BillingPaymentsTableProps {
  payments: BillingPayment[]
}

export function BillingPaymentsTable({ payments }: BillingPaymentsTableProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          <CardTitle>سجل المدفوعات</CardTitle>
        </div>
        <CardDescription>ما تم دفعه: الخطة، نوع العملية (اشتراك / تجديد / دفعة واحدة)</CardDescription>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            لا توجد مدفوعات مسجلة بعد.
          </p>
        ) : (
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-end">التاريخ</TableHead>
                  <TableHead className="text-end">الخطة</TableHead>
                  <TableHead className="text-end">النوع</TableHead>
                  <TableHead className="text-end">المبلغ</TableHead>
                  <TableHead className="text-end">الحالة</TableHead>
                  <TableHead className="text-end w-[100px]">إيصال</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDateAr(p.date)}
                    </TableCell>
                    <TableCell>{p.planName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{p.paymentTypeLabel}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{p.amountFormatted}</TableCell>
                    <TableCell>
                      <Badge variant={p.status === 'paid' || p.status === 'active' ? 'default' : 'secondary'}>
                        {p.statusLabel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {p.receiptUrl ? (
                        <Button variant="ghost" size="sm" asChild>
                          <a
                            href={p.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`عرض إيصال ${p.id}`}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
