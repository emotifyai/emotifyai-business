import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Badge, Button, Card, CardContent } from '@emotifyai/ui'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import { EDITOR_PATH } from '@/lib/editor/session'

export const metadata: Metadata = {
  title: 'إيموتيفاي vs ChatGPT — أيهما يبيع أكثر؟',
  description:
    'مقارنة موضوعية بين إيموتيفاي وChatGPT لكتابة نصوص المنتجات في السوق الخليجي — التخصص، اللهجة، المنصات، والتكلفة.',
}

type Winner = 'emotify' | 'chatgpt' | 'tie'

interface ComparisonCell {
  tag: string
  text: string
}

interface ComparisonRow {
  label: string
  emotify: ComparisonCell
  chatgpt: ComparisonCell
  winner: Winner
}

const comparisonRows: ComparisonRow[] = [
  {
    label: 'الغرض',
    emotify: {
      tag: 'متخصص',
      text: 'مصمم لكتابة نصوص المنتجات فقط. يفهم الفرق بين عطر وساعة — ويكتب بمنظور إنساني مباشر.',
    },
    chatgpt: {
      tag: 'عام',
      text: 'يفعل كل شيء — لكن لا شيء متخصص. يكتب نصوصاً جيدة — لكن يحتاج شرحاً طويلاً في كل مرة.',
    },
    winner: 'emotify',
  },
  {
    label: 'فهم السوق الخليجي',
    emotify: {
      tag: 'مبني عليه',
      text: 'سيكولوجية الشراء الخليجية مدمجة في البرومبتات — الهيبة، خوف الفوات، العملة الاجتماعية.',
    },
    chatgpt: {
      tag: 'محدود',
      text: 'يفهم العربية لا الثقافة. يكتب عربي سليم — لكن نادراً من «لحظة المجلس» أو «وجه الضيف».',
    },
    winner: 'emotify',
  },
  {
    label: 'سهولة الاستخدام',
    emotify: {
      tag: 'لصق وانتهي',
      text: 'الصق، اختر لغة/منصة، انسخ. لا شرح، لا برومبت، لا تجربة وخطأ — النتيجة جاهزة في ٣ ثوانٍ.',
    },
    chatgpt: {
      tag: 'يحتاج خبرة',
      text: 'تحتاج برومبت جيد في كل مرة. النتيجة تعتمد على مهارتك في الشرح — التاجر المشغول لا يملك هذا الوقت.',
    },
    winner: 'emotify',
  },
  {
    label: 'لغات المخرج',
    emotify: {
      tag: '٣ خيارات',
      text: 'عربي خليجي، عربي فصيح، إنجليزي. تختار اللغة قبل التحويل — الوصف يقبل أي لغة كمدخل.',
    },
    chatgpt: {
      tag: 'أي لغة',
      text: 'يترجم ويكتب بأي لغة في العالم. ميزة حقيقية — لكن تحتاج طلباً صريحاً في كل مرة.',
    },
    winner: 'chatgpt',
  },
  {
    label: 'التخصيص للمنصة',
    emotify: {
      tag: 'تلقائي',
      text: 'طول وأسلوب كل منصة مبني مسبقاً — واتساب، متجرك، إنستغرام، نون، أمازون. لا تشرح في كل مرة.',
    },
    chatgpt: {
      tag: 'يدوي',
      text: 'تحتاج تشرح في البرومبت: «اكتب لواتساب» أو «اكتب لمتجر إلكتروني» — في كل مرة.',
    },
    winner: 'emotify',
  },
  {
    label: 'التكلفة',
    emotify: {
      tag: 'مباشر',
      text: '٤٥ ريال شهرياً — ٣٠٠ تحويل. لا رسوم خفية، كل تحويل يساوي ٠.١٥ ريال.',
    },
    chatgpt: {
      tag: 'مشابه',
      text: '٧٥ ريال ChatGPT Plus شهرياً — لكن لكل الاستخدامات، مش فقط المنتجات.',
    },
    winner: 'emotify',
  },
  {
    label: 'تكامل المتاجر',
    emotify: {
      tag: 'قادم',
      text: 'تكامل سلة وزيد قيد البناء. انسخ مباشرة لمتجرك — بدون تنسيق إضافي.',
    },
    chatgpt: {
      tag: 'غير متاح',
      text: 'لا تكامل مع سلة أو زيد. تنسخ النص يدوياً وتلصقه في المتجر.',
    },
    winner: 'emotify',
  },
]

