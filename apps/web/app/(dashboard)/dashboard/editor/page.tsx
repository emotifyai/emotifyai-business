'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@ui/button'
import { Card, CardContent } from '@ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select'
import { Textarea } from '@ui/textarea'
import { Badge } from '@ui/badge'
import { Slider } from '@ui/slider'
import { Loader2, Wand2, RotateCcw, History, Copy, Check, ChevronDown } from 'lucide-react'
import { useSubscription } from '@/lib/hooks/use-subscription'
import { useUsageStats } from '@/lib/hooks/use-usage'
import { SubscriptionTier } from '@/types/database'
import { toast } from 'sonner'

interface HistoryItem {
  id: string
  originalText: string
  enhancedText: string
  tone: string
  outputLanguage: string
  strength: number
  createdAt: string
}

const TONE_OPTIONS = [
  { value: 'emotional', label: 'Emotional' },
  { value: 'professional', label: 'Professional' },
  { value: 'marketing', label: 'Marketing' }
]

const OUTPUT_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'Arabic' },
  { value: 'fr', label: 'French' }
]

const STRENGTH_LEVELS = [
  { value: 1, label: 'Minimal', description: 'Fix typos only' },
  { value: 2, label: 'Light', description: 'Gentle refinement' },
  { value: 3, label: 'Moderate', description: 'Balanced' },
  { value: 4, label: 'Strong', description: 'Significant' },
  { value: 5, label: 'Maximum', description: 'Full rewrite' }
]

const LOADING_MESSAGES = [
  "Analyzing your text...",
  "Crafting the perfect words...",
  "Enhancing clarity and flow...",
  "Polishing your message...",
  "Adding that professional touch...",
  "Fine-tuning the tone...",
  "Making it shine...",
  "Almost there...",
  "Applying AI magic...",
  "Perfecting every sentence...",
]

