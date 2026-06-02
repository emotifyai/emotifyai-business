'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { Button } from '@emotifyai/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@emotifyai/ui'
import {
  EnhanceTextInput,
  EnhanceTextOutput,
  editorToolbarIconButtonClass,
} from '@emotifyai/ui'
import { cn } from '@/lib/utils'
import { Badge } from '@emotifyai/ui'
import {
  Loader2,
  Wand2,
  RotateCcw,
  History,
  Copy,
  Check,
  ChevronDown,
  RefreshCw,
  Share2,
  FileEdit,
  Sparkles,
} from 'lucide-react'
import { useCopy } from '@/components/ui/copy-button'
import { useFirstEnhanceConfetti } from '@/lib/confetti'
import { ShareModal } from '@/components/ui/share-modal'
import { RetryFeedbackModal } from '@/components/editor/retry-feedback-modal'
import {
  trackRetryUsed,
  trackShareClicked,
  trackTransformCompleted,
  trackUpgradeClicked,
} from '@/lib/analytics/ga'
import { getRetryReasonLabel } from '@/lib/editor/retry-reasons'
import type { RetryReasonValue } from '@/types/api'
import { REGISTERED_FREE_CREDIT_TOTAL } from '@emotifyai/config/pricing'
import { useSubscription } from '@/lib/hooks/use-subscription'
import { useUsageStats } from '@/lib/hooks/use-usage'
import { useUser } from '@/lib/hooks/use-auth'
import { toast } from '@emotifyai/ui'
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
  const queryClient = useQueryClient()
  const { data: subscription, isLoading: isSubscriptionLoading } = useSubscription()
  const { data: usage, isLoading: isUsageLoading } = useUsageStats()
  const { data: authUser } = useUser()

  const isCreditsReady = !isSubscriptionLoading && !isUsageLoading

  const creditsUsed = usage?.credits_used ?? subscription?.credits_used ?? 0
  const creditsRemaining =
    usage?.credits_remaining ?? subscription?.credits_remaining
  const creditsLimit =
    subscription?.credits_limit ??
    (usage != null ? usage.credits_used + usage.credits_remaining : undefined) ??
    REGISTERED_FREE_CREDIT_TOTAL
  const totalCredits =
    creditsLimit > 0 ? creditsLimit : creditsUsed + (creditsRemaining ?? 0)
  const isUnlimited = creditsRemaining === -1
  const canUseCredits =
    isCreditsReady &&
    (isUnlimited || (creditsRemaining !== undefined && creditsRemaining > 0))

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
  const [shareModalData, setShareModalData] = useState<{ isOpen: boolean; text: string }>({
    isOpen: false,
    text: '',
  })
  const [showHistory, setShowHistory] = useState(false)
  const { copied: copiedOriginal, copy: copyOriginal } = useCopy(false)
  const { copied: copiedEnhanced, copy: copyEnhanced } = useCopy(true)
  const { markFirstEnhance } = useFirstEnhanceConfetti(authUser?.id ?? null)
  const [upgradeVariant, setUpgradeVariant] = useState<
    import('@emotifyai/ui').UpgradePromptVariant | undefined
  >(undefined)
  const [sessionHydrated, setSessionHydrated] = useState(false)
  const [currentUsageLogId, setCurrentUsageLogId] = useState<string | null>(null)
  const [retryUsed, setRetryUsed] = useState(false)
  const [retryModalOpen, setRetryModalOpen] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const shareInProgressRef = useRef(false)

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

  useEffect(() => {
    if (canUseCredits && upgradeVariant) {
      setUpgradeVariant(undefined)
    }
  }, [canUseCredits, upgradeVariant])

  useEffect(() => {
    if (!isCreditsReady) return
    console.log('[DUCK editor/credits]', {
      creditsUsed,
      creditsLimit,
      creditsRemaining,
      canUseCredits,
      upgradeVariant,
      tier: subscription?.tier,
    })
  }, [
    isCreditsReady,
    creditsUsed,
    creditsLimit,
    creditsRemaining,
    canUseCredits,
    upgradeVariant,
    subscription?.tier,
  ])

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/user/history')
      console.log('[DUCK editor/history] fetch status', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('[DUCK editor/history] rows', {
          count: data.history?.length ?? 0,
          ids: (data.history ?? []).slice(0, 3).map((r: { id: string }) => r.id),
        })
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
      } else {
        const errBody = await response.json().catch(() => ({}))
        console.log('[DUCK editor/history] fetch failed', errBody)
      }
    } catch (error) {
      console.error('[DUCK editor/history] Failed to load history:', error)
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

  const handleGenerate = async () => {
    if (!originalText.trim()) {
      toast.error('يرجى إدخال نص للتحسين')
      return
    }
    if (!canUseCredits) {
      setUpgradeVariant(
        resolveUpgradeVariant({
          isAuthenticated: true,
          tier: subscription?.tier,
          creditsRemaining: creditsRemaining ?? 0,
          creditsLimit,
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
              creditsLimit,
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
        case ApiErrorCode.CONTENT_BLOCKED:
          toast.error('محتوى محظور', {
            description: 'تم حظر النص بواسطة فلاتر الأمان للذكاء الاصطناعي. يرجى تجربة نص مختلف.',
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
          console.log('[DUCK editor/generate] done', {
            usageLogId: data.usageLogId ?? null,
            retryUsed: data.retryUsed ?? false,
          })
          // Invalidate usage and subscription caches so the counter updates immediately
          void queryClient.invalidateQueries({ queryKey: ['usage-stats'] })
          void queryClient.invalidateQueries({ queryKey: ['subscription'] })
          trackTransformCompleted()
          markFirstEnhance()
          toast.success('تم تحسين النص بنجاح!')
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

  const handleShare = useCallback(async (text: string) => {
    if (!text.trim() || shareInProgressRef.current) {
      console.log('[DUCK editor/share] skipped', {
        empty: !text.trim(),
        inProgress: shareInProgressRef.current,
      })
      return
    }
    shareInProgressRef.current = true
    const textToShare = text
    console.log('[DUCK editor/share] start', { len: textToShare.length })
    try {
      const isMobile = typeof navigator !== 'undefined' && 
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        
      if (isMobile && typeof navigator.share === 'function') {
        await navigator.share({ text: textToShare })
        trackShareClicked()
        console.log('[DUCK editor/share] native share ok')
      } else {
        setShareModalData({ isOpen: true, text: textToShare })
        trackShareClicked()
        console.log('[DUCK editor/share] opened share modal')
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('[DUCK editor/share] user dismissed')
        return
      }
      console.log('[DUCK editor/share] error', error)
      toast.error('تعذرت المشاركة')
    } finally {
      shareInProgressRef.current = false
    }
  }, [])


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

  useEffect(() => {
    console.log('[DUCK editor/retry-btn]', {
      visible: canShowRetry,
      usageLogId: currentUsageLogId,
      retryUsed,
      hasEnhancedText: Boolean(enhancedText),
      isGenerating,
      isRetrying,
      hiddenBecause: !enhancedText
        ? 'no_output'
        : !currentUsageLogId
          ? 'no_usage_log_id'
          : retryUsed
            ? 'retry_already_used'
            : isGenerating
              ? 'generating'
              : isRetrying
                ? 'retrying'
                : null,
    })
  }, [canShowRetry, currentUsageLogId, retryUsed, enhancedText, isGenerating, isRetrying])

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

  const selectTriggerClass =
    'h-8 min-w-[7rem] border-0 bg-muted text-sm shadow-none focus:ring-1 focus:ring-ring rounded-lg px-3'

  const handleClear = () => {
    setOriginalText('')
    setEnhancedText('')
    setCurrentUsageLogId(null)
    setRetryUsed(false)
  }

  const generateButtonLabel = isGenerating
    ? loadingMessage || 'جاري التوليد…'
    : enhancedText
      ? 'إعادة التوليد'
      : 'توليد'

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl overflow-x-hidden">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            محرر النصوص
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">حسّن نصوصك بالذكاء الاصطناعي</p>
        </div>
        {usage && (
          <div className="flex flex-col items-start sm:items-end">
            <span className="text-xs text-muted-foreground">الاستخدام</span>
            <span className="text-sm font-bold text-primary">
              {usage.credits_used} / {isUnlimited ? '∞' : totalCredits} مستخدم
            </span>
          </div>
        )}
      </header>

      <div className="mb-6 flex flex-col overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-border bg-muted/50 px-4 py-3 sm:gap-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <label className="text-xs font-medium text-muted-foreground">لغة المخرج:</label>
            <Select value={outputLanguage} onValueChange={setOutputLanguage}>
              <SelectTrigger className={selectTriggerClass}>
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

          <div className="hidden h-6 w-px bg-border md:block" aria-hidden />

          <div className="flex items-center gap-2 sm:gap-3">
            <label className="text-xs font-medium text-muted-foreground">النبرة:</label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className={selectTriggerClass}>
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

          <div className="hidden h-6 w-px bg-border md:block" aria-hidden />

          <div className="flex items-center gap-2 sm:gap-3">
            <label className="text-xs font-medium text-muted-foreground">المنصة:</label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className={selectTriggerClass}>
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

          <p className="hidden text-xs italic text-muted-foreground/70 lg:ms-auto lg:block">
            المدخل: أي لغة — يُحوَّل تلقائياً إلى لغة المخرج المختارة
          </p>

          {detectedInputLabel && (
            <Badge variant="secondary" className="text-xs">
              مدخل: {detectedInputLabel}
              {detectionConfidence != null &&
                ` — ثقة ${Math.round(detectionConfidence * 100)}٪`}
            </Badge>
          )}
        </div>

        <div className="flex min-h-[min(450px,70dvh)] flex-col divide-y divide-border md:flex-row md:divide-x md:divide-x-reverse md:divide-y-0">
          <div className="flex min-h-[280px] flex-1 flex-col bg-muted/20 p-4 sm:p-6 md:min-h-0">
            <EnhanceTextInput
              variant="editor"
              value={originalText}
              onChange={setOriginalText}
              onSubmit={handleGenerate}
              expandTitle="النص الأصلي"
              headerSlot={
                <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <FileEdit className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                  النص الأصلي
                </h3>
              }
              trailingActions={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    editorToolbarIconButtonClass,
                    copiedOriginal && 'text-primary'
                  )}
                  onClick={() => copyOriginal(originalText)}
                  disabled={!originalText}
                  aria-label="نسخ النص الأصلي"
                >
                  {copiedOriginal ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              }
            />
          </div>

          <div className="relative flex min-h-[280px] flex-1 flex-col p-4 sm:p-6 md:min-h-0">
            <EnhanceTextOutput
              value={enhancedText}
              onChange={setEnhancedText}
              expandTitle="النص المحسّن"
              textareaClassName={
                isCreditsReady && !canUseCredits && !enhancedText ? 'opacity-50' : ''
              }
              headerSlot={
                <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <Sparkles className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                  النص المحسّن
                </h3>
              }
              trailingActions={
                <>
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
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={editorToolbarIconButtonClass}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      void handleShare(enhancedText)
                    }}
                    disabled={!enhancedText}
                    aria-label="مشاركة النص المحسّن"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn(
                      editorToolbarIconButtonClass,
                      copiedEnhanced && 'text-primary'
                    )}
                    onClick={() => copyEnhanced(enhancedText)}
                    disabled={!enhancedText}
                    aria-label="نسخ النص المحسّن"
                  >
                    {copiedEnhanced ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </>
              }
              overlay={
                isCreditsReady && !canUseCredits && !enhancedText ? (
                  <ConnectedUpgradePrompt
                    variant={upgradeVariant}
                    layout="overlay"
                    creditsUsed={creditsUsed}
                    creditsLimit={creditsLimit}
                    remainingCredits={creditsRemaining}
                  />
                ) : undefined
              }
            />
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col items-center gap-4">
        <div className="flex w-full max-w-2xl flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Button
            type="button"
            variant="outline"
            className="gap-2 rounded-xl border-border bg-card px-6 py-3 hover:bg-muted"
            onClick={handleClear}
            disabled={!originalText && !enhancedText}
          >
            <RotateCcw className="h-4 w-4" />
            مسح
          </Button>
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={
              !originalText.trim() ||
              isGenerating ||
              (isCreditsReady && !canUseCredits)
            }
            className="relative min-h-[3.25rem] max-w-md flex-1 gap-3 rounded-xl px-8 py-4 text-base font-semibold shadow-lg shadow-primary/10"
          >
            {isGenerating ? (
              <span className="flex items-center">
                <Loader2 className="me-2 h-5 w-5 animate-spin" />
                <span className="animate-pulse">{generateButtonLabel}</span>
              </span>
            ) : (
              <>
                <Wand2 className="h-5 w-5" />
                {generateButtonLabel}
              </>
            )}
          </Button>
        </div>
      </div>

      <RetryFeedbackModal
        open={retryModalOpen}
        onOpenChange={setRetryModalOpen}
        onSubmit={handleRetrySubmit}
        isSubmitting={isRetrying}
      />

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          className="flex w-full items-center justify-between px-4 py-4 text-start transition-colors hover:bg-muted/50 sm:px-6"
        >
          <div className="flex items-center gap-3">
            <History className="h-5 w-5 text-primary" aria-hidden />
            <h3 className="text-base font-semibold text-foreground">السجل</h3>
            {history.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {history.length}
              </Badge>
            )}
          </div>
          <ChevronDown
            className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${showHistory ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </button>

        <div
          className={`overflow-hidden border-t border-border transition-all duration-300 ease-in-out ${
            showHistory ? 'max-h-[320px] opacity-100' : 'max-h-0 opacity-0 border-t-0'
          }`}
        >
          <div className="max-h-[300px] space-y-3 overflow-y-auto px-4 pb-4 sm:px-6 sm:pb-6">
            {history.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">لا يوجد سجل بعد</p>
            ) : (
              history.map((item) => {
                const row = item as HistoryItem & {
                  input_text?: string
                  output_language?: string
                  created_at?: string
                  platform?: string
                }
                const previewText = row.originalText || row.input_text || ''
                const createdAt = row.createdAt || row.created_at
                const outputLang = row.outputLanguage || row.output_language || 'ar_gulf'
                const toneValue = row.tone || 'marketing'
                const platformValue = row.platform || 'store'

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => loadHistoryItem(item)}
                    className="group flex w-full items-start justify-between gap-4 rounded-lg border border-border bg-muted/30 p-4 text-start transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="line-clamp-1 text-sm text-foreground">
                        {previewText.substring(0, 80)}
                        {previewText.length > 80 && '...'}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {createdAt
                          ? new Date(createdAt).toLocaleString('ar-SA')
                          : '—'}
                        {' • '}
                        {labelForTone(toneValue)}
                        {' • '}
                        {labelForOutputLanguage(outputLang)}
                        {' • '}
                        {labelForPlatform(platformValue)}
                      </span>
                    </div>
                  </button>
                )
              })
            )}
            {history.length > 0 && (
              <p className="border-t border-border pt-3 text-center text-xs text-muted-foreground">
                يُحفظ السجل لمدة ٧ أيام
              </p>
            )}
          </div>
        </div>
      </section>
      <ShareModal
        isOpen={shareModalData.isOpen}
        onClose={() => setShareModalData({ ...shareModalData, isOpen: false })}
        text={shareModalData.text}
      />
    </div>
  )
}
