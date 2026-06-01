'use client'

import { InvoicesPageContent } from '@/components/dashboard/invoices/invoices-page-content'

export default function InvoicesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">الفواتير</h2>
        <p className="text-muted-foreground">
          سجل الفوترة: اشتراكات الخطط وفواتير شراء الحزم
        </p>
      </div>

      <InvoicesPageContent />
    </div>
  )
}