export default function EditorPage() {
  const searchParams = useSearchParams()
  const { data: subscription } = useSubscription()
  const { data: usage, refetch: refetchUsage } = useUsageStats()

  const totalCredits = usage ? usage.credits_used + usage.credits_remaining : 0
  const isUnlimited = usage?.credits_remaining === -1

  // Editor state
  const [originalText, setOriginalText] = useState('')
  const [enhancedText, setEnhancedText] = useState('')
  const [tone, setTone] = useState<string>('professional')
  const [outputLanguage, setOutputLanguage] = useState<string>('en')
  const [strength, setStrength] = useState(3)
  const [isGenerating, setIsGenerating] = useState(false)
  const [detectedLanguage, setDetectedLanguage] = useState<string>('')
  const [loadingMessage, setLoadingMessage] = useState('')

  // History state
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})

  // Load cached session data on mount (only if no URL text param)
  useEffect(() => {
    const textParam = searchParams.get('text')
    
    // If there's a text param in URL, use that instead of cache
    if (textParam) {
      setOriginalText(decodeURIComponent(textParam))
      // Clear the URL param after loading to prevent re-triggering
      window.history.replaceState({}, '', '/dashboard/editor')
      return
    }
    
    // Otherwise load from session cache
    const cached = sessionStorage.getItem('editor_session')
    if (cached) {
      try {
        const data = JSON.parse(cached)
        if (data.originalText) setOriginalText(data.originalText)
        if (data.enhancedText) setEnhancedText(data.enhancedText)
        if (data.tone) setTone(data.tone)
        if (data.outputLanguage) setOutputLanguage(data.outputLanguage)
        if (data.strength) setStrength(data.strength)
      } catch (e) {
        console.error('Failed to parse cached session:', e)
      }
    }
  }, [searchParams])

  // Save to session cache when editor state changes
  useEffect(() => {
    // Skip saving if originalText is empty (initial state)
    if (!originalText && !enhancedText) return
    
    const data = { originalText, enhancedText, tone, outputLanguage, strength }
    sessionStorage.setItem('editor_session', JSON.stringify(data))
  }, [originalText, enhancedText, tone, outputLanguage, strength])

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

  const detectLanguage = (text: string): string => {
    const arabicRegex = /[\u0600-\u06FF]/
    const frenchRegex = /[àâäéèêëïîôöùûüÿç]/i
    if (arabicRegex.test(text)) return 'Arabic'
    if (frenchRegex.test(text)) return 'French'
    return 'English'
  }

  useEffect(() => {
    if (originalText) {
      setDetectedLanguage(detectLanguage(originalText))
    }
  }, [originalText])

  const canGenerate = () => {
    if (!subscription) return false
    if (subscription.tier === SubscriptionTier.LIFETIME_LAUNCH) return true
    if (!usage) return false
    return isUnlimited || usage.credits_remaining > 0
  }

  const handleGenerate = async () => {
    if (!originalText.trim()) {
      toast.error('Please enter some text to enhance')
      return
    }
    if (!canGenerate()) {
      toast.error('Usage limit reached. Please upgrade your subscription.', {
        action: {
          label: 'Upgrade',
          onClick: () => window.location.href = '/pricing'
        }
      })
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
          strength,
          isEditorSession: true
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setEnhancedText(data.data.enhancedText)
        toast.success('Text enhanced successfully!', {
          description: `${data.data.tokensUsed || 0} tokens used`
        })
        // Refetch usage stats to update the counter
        refetchUsage()
        const newHistoryItem: HistoryItem = {
          id: Date.now().toString(),
          originalText,
          enhancedText: data.data.enhancedText,
          tone,
          outputLanguage,
          strength,
          createdAt: new Date().toISOString()
        }
        setHistory(prev => [newHistoryItem, ...prev])
      } else {
        // Handle specific error codes
        const errorCode = data.error?.code
        const errorMessage = data.error?.message || 'Enhancement failed'
        
        switch (errorCode) {
          case 'USAGE_LIMIT_EXCEEDED':
            toast.error('You\'ve run out of credits', {
              description: 'Upgrade your plan to continue enhancing text',
              action: {
                label: 'Upgrade',
                onClick: () => window.location.href = '/pricing'
              }
            })
            break
          case 'UNAUTHORIZED':
            toast.error('Session expired', {
              description: 'Please log in again to continue',
              action: {
                label: 'Login',
                onClick: () => window.location.href = '/login'
              }
            })
            break
          case 'QUALITY_CHECK_FAILED':
            toast.error('Quality check failed', {
              description: 'The AI output didn\'t meet quality standards. Please try again.'
            })
            break
          case 'UNSUPPORTED_LANGUAGE':
            toast.error('Language not supported', {
              description: 'Please use English, Arabic, or French'
            })
            break
          case 'RATE_LIMIT_EXCEEDED':
            toast.error('Too many requests', {
              description: 'Please wait a moment before trying again'
            })
            break
          default:
            toast.error('Enhancement failed', {
              description: errorMessage
            })
        }
      }
    } catch (error) {
      toast.error('Connection error', {
        description: 'Please check your internet connection and try again'
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
      toast.success('Copied!')
      setTimeout(() => setCopiedStates(prev => ({ ...prev, [key]: false })), 2000)
    } catch (error) {
      toast.error('Failed to copy')
    }
  }

  const loadHistoryItem = (item: HistoryItem) => {
    // Handle both local history format and API format
    setOriginalText(item.originalText || (item as any).input_text || '')
    setEnhancedText(item.enhancedText || (item as any).output_text || '')
    setTone(item.tone || 'professional')
    setOutputLanguage(item.outputLanguage || (item as any).output_language || 'en')
    setStrength(item.strength || 3)
    setShowHistory(false)
  }

  return (
    <div className="container mx-auto pt-4 px-2 max-w-6xl min-h-screen bg-slate-50/50 dark:bg-background">
      {/* Header with usage */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Text Editor</h1>
          <p className="text-sm text-muted-foreground">Enhance your text with AI</p>
        </div>
        {usage && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {usage.credits_used} / {isUnlimited ? '∞' : totalCredits} used
            </span>
          </div>
        )}
      </div>

      {/* Settings Bar - Compact horizontal layout */}
      <Card className="mb-4 border-2 border-gray-300 dark:border-border shadow-sm bg-gray-50/50 dark:bg-card">
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Tone:</span>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="w-[130px] h-8 border-2 border-gray-300 dark:border-border bg-white dark:bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONE_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Output:</span>
              <Select value={outputLanguage} onValueChange={setOutputLanguage}>
                <SelectTrigger className="w-[120px] h-8 border-2 border-gray-300 dark:border-border bg-white dark:bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OUTPUT_LANGUAGES.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Strength:</span>
              <div className="flex items-center gap-3">
                <Slider
                  value={[strength]}
                  onValueChange={(value) => setStrength(value[0])}
                  min={1}
                  max={5}
                  step={1}
                  className="w-24"
                />
                <span className="text-xs font-medium text-foreground min-w-[60px]">
                  {STRENGTH_LEVELS[strength - 1].label}
                </span>
              </div>
            </div>
            {detectedLanguage && (
              <Badge variant="secondary" className="text-xs">
                Detected: {detectedLanguage}
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
              <span className="text-sm font-medium">Original Text</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{originalText.length} chars</span>
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
              placeholder="Type, paste, or use the browser extension to select text..."
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
              <span className="text-sm font-medium">Enhanced Text</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{enhancedText.length} chars</span>
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
                placeholder="Enhanced text will appear here..."
                value={enhancedText}
                onChange={(e) => setEnhancedText(e.target.value)}
                className={`min-h-[280px] resize-none text-sm border-2 border-gray-300 dark:border-border bg-gray-50/30 dark:bg-background focus:bg-white dark:focus:bg-background ${!canGenerate() && !enhancedText ? 'opacity-50' : ''}`}
              />
              {/* Upgrade Overlay */}
              {!canGenerate() && !enhancedText && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-md">
                  <div className="text-center p-6 max-w-xs">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <Wand2 className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Credits Exhausted</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You've used all your free credits. Upgrade to continue enhancing your text.
                    </p>
                    <Button 
                      onClick={() => window.location.href = '/pricing'}
                      className="w-full"
                    >
                      View Plans
                    </Button>
                    <p className="text-xs text-muted-foreground mt-3">
                      Starting at $17/month
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-4">
        <Button
          onClick={handleGenerate}
          disabled={!originalText.trim() || isGenerating || !canGenerate()}
          className="flex-1 relative overflow-hidden"
        >
          {isGenerating ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span className="animate-pulse">{loadingMessage || 'Generating...'}</span>
            </span>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              {enhancedText ? 'Regenerate' : 'Generate'}
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => { setOriginalText(''); setEnhancedText('') }}
          disabled={!originalText && !enhancedText}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Clear
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
              <span className="text-sm font-medium">History</span>
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
                  No history yet
                </p>
              ) : (
                <div className="divide-y">
                  {history.map((item) => {
                    // Handle both local history format and API format
                    const originalText = item.originalText || (item as any).input_text || ''
                    const tone = item.tone || 'professional'
                    const strength = item.strength || 3
                    const createdAt = item.createdAt || (item as any).created_at
                    const outputLang = item.outputLanguage || (item as any).output_language || 'en'
                    const langLabel = OUTPUT_LANGUAGES.find(l => l.value === outputLang)?.label || outputLang.toUpperCase()
                    
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
                            <Badge variant="outline" className="text-xs">L{strength}</Badge>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              {history.length > 0 && (
                <div className="text-xs text-muted-foreground text-center py-2 border-t bg-muted/30">
                  History kept for 7 days
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
