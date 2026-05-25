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
import { ExternalLink, FileText } from 'lucide-react'
import type { BillingInvoice } from '@/lib/billing/types'
import { formatDateAr } from '@/lib/utils'

interface BillingInvoicesTableProps {
  invoices: BillingInvoice[]
  message?: string
}

export function BillingInvoicesTable({ invoices, message }: BillingInvoicesTableProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <CardTitle>الفواتير</CardTitle>
        </div>
        <CardDescription>
          {message ?? 'فواتير الاشتراك والمدفوعات من Lemon Squeezy'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            {message ?? 'لا توجد فواتير مسجلة بعد.'}
          </p>
        ) : (
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-end">التاريخ</TableHead>
                  <TableHead className="text-end">الخطة</TableHead>
                  <TableHead className="text-end">المبلغ</TableHead>
                  <TableHead className="text-end">الحالة</TableHead>
                  <TableHead className="text-end w-[100px]">الإجراء</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDateAr(inv.date)}
                    </TableCell>
                    <TableCell>{inv.planName}</TableCell>
                    <TableCell className="font-medium">{inv.amountFormatted}</TableCell>
                    <TableCell>
                      <Badge variant={inv.status === 'paid' ? 'default' : 'secondary'}>
                        {inv.statusLabel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {inv.downloadUrl ? (
                        <Button variant="ghost" size="sm" asChild>
                          <a
                            href={inv.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`تحميل فاتورة ${inv.id}`}
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
