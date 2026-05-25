'use client'

import Link from 'next/link'
import { Plus, Mic, Sparkles, Pencil, Globe } from 'lucide-react'
import { Button, TextDemoCarousel, type TextDemoPair } from '@emotifyai/ui'
import { useUser } from '@/lib/hooks/use-auth'

const DEMO_PAIRS: TextDemoPair[] = [
  {
    lang: 'ar',
    input: 'عطر رجالي EDP، ثبات يوصل 8 ساعات، نوتات عود وعنبر وفانيلا، 100 مل',
    output:
      'قبل ما تطلع الباب — تمرّه على رقبتك شوي وتتأكد. العود يبان في المجلس قبل ما تتكلم، والعنبر يثبت معك لين آخر لقاء. مو عطر يخلص مع أول ساعة — ثمان ساعات تدري إنك لسا حاضر. 100 مل.',
  },
  {
    lang: 'ar',
    input: 'ساعة رجالية أوتوماتيك، ستيل، مقاومة ماء 50م، زجاج سافير',
    output:
      'في الاجتماع ترفع سواعيك تطلع الملاحظات — أحد يسألك من وين الساعة. الحركة الأوتوماتيك تمشي معك بدون صوت، والسافير ما يخدش مع الاستخدام اليومي. خمسين متر مقاومة ماء — يعني مو كل رشة تقلقك. بعد ما ترتديها، الساعات اللي في الخزانة شوي تبان ناقصة.',
  },
  {
    lang: 'ar',
    input: 'عباءة نسائية، قطن مصري 100%، تفصيل مخفي، مقاسات 52–60',
    output:
      'قدام المرآة تعدّل الكتف وتبتسم — القطن يتشكّل معك مو ضدّك. صديقتك أول ما تشوفها تسأل من وين. تفصيل مخفي يخلي الخياطة ما تبان برّا، ومقاسات من 52 إلى 60. لما تلبسينها مو نفس العبايات اللي عندك في الخزانة.',
  },
  {
    lang: 'en',
    input: "Men's EDP, oud and amber base, 8-hour wear, 100ml bottle",
    output:
      'You catch your reflection before you leave — one pass at your neck and you are set. The oud shows up in the room before you do; amber stays through the last handshake. Not a scent that fades by lunch — eight hours on skin. 100ml.',
  },
  {
    lang: 'en',
    input: 'Wireless earbuds, active noise canceling, 30 hours with charging case',
    output:
      'You put them in on the flight — and hear the track the way it was meant the first time. The cabin hum drops without you toggling anything; the case still has charge when you land. Thirty hours total before you think about a cable again.',
  },
  {
    lang: 'fr',
    input: 'Parfum homme EDP, notes oud et ambre, tenue 8 heures, flacon 100 ml',
    output:
      'Avant de fermer la porte — un passage sur le cou et c’est réglé. L’oud se fait remarquer dans la pièce avant que vous parliez ; l’ambre reste jusqu’à la dernière poignée de main. Pas un parfum qui s’éteint à midi — huit heures sur la peau. 100 ml.',
  },
]

const QUICK_ACTIONS = [
  { icon: Sparkles, label: 'إنشاء صورة' },
  { icon: Pencil, label: 'كتابة أو تعديل' },
  { icon: Globe, label: 'بحث عن شيء' },
] as const

export function LandingHero() {
  const { data: user, isLoading } = useUser()
  const isAuthenticated = !!user

  const greeting = isAuthenticated
    ? user?.display_name
      ? `مرحباً ${user.display_name}، `
      : 'مرحباً بعودتك، '
    : ''

  return (
    <section className="page-container py-10 sm:py-16 md:py-24">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <h1 className="mb-6 text-3xl font-bold leading-tight tracking-tight sm:mb-8 sm:text-4xl md:text-5xl">
          {greeting}
          ما الذي يدور في ذهنك اليوم؟
        </h1>

        <div className="mb-8 w-full max-w-2xl rounded-full border border-border/60 bg-card/80 p-2 shadow-xl shadow-black/20 backdrop-blur-sm sm:p-3">
          <div className="flex items-center gap-2 rounded-full bg-background/60 px-3 py-2 sm:px-4 sm:py-3">
            <button
              type="button"
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="إضافة"
            >
              <Plus className="size-5" />
            </button>
            <span className="min-w-0 flex-1 text-start text-base text-muted-foreground sm:text-lg">
              اسأل أي شيء…
            </span>
            <button
              type="button"
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="إدخال صوتي"
            >
              <Mic className="size-5" />
            </button>
            <Button
              size="icon"
              variant="glow"
              className="size-10 shrink-0 rounded-full sm:size-11"
              asChild
            >
              <Link
                href={isAuthenticated ? '/dashboard/editor' : '/signup'}
                aria-label="ابدأ التحسين"
              >
                <Sparkles className="size-5" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="mb-10 flex w-full max-w-2xl flex-wrap items-center justify-center gap-2 sm:gap-3">
          {QUICK_ACTIONS.map(({ icon: Icon, label }) => (
            <button
              key={label}
              type="button"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border/50 bg-card/60 px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <Icon className="size-4 shrink-0 text-primary" aria-hidden />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="mb-10 w-full max-w-3xl">
          <TextDemoCarousel pairs={DEMO_PAIRS} />
        </div>

        {!isLoading && (
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Button size="lg" variant="glow" className="w-full sm:w-auto" asChild>
              <Link href={isAuthenticated ? '/dashboard' : '/signup'}>
                {isAuthenticated ? 'لوحة التحكم' : 'ابدأ مجاناً — ١٠ تحويلات'}
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
              <Link href="/pricing">عرض الأسعار</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
