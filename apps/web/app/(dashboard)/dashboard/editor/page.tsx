'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@emotifyai/ui'
import { Card, CardContent } from '@emotifyai/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@emotifyai/ui'
import { EnhanceTextInput, EnhanceTextOutput } from '@emotifyai/ui'
import { Badge } from '@emotifyai/ui'
import { Loader2, Wand2, RotateCcw, History, Copy, Check, ChevronDown, RefreshCw, Share2 } from 'lucide-react'
import { RetryFeedbackModal } from '@/components/editor/retry-feedback-modal'
import {
  trackCopyClicked,
  trackRetryUsed,
  trackShareClicked,
  trackTransformCompleted,
  trackUpgradeClicked,
} from '@/lib/analytics/ga'
import { getRetryReasonLabel } from '@/lib/editor/retry-reasons'
import type { RetryReasonValue } from '@/types/api'
import { useSubscription } from '@/lib/hooks/use-subscription'
import { useUsageStats } from '@/lib/hooks/use-usage'
import { SubscriptionTier } from '@/types/database'
import { toast } from 'sonner'
import {
  ConnectedUpgradePrompt,
  resolveUpgradeVariant,
} from '@/components/upgrade-prompt'
import { detectInputLanguage } from '@/lib/ai/language-detection'
import {
  OUTPUT_LANGUAGES,
  TONE_OPTIONS,
  PLATFORM_OPTIONS,
} from '@/lib/editor/constants'
import {
  labelForOutputLanguage,
  labelForPlatform,
  labelForTone,
} from '@/lib/editor/labels'
import { EDITOR_SESSION_KEY } from '@/lib/editor/session'
import { consumeEnhanceSSE } from '@/lib/api/enhance-sse'
import { ApiErrorCode } from '@/types/api'

