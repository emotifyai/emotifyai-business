import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { PricingPlansTable } from '@/components/pricing/pricing-plans-table'
import { getTierLabelAr, getTierPriorityMap } from '@emotifyai/config/pricing'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'الأسعار - إيموتيفاي',
  description: 'خطط وأسعار إيموتيفاي بالريال السعودي',
}

interface PricingPageProps {
  searchParams: Promise<{ from?: string }>
}

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const params = await searchParams
  const fromNewUser = params.from === 'new_user'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isAuthenticated = !!user

  let currentTier: string | null = null

  if (user) {
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('tier, status, created_at')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (subscriptions?.length) {
      const tierPriority = getTierPriorityMap()

      type SubRow = { tier: string; status: string; created_at: string }
      const rows = subscriptions as SubRow[]
      const best = rows.reduce((a, b) => {
        const aP = tierPriority[a.tier] ?? 0
        const bP = tierPriority[b.tier] ?? 0
        return bP > aP ? b : a
      })
      currentTier = best.tier
    }
  }

  const currentTierLabel = currentTier
    ? getTierLabelAr(currentTier)
    : null

  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b bg-gradient-to-b from-background to-muted/20">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,color-mix(in_srgb,var(--primary)_15%,transparent),transparent)]"
            aria-hidden
          />
          <div className="page-container relative py-12 sm:py-16 md:py-20">
            <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-14">
              <p className="mb-3 text-sm font-medium text-primary">خطط مرنة</p>
              <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                أسعار واضحة لكل احتياج
              </h1>
              <p className="text-base text-muted-foreground sm:text-lg">
                ابدأ مجاناً، ثم انتقل إلى Pro أو أضف حزم تحويلات عند الحاجة — بدون تعقيد.
              </p>

              {fromNewUser && (
                <div className="mt-6 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground">
                  مرحباً! لديك ٥ تحويلات مجانية بعد التسجيل — أو اختر خطة Pro.
                </div>
              )}

              {currentTierLabel && (
                <div className="mt-6 inline-flex rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                  خطتك الحالية:{' '}
                  <span className="me-1 font-medium text-foreground">
                    {currentTierLabel}
                  </span>
                </div>
              )}
            </div>

            <PricingPlansTable
              fromNewUser={fromNewUser}
              isAuthenticated={isAuthenticated}
              currentTier={currentTier}
            />

            <div className="mx-auto mt-14 max-w-2xl text-center text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">ما المقصود بالتحويل؟</strong>{' '}
                كل عملية تحسين للنص تستهلك تحويلة واحدة. تتجدد حصة Pro شهرياً؛ الحزم لا
                تنتهي بتاريخ.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
