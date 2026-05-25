'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@emotifyai/ui'
import { Card, CardContent } from '@emotifyai/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@emotifyai/ui'
import { Textarea } from '@emotifyai/ui'
import { Badge } from '@emotifyai/ui'
import { Loader2, Wand2, RotateCcw, History, Copy, Check, ChevronDown } from 'lucide-react'
import { useSubscription } from '@/lib/hooks/use-subscription'
import { useUsageStats } from '@/lib/hooks/use-usage'
import { SubscriptionTier } from '@/types/database'
import { toast } from 'sonner'
import {
  ConnectedUpgradePrompt,
  resolveUpgradeVariant,
} from '@/components/upgrade-prompt'
import { detectInputLanguage } from '@/lib/ai/language-detection'

interface HistoryItem {
  id: string
  originalText: string
  enhancedText: string
  tone: string
  outputLanguage: string
  platform?: string
  createdAt: string
}

const OUTPUT_LANGUAGES = [
  { value: 'ar_gulf', label: 'عربي خليجي' },
  { value: 'ar_msa', label: 'عربي فصيح' },
  { value: 'en', label: 'إنجليزي' },
] as const

const TONE_OPTIONS = [
  { value: 'emotional', label: 'عاطفي' },
  { value: 'marketing', label: 'تسويقي' },
  { value: 'exclusive', label: 'حصري' },
] as const

const PLATFORM_OPTIONS = [
  { value: 'store', label: 'متجر' },
  { value: 'whatsapp', label: 'واتساب' },
  { value: 'instagram', label: 'إنستغرام' },
  { value: 'facebook', label: 'فيسبوك' },
  { value: 'snap', label: 'سناب' },
  { value: 'tiktok', label: 'تيك توك' },
] as const

const LOADING_MESSAGES = [
  'جاري تحليل النص…',
  'جاري صياغة الكلمات المناسبة…',
  'جاري تحسين الوضوح والسلاسة…',
  'جاري صقل الرسالة…',
  'جاري إضافة لمسة احترافية…',
  'جاري ضبط النبرة…',
  'جاري اللمسة النهائية…',
  'اقتربنا من الانتهاء…',
  'جاري تطبيق الذكاء الاصطناعي…',
  'جاري إتقان كل جملة…',
]