interface HistoryItem {
  id: string
  originalText: string
  enhancedText: string
  tone: string
  outputLanguage: string
  platform?: string
  createdAt: string
  retryUsed?: boolean
}

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
  const [sessionHydrated, setSessionHydrated] = useState(false)
  const [currentUsageLogId, setCurrentUsageLogId] = useState<string | null>(null)
  const [retryUsed, setRetryUsed] = useState(false)
  const [retryModalOpen, setRetryModalOpen] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)

  // Load cached session data on mount (landing → editor handoff)
  useEffect(() => {
    const cached = sessionStorage.getItem(EDITOR_SESSION_KEY)
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
    setSessionHydrated(true)
  }, [])

  // Save to session cache when editor state changes (after hydration)
  useEffect(() => {
    if (!sessionHydrated) return
    const data = { originalText, enhancedText, tone, outputLanguage, platform }
    sessionStorage.setItem(EDITOR_SESSION_KEY, JSON.stringify(data))
  }, [originalText, enhancedText, tone, outputLanguage, platform, sessionHydrated])

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
        const items = (data.history || []).map(
          (row: {
            id: string
            input_text: string
            output_text: string
            tone?: string
            output_language?: string
            platform?: string
            created_at: string
            retry_used?: boolean
          }) => ({
            id: row.id,
            originalText: row.input_text,
            enhancedText: row.output_text,
            tone: row.tone || 'marketing',
            outputLanguage: row.output_language || 'ar_gulf',
            platform: row.platform,
            createdAt: row.created_at,
            retryUsed: row.retry_used ?? false,
          })
        )
        setHistory(items)
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
      trackUpgradeClicked('editor_generate_blocked')
      return
    }

    setIsGenerating(true)
    setEnhancedText('')
    setCurrentUsageLogId(null)
    setRetryUsed(false)
    setLoadingMessage(LOADING_MESSAGES[0])

    const messageInterval = setInterval(() => {
      setLoadingMessage(prev => {
        const currentIndex = LOADING_MESSAGES.indexOf(prev)
        const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length
        return LOADING_MESSAGES[nextIndex]
      })
    }, 1500)

    const handleEnhanceError = (errorCode: string | undefined, errorMessage: string, tier?: string) => {
      switch (errorCode) {
        case ApiErrorCode.USAGE_LIMIT_EXCEEDED:
          setUpgradeVariant(
            resolveUpgradeVariant({
              isAuthenticated: true,
              tier: tier ?? subscription?.tier,
              creditsRemaining: 0,
              creditsLimit: totalCredits || subscription?.credits_limit,
            }) ?? 'limit_reached'
          )
          trackUpgradeClicked('editor_limit_reached')
          break
        case ApiErrorCode.UNAUTHORIZED:
          toast.error('انتهت الجلسة', {
            description: 'يرجى تسجيل الدخول مرة أخرى للمتابعة',
            action: {
              label: 'تسجيل الدخول',
              onClick: () => window.location.href = '/login',
            },
          })
          break
        case ApiErrorCode.QUALITY_CHECK_FAILED:
          toast.error('فشل فحص الجودة', {
            description: 'لم يلبِ مخرجات الذكاء الاصطناعي معايير الجودة. حاول مرة أخرى.',
          })
          break
        case ApiErrorCode.UNSUPPORTED_LANGUAGE:
          toast.error('لغة المخرج غير مدعومة', {
            description: 'اختر عربي خليجي أو فصيح أو إنجليزي',
          })
          break
        case ApiErrorCode.RATE_LIMIT_EXCEEDED:
          toast.error('طلبات كثيرة جداً', {
            description: 'انتظر لحظة قبل المحاولة مرة أخرى',
          })
          break
        default:
          toast.error('فشل التحسين', {
            description: errorMessage,
          })
      }
    }

    try {
      const response = await fetch('/api/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({
          text: originalText,
          tone,
          outputLanguage,
          platform,
          isEditorSession: true,
          stream: true,
        }),
      })

      let streamFailed = false

      await consumeEnhanceSSE(response, {
        onDelta: (chunk) => {
          setEnhancedText((prev) => prev + chunk)
        },
        onDone: (data) => {
          setEnhancedText(data.enhancedText)
          if (data.usageLogId) {
            setCurrentUsageLogId(data.usageLogId)
          }
          setRetryUsed(data.retryUsed ?? false)
          trackTransformCompleted()
          toast.success('تم تحسين النص بنجاح!', {
            description: `تم استخدام ${data.tokensUsed || 0} رمزاً`,
          })
          void loadHistory()
        },
        onError: (error) => {
          streamFailed = true
          handleEnhanceError(error.code, error.message, error.tier)
        },
      })

      if (!response.ok && !streamFailed) {
        try {
          const data = await response.clone().json()
          handleEnhanceError(data.error?.code, data.error?.message ?? 'Enhancement failed', data.error?.tier)
        } catch {
          handleEnhanceError(undefined, response.statusText)
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

  const handleShare = async (text: string) => {
    if (!text.trim()) return
    try {
      if (navigator.share) {
        await navigator.share({ text })
        trackShareClicked()
      } else {
        await navigator.clipboard.writeText(text)
        trackShareClicked()
        toast.success('تم نسخ النص للمشاركة')
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
      toast.error('تعذرت المشاركة')
    }
  }

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      if (key === 'enhanced') {
        trackCopyClicked()
      }
      setCopiedStates(prev => ({ ...prev, [key]: true }))
      toast.success('تم النسخ!')
      setTimeout(() => setCopiedStates(prev => ({ ...prev, [key]: false })), 2000)
    } catch (error) {
      toast.error('فشل النسخ')
    }
  }

  const loadHistoryItem = (item: HistoryItem) => {
    const apiItem = item as HistoryItem & {
      input_text?: string
      output_text?: string
      output_language?: string
      created_at?: string
      retry_used?: boolean
    }
    setOriginalText(item.originalText || apiItem.input_text || '')
    setEnhancedText(item.enhancedText || apiItem.output_text || '')
    setTone(item.tone || 'marketing')
    setOutputLanguage(item.outputLanguage || apiItem.output_language || 'ar_gulf')
    setPlatform(item.platform || apiItem.platform || 'store')
    setCurrentUsageLogId(item.id)
    setRetryUsed(item.retryUsed ?? apiItem.retry_used ?? false)
    setShowHistory(false)
  }

  const canShowRetry =
    Boolean(enhancedText) &&
    Boolean(currentUsageLogId) &&
    !retryUsed &&
    !isGenerating &&
    !isRetrying

  const handleRetrySubmit = async (reason: RetryReasonValue, otherText?: string) => {
    if (!currentUsageLogId || !originalText.trim()) return

    const parentLogId = currentUsageLogId
    setIsRetrying(true)
    trackRetryUsed(getRetryReasonLabel(reason))

    try {
      const response = await fetch('/api/enhance/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentLogId,
          retryReason: reason,
          retryReasonOther: otherText,
          text: originalText,
          tone,
          outputLanguage,
          platform,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setEnhancedText(data.data.enhancedText)
        setRetryModalOpen(false)
        setRetryUsed(false)
        if (data.data.usageLogId) {
          setCurrentUsageLogId(data.data.usageLogId)
        }
        toast.success('تمت إعادة التحسين مجاناً', {
          description: 'لم يُخصم أي رصيد',
        })
        setHistory((prev) =>
          prev.map((h) =>
            h.id === parentLogId ? { ...h, retryUsed: true } : h
          )
        )
        const newHistoryItem: HistoryItem = {
          id: data.data.usageLogId ?? Date.now().toString(),
          originalText,
          enhancedText: data.data.enhancedText,
          tone,
          outputLanguage,
          platform,
          createdAt: new Date().toISOString(),
          retryUsed: false,
        }
        setHistory((prev) => [newHistoryItem, ...prev])
      } else {
        const errorCode = data.error?.code
        if (errorCode === 'RETRY_ALREADY_USED') {
          setRetryUsed(true)
          setRetryModalOpen(false)
          toast.error('تم استخدام إعادة المحاولة مسبقاً')
        } else {
          toast.error('فشلت إعادة المحاولة', {
            description: data.error?.message || 'حاول مرة أخرى',
          })
        }
      }
    } catch {
      toast.error('خطأ في الاتصال', {
        description: 'تحقق من اتصالك بالإنترنت وحاول مرة أخرى',
      })
    } finally {
      setIsRetrying(false)
    }
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
            <EnhanceTextInput
              variant="editor"
              value={originalText}
              onChange={setOriginalText}
              onSubmit={handleGenerate}
              expandTitle="النص الأصلي"
              headerSlot={
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">النص الأصلي</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 sm:h-8 sm:w-8"
                    onClick={() => handleCopy(originalText, 'original')}
                    disabled={!originalText}
                    aria-label="نسخ النص الأصلي"
                  >
                    {copiedStates.original ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              }
            />
          </CardContent>
        </Card>

        {/* Enhanced Text */}
        <Card className="border-2 border-gray-300 dark:border-border shadow-sm relative bg-white dark:bg-card">
          <CardContent className="p-3">
            <EnhanceTextOutput
              value={enhancedText}
              onChange={setEnhancedText}
              expandTitle="النص المحسّن"
              textareaClassName={!canGenerate() && !enhancedText ? 'opacity-50' : ''}
              headerSlot={
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">النص المحسّن</span>
                  {canShowRetry && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => setRetryModalOpen(true)}
                    >
                      <RefreshCw className="me-1 h-3.5 w-3.5" />
                      أعد المحاولة
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 sm:h-8 sm:w-8"
                    onClick={() => void handleShare(enhancedText)}
                    disabled={!enhancedText}
                    aria-label="مشاركة النص المحسّن"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 sm:h-8 sm:w-8"
                    onClick={() => handleCopy(enhancedText, 'enhanced')}
                    disabled={!enhancedText}
                    aria-label="نسخ النص المحسّن"
                  >
                    {copiedStates.enhanced ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              }
              overlay={
                (!canGenerate() || upgradeVariant) && !enhancedText ? (
                  <ConnectedUpgradePrompt
                    variant={upgradeVariant}
                    layout="overlay"
                    creditsUsed={usage?.credits_used}
                    creditsLimit={totalCredits || undefined}
                    remainingCredits={usage?.credits_remaining}
                  />
                ) : undefined
              }
            />
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
          onClick={() => {
            setOriginalText('')
            setEnhancedText('')
            setCurrentUsageLogId(null)
            setRetryUsed(false)
          }}
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
          onClick={() => {
            setOriginalText('')
            setEnhancedText('')
            setCurrentUsageLogId(null)
            setRetryUsed(false)
          }}
          disabled={!originalText && !enhancedText}
        >
          <RotateCcw className="me-2 h-4 w-4" />
          مسح
        </Button>
      </div>

      <RetryFeedbackModal
        open={retryModalOpen}
        onOpenChange={setRetryModalOpen}
        onSubmit={handleRetrySubmit}
        isSubmitting={isRetrying}
      />

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
                    const row = item as HistoryItem & {
                      input_text?: string
                      output_language?: string
                      created_at?: string
                      platform?: string
                    }
                    const previewText = row.originalText || row.input_text || ''
                    const createdAt = row.createdAt || row.created_at
                    const outputLang =
                      row.outputLanguage || row.output_language || 'ar_gulf'
                    const toneValue = row.tone || 'marketing'
                    const platformValue = row.platform || 'store'

                    return (
                      <div
                        key={item.id}
                        className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => loadHistoryItem(item)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-muted-foreground mb-1">
                              {createdAt
                                ? new Date(createdAt).toLocaleString('ar-SA')
                                : '—'}
                            </div>
                            <div className="text-sm truncate">
                              {previewText.substring(0, 80)}
                              {previewText.length > 80 && '...'}
                            </div>
                          </div>
                          <div className="flex flex-shrink-0 flex-wrap justify-end gap-1">
                            <Badge variant="outline" className="text-xs" title="لغة المخرج">
                              {labelForOutputLanguage(outputLang)}
                            </Badge>
                            <Badge variant="outline" className="text-xs" title="النبرة">
                              {labelForTone(toneValue)}
                            </Badge>
                            <Badge variant="outline" className="text-xs" title="المنصة">
                              {labelForPlatform(platformValue)}
                            </Badge>
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
