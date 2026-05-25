'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@emotifyai/ui'
import { CreditCard } from 'lucide-react'

export function BillingEmptyState() {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          <CardTitle>الفوترة والفواتير</CardTitle>
        </div>
        <CardDescription>
          بعد الاشتراك في خطة مدفوعة ستظهر هنا الفواتير وسجل المدفوعات وتفاصيل الاشتراك.
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
