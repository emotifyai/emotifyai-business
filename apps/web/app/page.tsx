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

        <section className="page-container py-12 sm:py-16 md:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 text-center sm:mb-12">
              <h2 className="mb-3 text-2xl font-bold sm:mb-4 sm:text-3xl">لماذا إيموتيفاي؟</h2>
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
                  : 'ابدأ بـ ١٠ تحويلات مجانية — بدون بطاقة ائتمان.'}
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
