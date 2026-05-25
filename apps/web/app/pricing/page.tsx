import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { PricingPlansTable } from '@/components/pricing/pricing-plans-table'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
    title: 'الأسعار - EmotifyAI',
    description: 'خطط وأسعار EmotifyAI بالريال السعودي',
}

interface PricingPageProps {
    searchParams: Promise<{ from?: string }>
}

export default async function PricingPage({ searchParams }: PricingPageProps) {
    const params = await searchParams
    const fromNewUser = params.from === 'new_user'

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
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
                pro_monthly: 5,
                pro_annual: 6,
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

    return (
        <div className="flex min-h-dvh flex-col overflow-x-hidden">
            <Header />
            <main className="flex-1">
                <section className="page-container py-12 sm:py-16 md:py-20">
                    <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-12">
                        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                            الأسعار
                        </h1>
                        <p className="text-base text-muted-foreground sm:text-lg">
                            خطط مرنة للتحويلات — ابدأ مجاناً أو اشترك في Pro للحصول على 300 تحويل شهرياً.
                        </p>

                        {fromNewUser && (
                            <div className="mt-6 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground">
                                مرحباً! يمكنك البدء بالتجربة المجانية أو اختيار خطة Pro.
                            </div>
                        )}

                        {currentTier && (
                            <div className="mt-6 rounded-xl border border-border/60 bg-card px-4 py-3 text-sm text-muted-foreground">
                                خطتك الحالية:{' '}
                                <span className="font-medium text-foreground">
                                    {currentTier.replace(/_/g, ' ')}
                                </span>
                            </div>
                        )}
                    </div>

                    <PricingPlansTable
                        fromNewUser={fromNewUser}
                        isAuthenticated={isAuthenticated}
                        currentTier={currentTier}
                    />

                    <div className="mx-auto mt-12 max-w-3xl space-y-4 text-sm text-muted-foreground">
                        <p>
                            <strong className="text-foreground">ما المقصود بالتحويل؟</strong>{' '}
                            كل عملية تحسين للنص تستهلك تحويلة واحدة. تتجدد حصة Pro شهرياً؛ الحزم لا تنتهي بتاريخ.
                        </p>
                        <p>
                            <strong className="text-foreground">الدفع:</strong>{' '}
                            الأسعار معروضة بالريال السعودي. قد تُحصّل Lemon Squeezy بالدولار حسب إعداد المتجر — راجع{' '}
                            <code className="text-xs">docs/lemon-squeezy-pricing.md</code>.
                        </p>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}