function ComparisonCellBox({
  cell,
  winner,
  side,
}: {
  cell: ComparisonCell
  winner: Winner
  side: 'emotify' | 'chatgpt'
}) {
  const isWinner = winner === side
  const isEmotify = side === 'emotify'

  return (
    <div
      className={cn(
        'rounded-xl border p-4 sm:p-5',
        isWinner && isEmotify && 'border-primary/30 bg-primary/5',
        isWinner && !isEmotify && 'border-destructive/25 bg-destructive/5',
        !isWinner && 'border-border bg-card'
      )}
    >
      <Badge
        variant={isWinner && isEmotify ? 'default' : 'secondary'}
        className={cn(
          'mb-3',
          isWinner && !isEmotify && 'border-destructive/20 bg-destructive/10 text-destructive'
        )}
      >
        {cell.tag}
      </Badge>
      <p className="text-sm leading-relaxed text-muted-foreground">{cell.text}</p>
    </div>
  )
}

export default async function VsChatGptPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const ctaHref = user ? EDITOR_PATH : '/'

  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden bg-background text-foreground" dir="rtl">
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b bg-gradient-to-b from-background to-muted/20">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,color-mix(in_srgb,var(--primary)_15%,transparent),transparent)]"
            aria-hidden
          />
          <div className="page-container relative py-12 sm:py-16 md:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
                مقارنة موضوعية | مايو ٢٠٢٦
              </Badge>
              <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                إيموتيفاي vs ChatGPT
              </h1>
              <p className="mb-6 text-xl font-semibold text-foreground sm:text-2xl">
                أيهما يبيع أكثر؟
              </p>
              <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                صاحب متجر إلكتروني عنده وقت يشرح لـ ChatGPT كيف يكتب؟ أم يريد أداة تفهم
                السوق الخليجي وتكتب مباشرة؟
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <span className="size-2 rounded-full bg-primary" aria-hidden />
                  إيموتيفاي يتفوق
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="size-2 rounded-full bg-destructive/70" aria-hidden />
                  ChatGPT يتفوق
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="size-2 rounded-full bg-muted-foreground/40" aria-hidden />
                  متساويان
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="page-container py-12 sm:py-16 md:py-20">
          <div className="mx-auto max-w-5xl space-y-10">
            <div className="hidden gap-4 sm:grid sm:grid-cols-2">
              <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-5 text-center">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-lg font-bold text-primary">إيموتيفاي</p>
                  <p className="text-sm text-muted-foreground">emotifyai.com</p>
                  <Badge className="mt-1">الأنسب للخليج</Badge>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 text-center">
                <p className="text-lg font-bold">ChatGPT</p>
                <p className="mt-1 text-sm text-muted-foreground">chat.openai.com</p>
              </div>
            </div>

            <div className="space-y-8">
              {comparisonRows.map((row, index) => (
                <article key={row.label}>
                  <h2 className="mb-4 text-base font-bold sm:text-lg">
                    <span className="text-muted-foreground">{index + 1}.</span> {row.label}
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <ComparisonCellBox cell={row.emotify} winner={row.winner} side="emotify" />
                    <ComparisonCellBox cell={row.chatgpt} winner={row.winner} side="chatgpt" />
                  </div>
                </article>
              ))}
            </div>

            <Card className="border-primary/20 bg-card">
              <CardContent className="py-8 sm:py-10">
                <h2 className="mb-8 text-center text-xl font-bold sm:text-2xl">النتيجة النهائية</h2>
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <p className="text-4xl font-bold text-primary sm:text-5xl">٥/٦</p>
                    <p className="mt-2 text-sm font-medium text-foreground">إيموتيفاي</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-muted-foreground sm:text-5xl">١/٦</p>
                    <p className="mt-2 text-sm font-medium text-muted-foreground">ChatGPT</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="py-8 sm:py-10">
                <h2 className="mb-4 text-xl font-bold">متى تستخدم إيموتيفاي؟</h2>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  إذا كنت تبيع منتجات في الخليج وتريد نصوص تبيع حقاً — إيموتيفاي أسرع
                  وأذكى وأرخص لهذا الغرض تحديداً. ChatGPT أفضل إذا تحتاج أداة متعددة
                  الاستخدامات لأكثر من الكتابة التسويقية.
                </p>
              </CardContent>
            </Card>

            <div className="flex justify-center pt-2">
              <Button size="lg" variant="glow" asChild>
                <Link href={ctaHref}>جرب مجاناً — ٥ تحويلات بدون تسجيل</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
