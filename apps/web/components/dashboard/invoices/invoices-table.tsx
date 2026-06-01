'use client'

import {
  Badge,
  Button,
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
} from '@emotifyai/ui'
import { ExternalLink, Receipt } from 'lucide-react'
import type { BillingInvoiceRow } from '@/lib/billing/types'
import { formatDateAr } from '@/lib/utils'

interface InvoicesTableProps {
  invoices: BillingInvoiceRow[]
}

export function InvoicesTable({ invoices }: InvoicesTableProps) {
  if (invoices.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        لا توجد فواتير في هذا التصنيف.
      </p>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-muted-foreground" />
          <CardTitle>سجل الفواتير</CardTitle>
        </div>
        <CardDescription>
          فواتير الاشتراك (خطة) وإيصالات شراء الحزم (حزمة)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="-mx-2 overflow-x-auto sm:mx-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-end">التاريخ</TableHead>
                <TableHead className="text-end">النوع</TableHead>
                <TableHead className="text-end">المنتج</TableHead>
                <TableHead className="text-end">المبلغ</TableHead>
                <TableHead className="text-end">الحالة</TableHead>
                <TableHead className="w-[100px] text-end">المستند</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatDateAr(row.date)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={row.purchaseType === 'bundle' ? 'secondary' : 'outline'}
                    >
                      {row.purchaseTypeLabel}
                    </Badge>
                  </TableCell>
                  <TableCell>{row.planName}</TableCell>
                  <TableCell className="font-medium">
                    {row.amountFormatted}
                    {row.currency && row.amountFormatted !== '—' ? (
                      <span className="ms-1 text-xs text-muted-foreground">
                        {row.currency}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        row.status === 'paid' || row.status === 'active'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {row.statusLabel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {row.documentUrl ? (
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={row.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`فتح مستند ${row.id}`}
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
      </CardContent>
    </Card>
  )
}
