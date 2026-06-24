import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@emotifyai/ui'
import { Card, CardHeader, CardTitle, CardDescription } from '@emotifyai/ui'
import { Sparkles, Zap, Globe, Shield, Layers, Heart, Users, MessageSquareQuote, Store, MessageCircle, Camera, Video, ThumbsUp, Ghost } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LandingHero } from '@/components/landing-hero'
import { MobileShell } from '@emotifyai/ui'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = !!user
const platforms = [

{ icon: Store, name: 'متجر' },

{ icon: MessageCircle, name: 'واتساب' },

{ icon: Camera, name: 'إنستغرام' },

{ icon: Video, name: 'تيك توك' },

{ icon: ThumbsUp, name: 'فيسبوك' },

{ icon: Ghost, name: 'سناب شات' },

] as const
  const features = [
    {
  icon: Layers,
  title: 'محرّك مبني، لا مجرّد ذكاء اصطناعي',
  description: 'نظام طبقات صُقل عبر أشهر على منتجات خليجية حقيقية، ولا يزال يتطوّر — محرّك بُني ليكتب كما يكتب أمهر كاتب يعرف عميلك',
},
{
  icon: Heart,
  title: 'نكتب حيث يُتّخذ القرار',
  description: 'قرار الشراء عاطفي قبل أن يكون منطقياً — مبدأ أثبتته أبحاث علم الأعصاب. لا نصف منتجك، بل نخاطب لحظة القرار',
},
{
  icon: Users,
  title: 'أربع نفسيات خليجية، لا قالب واحد',
  description: 'لكل عميل دافع مختلف — الفخر، الطمأنينة، التميّز، الانتماء. نخاطب ما يحرّك عميلك، لا نصاً عاماً يصلح للكل ولا يقنع أحداً',
},
{
  icon: MessageSquareQuote,
  title: 'الكلمة أقوى سلاح للبيع',
  description: 'منذ فجر الحضارات، الكلمة تُقنع وتُحرّك — قبل الصورة وقبل الفيديو. كل كلمة في مخرجاتنا مختارة لتخاطب قرار الشراء',
},
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
<section className="page-container py-8 sm:py-12">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="mb-3 text-2xl font-bold sm:text-3xl">نص على مقاس كل منصة</h2>
        <p className="mb-8 text-sm text-muted-foreground sm:text-base">
          لكل منصة نبرتها وأسلوبها — ونحن نكتبها كلها بلهجة عميلك الخليجي
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {platforms.map(({ icon: Icon, name }) => (
            <div
              key={name}
              className="flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-card/60 p-4 transition-colors hover:border-primary/40"
            >
              <Icon className="size-7 text-primary" aria-hidden />
              <span className="text-sm font-medium text-foreground">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
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
