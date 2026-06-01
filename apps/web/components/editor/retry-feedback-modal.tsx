'use client'

import { useState } from 'react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Textarea,
} from '@emotifyai/ui'
import { Loader2 } from 'lucide-react'
import { RETRY_REASON_OPTIONS } from '@/lib/editor/retry-reasons'
import type { RetryReasonValue } from '@/types/api'
import { cn } from '@/lib/utils'

interface RetryFeedbackModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (reason: RetryReasonValue, otherText?: string) => Promise<void>
  isSubmitting?: boolean
}

export function RetryFeedbackModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: RetryFeedbackModalProps) {
  const [selected, setSelected] = useState<RetryReasonValue | null>(null)
  const [otherText, setOtherText] = useState('')

  const handleOpenChange = (next: boolean) => {
    if (!next && !isSubmitting) {
      setSelected(null)
      setOtherText('')
    }
    onOpenChange(next)
  }

  const handleSubmit = async () => {
    if (!selected) return
    await onSubmit(selected, selected === 'other' ? otherText.trim() || undefined : undefined)
    setSelected(null)
    setOtherText('')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm" dir="rtl">
        <DialogHeader className="text-right sm:text-right">
          <DialogTitle>لماذا لم يعجبك النص؟</DialogTitle>
          <DialogDescription>
            اختر السبب الأقرب — سنعيد التحسين مجاناً مرة واحدة
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 py-1" role="radiogroup" aria-label="سبب إعادة المحاولة">
          {RETRY_REASON_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected === option.value}
              disabled={isSubmitting}
              onClick={() => setSelected(option.value)}
              className={cn(
                'rounded-lg border-2 px-3 py-2.5 text-sm text-right transition-colors',
                selected === option.value
                  ? 'border-primary bg-primary/5 font-medium'
                  : 'border-gray-200 hover:border-gray-300 dark:border-border dark:hover:border-muted-foreground/40'
              )}
            >
              {option.labelAr}
            </button>
          ))}
        </div>

        {selected === 'other' && (
          <div className="space-y-1.5">
            <Label htmlFor="retry-other" className="text-sm text-muted-foreground">
              وضّح (اختياري)
            </Label>
            <Textarea
              id="retry-other"
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              placeholder="ما الذي تريد تحسينه؟"
              className="min-h-[72px] resize-none text-sm"
              disabled={isSubmitting}
              maxLength={500}
            />
          </div>
        )}

        <DialogFooter className="flex-row-reverse gap-2 sm:flex-row-reverse">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!selected || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
                جاري إعادة التحسين…
              </>
            ) : (
              'إرسال وإعادة المحاولة'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