export default function EditorPage() {
  const searchParams = useSearchParams()
  const { data: subscription } = useSubscription()
  const { data: usage } = useUsageStats()

  const totalCredits = usage ? usage.credits_used + usage.credits_remaining : 0
  const isUnlimited = usage?.credits_remaining === -1

  // Editor state
  const [originalText, setOriginalText] = useState('')
  const [enhancedText, setEnhancedText] = useState('')
  const [tone, setTone] = useState<string>('marketing')
  const [outputLanguage, setOutputLanguage] = useState<string>('ar_gulf')
  const [platform, setPlatform] = useState<string>('store')
  const [isGenerating, setIsGenerating] = useState(false)
  const [detectedInputLabel, setDetectedInputLabel] = useState<string>('')
  const [detectionConfidence, setDetectionConfidence] = useState<number | null>(null)
  const [loadingMessage, setLoadingMessage] = useState('')

  // History state
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})
  const [upgradeVariant, setUpgradeVariant] = useState<
    import('@emotifyai/ui').UpgradePromptVariant | undefined
  >(undefined)

  // Load cached session data on mount
  useEffect(() => {
    const cached = sessionStorage.getItem('editor_session')
    if (cached) {
      try {
        const data = JSON.parse(cached)
        if (data.originalText) setOriginalText(data.originalText)
        if (data.enhancedText) setEnhancedText(data.enhancedText)
        if (data.tone) setTone(data.tone)
        if (data.outputLanguage) setOutputLanguage(data.outputLanguage)
        if (data.platform) setPlatform(data.platform)
      } catch (e) {
        console.error('Failed to parse cached session:', e)
      }
    }
  }, [])

  // Save to session cache when editor state changes
  useEffect(() => {
    const data = { originalText, enhancedText, tone, outputLanguage, platform }
    sessionStorage.setItem('editor_session', JSON.stringify(data))
  }, [originalText, enhancedText, tone, outputLanguage, platform])

  useEffect(() => {
    const textParam = searchParams.get('text')
    if (textParam) {
      setOriginalText(decodeURIComponent(textParam))
    }
  }, [searchParams])

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/user/history')
      if (response.ok) {
        const data = await response.json()
        setHistory(data.history || [])
      }
    } catch (error) {
      console.error('Failed to load history:', error)
    }
  }

  useEffect(() => {
    if (!originalText.trim()) {
      setDetectedInputLabel('')
      setDetectionConfidence(null)
      return
    }
    const detection = detectInputLanguage(originalText)
    setDetectedInputLabel(detection.inputSummaryAr)
    setDetectionConfidence(detection.confidence)
  }, [originalText])

  const canGenerate = () => {
    if (!subscription) return false
    if (subscription.tier === SubscriptionTier.LIFETIME_LAUNCH) return true
    if (!usage) return false
    return isUnlimited || usage.credits_remaining > 0
  }

  const handleGenerate = async () => {
    if (!originalText.trim()) {
      toast.error('يرجى إدخال نص للتحسين')
      return
    }
    if (!canGenerate()) {
      setUpgradeVariant(
        resolveUpgradeVariant({
          isAuthenticated: true,
          tier: subscription?.tier,
          creditsRemaining: usage?.credits_remaining ?? 0,
          creditsLimit: totalCredits || subscription?.credits_limit,
        }) ?? 'limit_reached'
      )
      return
    }

    setIsGenerating(true)
    setLoadingMessage(LOADING_MESSAGES[0])
    
    // Cycle through loading messages
    const messageInterval = setInterval(() => {
      setLoadingMessage(prev => {
        const currentIndex = LOADING_MESSAGES.indexOf(prev)
        const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length
        return LOADING_MESSAGES[nextIndex]
      })
    }, 1500)

    try {
      const response = await fetch('/api/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: originalText,
          tone,
          outputLanguage,
          platform,
          isEditorSession: true,
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setEnhancedText(data.data.enhancedText)
        toast.success('تم تحسين النص بنجاح!', {
          description: `تم استخدام ${data.data.tokensUsed || 0} رمزاً`
        })
        const newHistoryItem: HistoryItem = {
          id: Date.now().toString(),
          originalText,
          enhancedText: data.data.enhancedText,
          tone,
          outputLanguage,
          platform,
          createdAt: new Date().toISOString(),
        }
        setHistory(prev => [newHistoryItem, ...prev])
      } else {
        // Handle specific error codes
        const errorCode = data.error?.code
        const errorMessage = data.error?.message || 'Enhancement failed'
        
        switch (errorCode) {
          case 'USAGE_LIMIT_EXCEEDED':
            setUpgradeVariant(
              resolveUpgradeVariant({
                isAuthenticated: true,
                tier: data.error?.tier ?? subscription?.tier,
                creditsRemaining: 0,
                creditsLimit: totalCredits || subscription?.credits_limit,
              }) ?? 'limit_reached'
            )
            break
          case 'UNAUTHORIZED':
            toast.error('انتهت الجلسة', {
              description: 'يرجى تسجيل الدخول مرة أخرى للمتابعة',
              action: {
                label: 'تسجيل الدخول',
                onClick: () => window.location.href = '/login'
              }
            })
            break
          case 'QUALITY_CHECK_FAILED':
            toast.error('فشل فحص الجودة', {
              description: 'لم يلبِ مخرجات الذكاء الاصطناعي معايير الجودة. حاول مرة أخرى.'
            })
            break
          case 'UNSUPPORTED_LANGUAGE':
            toast.error('لغة المخرج غير مدعومة', {
              description: 'اختر عربي خليجي أو فصيح أو إنجليزي',
            })
            break
          case 'RATE_LIMIT_EXCEEDED':
            toast.error('طلبات كثيرة جداً', {
              description: 'انتظر لحظة قبل المحاولة مرة أخرى'
            })
            break
          default:
            toast.error('فشل التحسين', {
              description: errorMessage
            })
        }
      }
    } catch (error) {
      toast.error('خطأ في الاتصال', {
        description: 'تحقق من اتصالك بالإنترنت وحاول مرة أخرى'
      })
    } finally {
      clearInterval(messageInterval)
      setIsGenerating(false)
      setLoadingMessage('')
    }
  }

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates(prev => ({ ...prev, [key]: true }))
      toast.success('تم النسخ!')
      setTimeout(() => setCopiedStates(prev => ({ ...prev, [key]: false })), 2000)
    } catch (error) {
      toast.error('فشل النسخ')
    }
  }

  const loadHistoryItem = (item: HistoryItem) => {
    // Handle both local history format and API format
    setOriginalText(item.originalText || (item as any).input_text || '')
    setEnhancedText(item.enhancedText || (item as any).output_text || '')
    setTone(item.tone || 'marketing')
    setOutputLanguage(item.outputLanguage || (item as any).output_language || 'ar_gulf')
    setPlatform(item.platform || (item as any).platform || 'store')
    setShowHistory(false)
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl overflow-x-hidden">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold sm:text-2xl">محرر النصوص</h1>
          <p className="text-sm text-muted-foreground">حسّن نصوصك بالذكاء الاصطناعي</p>
        </div>
        {usage && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {usage.credits_used} / {isUnlimited ? '∞' : totalCredits} مستخدم
            </span>
          </div>
        )}
      </div>

      <Card className="mb-4 border-2 border-gray-300 dark:border-border shadow-sm bg-gray-50/50 dark:bg-card">
        <CardContent className="pt-4">
          <p className="mb-3 text-xs text-muted-foreground">
            المدخل: أي لغة — يُحوَّل تلقائياً إلى لغة المخرج المختارة
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex w-full flex-col gap-1.5 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
              <span className="text-sm font-medium text-muted-foreground">لغة المخرج:</span>
              <Select value={outputLanguage} onValueChange={setOutputLanguage}>
                <SelectTrigger className="h-11 w-full border-2 border-gray-300 bg-white dark:border-border dark:bg-background sm:h-9 sm:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OUTPUT_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex w-full flex-col gap-1.5 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
              <span className="text-sm font-medium text-muted-foreground">النبرة:</span>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="h-11 w-full border-2 border-gray-300 bg-white dark:border-border dark:bg-background sm:h-9 sm:w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex w-full flex-col gap-1.5 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
              <span className="text-sm font-medium text-muted-foreground">المنصة:</span>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="h-11 w-full border-2 border-gray-300 bg-white dark:border-border dark:bg-background sm:h-9 sm:w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORM_OPTIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {detectedInputLabel && (
              <Badge variant="secondary" className="text-xs">
                مدخل: {detectedInputLabel}
                {detectionConfidence != null &&
                  ` — ثقة ${Math.round(detectionConfidence * 100)}٪`}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dual Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Original Text */}
        <Card className="border-2 border-gray-300 dark:border-border shadow-sm bg-white dark:bg-card">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">النص الأصلي</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{originalText.length} حرف</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleCopy(originalText, 'original')}
                  disabled={!originalText}
                >
                  {copiedStates.original ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>
            <Textarea
              placeholder="اكتب أو الصق النص، أو استخدم إضافة المتصفح لتحديد النص…"
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              className="min-h-[280px] resize-none text-sm border-2 border-gray-300 dark:border-border bg-gray-50/30 dark:bg-background focus:bg-white dark:focus:bg-background"
            />
          </CardContent>
        </Card>

        {/* Enhanced Text */}
        <Card className="border-2 border-gray-300 dark:border-border shadow-sm relative bg-white dark:bg-card">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">النص المحسّن</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{enhancedText.length} حرف</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleCopy(enhancedText, 'enhanced')}
                  disabled={!enhancedText}
                >
                  {copiedStates.enhanced ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>
            <div className="relative">
              <Textarea
                placeholder="سيظهر النص المحسّن هنا…"
                value={enhancedText}
                onChange={(e) => setEnhancedText(e.target.value)}
                className={`min-h-[280px] resize-none text-sm border-2 border-gray-300 dark:border-border bg-gray-50/30 dark:bg-background focus:bg-white dark:focus:bg-background ${!canGenerate() && !enhancedText ? 'opacity-50' : ''}`}
              />
              {(!canGenerate() || upgradeVariant) && !enhancedText && (
                <ConnectedUpgradePrompt
                  variant={upgradeVariant}
                  layout="overlay"
                  creditsUsed={usage?.credits_used}
                  creditsLimit={totalCredits || undefined}
                  remainingCredits={usage?.credits_remaining}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] z-20 -mx-1 mb-4 flex gap-3 border-t bg-background/95 p-3 backdrop-blur sm:static sm:bottom-auto sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 md:hidden">
        <Button
          onClick={handleGenerate}
          disabled={!originalText.trim() || isGenerating || !canGenerate()}
          className="relative min-h-12 flex-1 overflow-hidden"
        >
          {isGenerating ? (
            <span className="flex items-center">
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
              <span className="animate-pulse">{loadingMessage || 'جاري التوليد…'}</span>
            </span>
          ) : (
            <>
              <Wand2 className="me-2 h-4 w-4" />
              {enhancedText ? 'إعادة التوليد' : 'توليد'}
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0"
          onClick={() => { setOriginalText(''); setEnhancedText('') }}
          disabled={!originalText && !enhancedText}
          aria-label="مسح"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="mb-4 hidden gap-3 md:flex">
        <Button
          onClick={handleGenerate}
          disabled={!originalText.trim() || isGenerating || !canGenerate()}
          className="relative min-h-11 flex-1 overflow-hidden"
        >
          {isGenerating ? (
            <span className="flex items-center">
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
              <span className="animate-pulse">{loadingMessage || 'جاري التوليد…'}</span>
            </span>
          ) : (
            <>
              <Wand2 className="me-2 h-4 w-4" />
              {enhancedText ? 'إعادة التوليد' : 'توليد'}
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => { setOriginalText(''); setEnhancedText('') }}
          disabled={!originalText && !enhancedText}
        >
          <RotateCcw className="me-2 h-4 w-4" />
          مسح
        </Button>
      </div>

      {/* History - Collapsible */}
      <Card className="border-2 border-gray-300 dark:border-border shadow-sm overflow-hidden bg-white dark:bg-card">
        <CardContent className="p-0">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span className="text-sm font-medium">السجل</span>
              {history.length > 0 && (
                <Badge variant="secondary" className="text-xs">{history.length}</Badge>
              )}
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showHistory ? 'rotate-180' : ''}`} />
          </button>
          
          <div 
            className={`border-t overflow-hidden transition-all duration-300 ease-in-out ${
              showHistory ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0 border-t-0'
            }`}
          >
            <div className="max-h-[300px] overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  لا يوجد سجل بعد
                </p>
              ) : (
                <div className="divide-y">
                  {history.map((item) => {
                    // Handle both local history format and API format
                    const originalText = item.originalText || (item as any).input_text || ''
                    const tone = item.tone || 'marketing'
                    const createdAt = item.createdAt || (item as any).created_at
                    const outputLang = item.outputLanguage || (item as any).output_language || 'ar_gulf'
                    const langLabel = OUTPUT_LANGUAGES.find(l => l.value === outputLang)?.label || outputLang
                    const platformLabel =
                      PLATFORM_OPTIONS.find((p) => p.value === (item.platform || (item as any).platform))
                        ?.label || 'متجر'
                    
                    return (
                      <div
                        key={item.id}
                        className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => loadHistoryItem(item)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-muted-foreground mb-1">
                              {createdAt ? new Date(createdAt).toLocaleString() : 'Unknown date'}
                            </div>
                            <div className="text-sm truncate">
                              {originalText.substring(0, 80)}
                              {originalText.length > 80 && '...'}
                            </div>
                          </div>
                          <div className="flex gap-1 flex-shrink-0 flex-wrap justify-end">
                            <Badge variant="outline" className="text-xs">{tone}</Badge>
                            <Badge variant="outline" className="text-xs">{langLabel}</Badge>
                            <Badge variant="outline" className="text-xs">{platformLabel}</Badge>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              {history.length > 0 && (
                <div className="text-xs text-muted-foreground text-center py-2 border-t bg-muted/30">
                  يُحفظ السجل لمدة ٧ أيام
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
