import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { PricingPlansTable } from '@/components/pricing/pricing-plans-table'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'الأسعار - إيموتيفاي',
  description: 'خطط وأسعار إيموتيفاي بالريال السعودي',
}

interface PricingPageProps {
  searchParams: Promise<{ from?: string }>
}

const TIER_LABELS_AR: Record<string, string> = {
  free: 'مجاني',
  trial: 'تجربة مسجلة',
  pro_monthly: 'Pro شهري',
  pro_annual: 'Pro سنوي',
  small_bundle: 'حزمة صغيرة',
  large_bundle: 'حزمة كبيرة',
  lifetime_launch: 'مدى الحياة',
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
      const tierPriority: Record<string, number> = {
        free: 1,
        trial: 2,
        small_bundle: 3,
        large_bundle: 4,
        pro_monthly: 5,
        pro_annual: 6,
        basic_monthly: 5,
        basic_annual: 6,
        business_monthly: 7,
        business_annual: 8,
        lifetime_launch: 10,
      }

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
    ? TIER_LABELS_AR[currentTier] ?? currentTier.replace(/_/g, ' ')
    : null

  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden bg-[#0f121d]">
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(54,173,142,0.15),transparent)]"
            aria-hidden
          />
          <div className="page-container relative py-12 sm:py-16 md:py-20">
            <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-14">
              <p className="mb-3 text-sm font-medium text-[#36ad8e]">خطط مرنة</p>
              <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                أسعار واضحة لكل احتياج
              </h1>
              <p className="text-base text-[#7e8596] sm:text-lg">
                ابدأ مجاناً، ثم انتقل إلى Pro أو أضف حزم تحويلات عند الحاجة — بدون تعقيد.
              </p>

              {fromNewUser && (
                <div className="mt-6 rounded-xl border border-[#36ad8e]/30 bg-[#36ad8e]/10 px-4 py-3 text-sm text-foreground">
                  مرحباً! يمكنك البدء بالتجربة المجانية أو اختيار خطة Pro.
                </div>
              )}

              {currentTierLabel && (
                <div className="mt-6 inline-flex rounded-xl border border-white/10 bg-[#1a1e2b] px-4 py-3 text-sm text-[#7e8596]">
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

            <div className="mx-auto mt-14 max-w-2xl text-center text-sm text-[#7e8596]">
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
