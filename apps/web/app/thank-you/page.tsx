'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button, Card, CardContent, LoadingSpinner } from '@emotifyai/ui'
import { CheckCircle2 } from 'lucide-react'
import { trackBundlePurchased } from '@/lib/analytics/ga'
import { isBundleTier, type SubscriptionTierId } from '@emotifyai/config/pricing'

type VerifyState = 'loading' | 'verified' | 'pending' | 'failed'

export default function ThankYouPage() {
  const searchParams = useSearchParams()
  const tier = searchParams.get('tier')
  const orderId = searchParams.get('order_id')
  const [verifyState, setVerifyState] = useState<VerifyState>('loading')
  const bundleTracked = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function verifyPayment() {
      const params = new URLSearchParams()
      if (tier) params.set('tier', tier)
      if (orderId) params.set('order_id', orderId)

      try {
        const response = await fetch(`/api/checkout/verify?${params.toString()}`, {
          credentials: 'include',
        })

        if (cancelled) return

        if (!response.ok) {
          setVerifyState(response.status === 401 ? 'failed' : 'pending')
          return
        }

        const data = (await response.json()) as {
          verified?: boolean
          pending?: boolean
          isBundle?: boolean
          tier?: string
        }

        if (data.verified) {
          setVerifyState('verified')
          const resolvedTier = data.tier ?? tier ?? undefined

          if (
            data.isBundle &&
            resolvedTier &&
            isBundleTier(resolvedTier as SubscriptionTierId) &&
            !bundleTracked.current
          ) {
            bundleTracked.current = true
            trackBundlePurchased(resolvedTier)
          }
        } else if (data.pending) {
          setVerifyState('pending')
        } else {
          setVerifyState('failed')
        }
      } catch {
        if (!cancelled) setVerifyState('pending')
      }
    }

    void verifyPayment()

    return () => {
      cancelled = true
    }
  }, [tier, orderId])

  const isBundle = tier ? isBundleTier(tier as SubscriptionTierId) : false

  return (
    <main className="page-container flex min-h-dvh flex-col items-center justify-center py-16" dir="rtl">
      <Card className="w-full max-w-lg border-2 shadow-lg">
        <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
          {verifyState === 'loading' ? (
            <>
              <LoadingSpinner className="h-10 w-10 text-primary" />
              <p className="text-muted-foreground">جاري التحقق من عملية الدفع…</p>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-14 w-14 text-primary" aria-hidden />
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">شكراً لك!</h1>
                {verifyState === 'verified' ? (
                  <p className="text-muted-foreground leading-relaxed">
                    {isBundle
                      ? 'تم تأكيد شراء الحزمة وإضافة الرصيد إلى حسابك. يمكنك البدء بالتحويل فوراً من المحرر.'
                      : 'تم تأكيد اشتراكك بنجاح. استمتع بجميع مزايا خطتك من لوحة التحكم.'}
                  </p>
                ) : verifyState === 'pending' ? (
                  <p className="text-muted-foreground leading-relaxed">
                    استلمنا طلبك. قد يستغرق تفعيل الرصيد دقيقة واحدة — حدّث الصفحة أو انتقل إلى المحرر.
                  </p>
                ) : (
                  <p className="text-muted-foreground leading-relaxed">
                    إذا أكملت الدفع للتو، جرّب تحديث الصفحة. وإلا تواصل مع الدعم من الإعدادات.
                  </p>
                )}
              </div>
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/dashboard/editor">افتح المحرر</Link>
                </Button>
                <Button variant="outline" asChild className="w-full sm:w-auto">
                  <Link href="/dashboard/subscription">إدارة الاشتراك</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
