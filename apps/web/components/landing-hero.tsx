'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowDown, Sparkles } from 'lucide-react'
import { Button, EnhanceTextInput, TextDemoCarousel, type TextDemoPair } from '@emotifyai/ui'
import { useUser } from '@/lib/hooks/use-auth'
import {
  LANDING_PRESET_CHIPS,
  type EditorEnhanceConfig,
} from '@/lib/editor/constants'
import {
  EDITOR_PATH,
  buildSignupRedirectUrl,
  saveEditorSession,
} from '@/lib/editor/session'
import { trackUpgradeClicked } from '@/lib/analytics/ga'
import {
  consumeGuestCredit,
  isGuestCreditsExhausted,
  getGuestToken,
} from '@/lib/upgrade-prompt/guest-credits'
import { CopyButton } from '@/components/ui/copy-button'
import { useFirstEnhanceConfetti } from '@/lib/confetti'

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

const DEFAULT_CONFIG: EditorEnhanceConfig = {
  tone: 'marketing',
  outputLanguage: 'ar_gulf',
  platform: 'store',
}

export function LandingHero() {
  const router = useRouter()
  const { data: user, isLoading } = useUser()
  const isAuthenticated = !!user

  const [text, setText] = React.useState('')
  const [config, setConfig] = React.useState<EditorEnhanceConfig>(DEFAULT_CONFIG)
  const [activeChipId, setActiveChipId] = React.useState<string | null>(null)
  const [isEnhancing, setIsEnhancing] = React.useState(false)
  const [enhancedResult, setEnhancedResult] = React.useState<string | null>(null)
  const [showSadAnimation, setShowSadAnimation] = React.useState(false)

  const { markFirstEnhance } = useFirstEnhanceConfetti(null) // null = guest scope

  const handleGuestEnhance = async () => {
    if (isGuestCreditsExhausted()) {
      setShowSadAnimation(true)
      return
    }

    setIsEnhancing(true)
    setEnhancedResult(null)

    try {
      const res = await fetch('/api/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          isGuest: true,
          guestToken: getGuestToken(),
          ...config,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        if (res.status === 429) {
          setShowSadAnimation(true)
        } else {
          console.error('Enhance error:', data)
        }
        return
      }

      consumeGuestCredit()
      markFirstEnhance()
      setEnhancedResult(data.data.enhancedText)
      setText('')
    } catch (err) {
      console.error(err)
    } finally {
      setIsEnhancing(false)
    }
  }

  const continueToEditor = () => {
    saveEditorSession({
      originalText: text.trim(),
      enhancedText: enhancedResult || '',
      ...config,
    })
    router.push(EDITOR_PATH)
  }

  const handleAction = () => {
    if (isAuthenticated) {
      continueToEditor()
    } else {
      handleGuestEnhance()
    }
  }

  const applyPreset = (chipId: string, preset: EditorEnhanceConfig) => {
    setActiveChipId(chipId)
    setConfig(preset)
  }

  const settingsHintHref = isAuthenticated ? EDITOR_PATH : buildSignupRedirectUrl()

  return (
    <section className="page-container py-10 sm:py-16 md:py-24">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <h1
          className="mb-6 text-3xl font-bold leading-tight tracking-tight [font-family:var(--font-display)] sm:mb-8 sm:text-4xl md:text-5xl"
          dir="rtl"
        >
          {isAuthenticated ? (
            <>
              <span className="block text-foreground">
                {user?.display_name ? `مرحباً ${user.display_name}،` : 'مرحباً بعودتك،'}
              </span>
              <span className="block text-gradient-brand">واصل تحويل نصوصك التقنية</span>
              <span className="block text-primary">إلى نسخ تبيع</span>
            </>
          ) : (
            <>
              <span className="block text-foreground">حوّل النص التقني الجاف إلى</span>
              <span className="block text-gradient-brand">نصاً عاطفياً مقنعاً</span>
              <span className="block text-primary">يبيع</span>
            </>
          )}
        </h1>

        <div className="mb-4 w-full max-w-2xl relative min-h-[80px] flex flex-col justify-center">
          {showSadAnimation ? (
             <div className="animate-in fade-in zoom-in-95 duration-500 rounded-3xl border-2 border-destructive/30 bg-gradient-to-b from-destructive/10 to-transparent p-6 shadow-2xl backdrop-blur-md">
                <div className="mb-3 flex justify-center">
                   <div className="rounded-full bg-destructive/20 p-3 animate-bounce">
                     <span className="text-3xl">😢</span>
                   </div>
                </div>
                <h3 className="text-destructive font-bold text-xl mb-2">انتهت محاولاتك المجانية!</h3>
                <p className="text-muted-foreground mb-6 text-sm sm:text-base">
                  لقد استنفدت المحاولات المتاحة للضيوف. أنشئ حسابك الآن لفتح المحرر ومواصلة تحويل نصوصك إلى نسخ تبيع!
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => router.push(buildSignupRedirectUrl())} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30">
                      إنشاء حساب مجاني
                  </Button>
                </div>
             </div>
          ) : enhancedResult ? (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/5 via-card/80 to-background p-6 shadow-2xl backdrop-blur-md text-right relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2.5s_infinite_ease-in-out]" />
               <div className="flex items-center justify-between mb-3">
                 <div className="flex items-center gap-2 text-primary/80">
                   <Sparkles className="size-4" />
                   <span className="text-sm font-medium">النتيجة السحرية</span>
                 </div>
                 <CopyButton text={enhancedResult} track className="-mt-1 -me-2" />
               </div>
               <p className="text-lg leading-relaxed text-foreground">{enhancedResult}</p>
               <div className="mt-5 flex justify-end gap-3">
                 <Button onClick={() => setEnhancedResult(null)} variant="outline" size="sm" className="rounded-full">
                    تحويل نص جديد
                 </Button>
                 <Button onClick={continueToEditor} variant="glow" size="sm" className="rounded-full">
                    متابعة في المحرر
                 </Button>
               </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (text.trim()) handleAction()
              }}
              className="w-full"
            >
              <div className="rounded-full border border-border/60 bg-card/80 p-2 shadow-xl shadow-black/20 backdrop-blur-sm sm:p-3 relative overflow-hidden transition-all duration-500 hover:shadow-primary/10">
                {isEnhancing && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10 animate-pulse pointer-events-none" />
                )}
                <div className={`flex items-end gap-2 rounded-full bg-background/60 px-3 py-2 sm:items-center sm:px-4 sm:py-3 transition-opacity duration-500 ${isEnhancing ? 'opacity-60' : 'opacity-100'}`}>
                  <EnhanceTextInput
                    variant="hero"
                    value={text}
                    onChange={setText}
                    showCharCount={false}
                    placeholder="اكتب أو الصق نص المنتج أو الرسالة…"
                    onSubmit={handleAction}
                    aria-label="نص للتحسين"
                    rows={1}
                    className="min-w-0 flex-1 bg-transparent"
                    disabled={isEnhancing}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    variant="glow"
                    className={`size-10 shrink-0 rounded-full sm:size-11 transition-all duration-500 ${isEnhancing ? 'bg-primary/90 scale-95 shadow-[0_0_15px_rgba(var(--primary),0.6)]' : ''}`}
                    disabled={!text.trim() || isEnhancing}
                    aria-label="ابدأ التحسين"
                  >
                    {isEnhancing ? (
                       <Sparkles className="size-5 animate-[spin_3s_linear_infinite]" />
                    ) : (
                       <Sparkles className="size-5" />
                    )}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>

        <div className="mb-6 flex w-full max-w-2xl flex-wrap items-center justify-center gap-2 sm:gap-3" dir="rtl">
          {LANDING_PRESET_CHIPS.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => applyPreset(chip.id, chip.config)}
              className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
                activeChipId === chip.id
                  ? 'border-primary/60 bg-primary/10 text-foreground'
                  : 'border-border/50 bg-card/60 text-muted-foreground hover:border-primary/40 hover:text-foreground'
              }`}
            >
              <Sparkles className="size-4 shrink-0 text-primary" aria-hidden />
              <span>{chip.label}</span>
            </button>
          ))}
        </div>

        <div className="mb-10 flex w-full max-w-2xl flex-col items-center gap-1 text-sm text-muted-foreground" dir="rtl">
          <p>لضبط لغة المخرج والنبرة والمنصة بالتفصيل</p>
          <ArrowDown className="size-4 text-primary" aria-hidden />
          <p>
            <Link href={settingsHintHref} className="font-medium text-primary hover:underline">
              {isAuthenticated ? 'افتح المحرر' : 'سجّل مجاناً وافتح المحرر'}
            </Link>
          </p>
        </div>

        <div className="mb-10 w-full max-w-3xl">
          <TextDemoCarousel pairs={DEMO_PAIRS} />
        </div>

        {!isLoading && (
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Button
              size="lg"
              variant="glow"
              className="w-full sm:w-auto"
              disabled={!text.trim()}
              onClick={continueToEditor}
            >
              {isAuthenticated ? 'متابعة إلى المحرر' : 'ابدأ مجاناً — ٥ تحويلات'}
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
              <Link href="/pricing" onClick={() => trackUpgradeClicked('landing_hero_pricing')}>
                عرض الأسعار
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
