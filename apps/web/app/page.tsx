import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@emotifyai/ui'
import { Card, CardHeader, CardTitle, CardDescription } from '@emotifyai/ui'
import { Sparkles, Zap, Globe, Shield } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LandingHero } from '@/components/landing-hero'
import { MobileShell } from '@emotifyai/ui'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = !!user

  const features = [
    {
      icon: Sparkles,
      title: 'مدعوم بالذكاء الاصطناعي',
      description: 'ذكاء اصطناعي يفهم سياق منتجك ويكتب نصاً يبيع',
    },
    {
      icon: Zap,
      title: 'نتائج فورية',
      description: 'لصق الوصف واختيار اللغة والمنصة — النتيجة في ثوانٍ',
    },
    {
      icon: Globe,
      title: 'لغات متعددة',
      description: 'عربي خليجي، عربي فصيح، وإنجليزي',
    },
    {
      icon: Shield,
      title: 'آمن وموثوق',
      description: 'بياناتك محمية بمعايير أمان عالية',
    },
  ] as const

  return (
    <MobileShell header={<Header />} footer={<Footer />}>
      <main className="flex-1 overflow-x-hidden">
        <LandingHero />

        <section className="page-container py-12">
          <div className="mx-auto max-w-2xl text-center">
            <a href="https://chromewebstore.google.com/detail/emotifyai/gfdhmjalkhficdnaoojpgcmcjfjbmldl" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-semibold hover:opacity-90 transition-opacity shadow-lg">
              أضف إلى كروم — مجاناً
            </a>
            <p className="mt-3 text-sm text-muted-foreground">١٠ تحويلات مجانية. لا يلزم بطاقة ائتمانية.</p>
          </div>
        </section>

        {/* Video Demo Section */}
        <section className="page-container py-12">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 text-3xl font-bold">شاهد إيموتيفاي في العمل</h2>
            <p className="mb-8 text-muted-foreground">شاهد كيف تحول نقرة واحدة النص الممل إلى نص تسويقي جذاب</p>
            <div className="relative aspect-video overflow-hidden rounded-xl shadow-2xl">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/axq8kcw2ZVQ"
                title="EmotifyAI Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        {/* Before & After Section */}
        <section className="page-container py-12 sm:py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">شاهد الفرق</h2>
              <p className="text-muted-foreground">من نص تقني جاف إلى نص عاطفي قوي — فوراً</p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="flex flex-col items-center">
                <span className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">قبل</span>
                <a href="/before.png" target="_blank">
                  <img src="/before.png" alt="Before EmotifyAI" className="w-full cursor-pointer rounded-xl shadow-2xl transition-opacity hover:opacity-90" />
                </a>
              </div>
              <div className="flex flex-col items-center">
                <span className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">بعد</span>
                <a href="/after.png" target="_blank">
                  <img src="/after.png" alt="After EmotifyAI" className="w-full cursor-pointer rounded-xl shadow-2xl transition-opacity hover:opacity-90" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="page-container pb-12 sm:pb-16 md:pb-24">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 text-center sm:mb-12">
              <h2 className="mb-3 text-2xl font-bold sm:mb-4 sm:text-3xl">لماذا EmotifyAI؟</h2>
              <p className="text-sm text-muted-foreground sm:text-base">
                ميزات قوية لتحسين نصوص منتجاتك في السوق الخليجي
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
              {features.map(({ icon: Icon, title, description }) => (
                <Card key={title}>
                  <CardHeader>
                    <Icon className="mb-2 h-8 w-8 text-primary" aria-hidden />
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="page-container pb-12 sm:pb-16 md:pb-24">
          <Card variant="glass" className="mx-auto max-w-3xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl sm:text-3xl">
                {isAuthenticated
                  ? 'تابع رحلة تحسين نصوصك'
                  : 'جاهز لتحسين أوصاف منتجاتك؟'}
              </CardTitle>
              <CardDescription className="text-base">
                {isAuthenticated
                  ? 'ادخل لوحة التحكم لإدارة اشتراكك ومراجعة الاستخدام.'
                  : 'ابدأ بـ ٥ تحويلات مجانية — ثم ٥ إضافية بعد التسجيل. بدون بطاقة.'}
              </CardDescription>
              <Button size="lg" variant="glow" className="mt-4 w-full sm:mx-auto sm:w-auto" asChild>
                <Link href={isAuthenticated ? '/dashboard' : '/signup'}>
                  {isAuthenticated ? 'لوحة التحكم' : 'ابدأ مجاناً'}
                </Link>
              </Button>
            </CardHeader>
          </Card>
        </section>
      </main>
    </MobileShell>
  )
}
