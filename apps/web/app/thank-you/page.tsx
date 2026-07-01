'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button, Card, CardContent, LoadingSpinner } from '@emotifyai/ui'
import { CheckCircle2, PartyPopper } from 'lucide-react'
import { trackPurchase } from '@/lib/analytics/ga'
import { isBundleTier, type SubscriptionTierId } from '@emotifyai/config/pricing'
import { fireSchoolPrideConfetti } from '@/lib/confetti'

type VerifyState = 'loading' | 'verified' | 'pending' | 'failed'

export default function ThankYouPage() {
  const searchParams = useSearchParams()
  const tier = searchParams.get('tier')
  const orderId = searchParams.get('order_id')
  const [verifyState, setVerifyState] = useState<VerifyState>('loading')
  const purchaseTracked = useRef(false)
  const confettiFired = useRef(false)

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
          lemonSqueezyId?: string
        }

        if (data.verified) {
          setVerifyState('verified')
          const resolvedTier = data.tier ?? tier ?? undefined
          const transactionId = orderId ?? data.lemonSqueezyId ?? undefined

          // حدث purchase موحّد لكل عملية شراء (شهري + حزمة) — مرة واحدة فقط
          if (resolvedTier && transactionId && !purchaseTracked.current) {
            purchaseTracked.current = true
            trackPurchase(resolvedTier as SubscriptionTierId, transactionId)
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

  // Fire confetti exactly once when payment is verified
  useEffect(() => {
    if (verifyState === 'verified' && !confettiFired.current) {
      confettiFired.current = true
      fireSchoolPrideConfetti()
    }
  }, [verifyState])

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
              {verifyState === 'verified' ? (
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                  <div className="relative rounded-full bg-primary/10 p-4">
                    <PartyPopper className="h-12 w-12 text-primary" aria-hidden />
                  </div>
                </div>
              ) : (
                <CheckCircle2 className="h-14 w-14 text-primary" aria-hidden />
              )}

              <div className="space-y-2">
                <h1 className="text-2xl font-bold">
                  {verifyState === 'verified' ? '🎉 مبروك! الاشتراك مُفعَّل' : 'شكراً لك!'}
                </h1>
                {verifyState === 'verified' ? (
                  <p className="leading-relaxed text-muted-foreground">
                    {isBundle
                      ? 'تم تأكيد شراء الحزمة وإضافة الرصيد إلى حسابك. يمكنك البدء بالتحويل فوراً من المحرر.'
                      : 'تم تأكيد اشتراكك بنجاح. استمتع بجميع مزايا خطتك من لوحة التحكم.'}
                  </p>
                ) : verifyState === 'pending' ? (
                  <p className="leading-relaxed text-muted-foreground">
                    استلمنا طلبك. قد يستغرق تفعيل الرصيد دقيقة واحدة — حدّث الصفحة أو انتقل إلى المحرر.
                  </p>
                ) : (
                  <p className="leading-relaxed text-muted-foreground">
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
