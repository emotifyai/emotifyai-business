'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { Copy, Loader2 } from 'lucide-react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@emotifyai/ui'
import { getDeleteAccountConfirmationPhrase } from '@/lib/account/delete-account'
import { toast } from '@emotifyai/ui'
import { cn } from '@/lib/utils'
import { EDITOR_SESSION_KEY } from '@/lib/editor/session'

type DeleteAccountDialogProps = {
  displayName: string
  email: string
}

export function DeleteAccountDialog({ displayName, email }: DeleteAccountDialogProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const phrase = getDeleteAccountConfirmationPhrase(displayName, email)
  const canDelete = confirmation.trim() === phrase && !isDeleting

  const handleOpenChange = (next: boolean) => {
    if (isDeleting) return
    if (!next) setConfirmation('')
    setOpen(next)
  }

  const handleCopyPhrase = async () => {
    try {
      await navigator.clipboard.writeText(phrase)
      toast.success('تم نسخ عبارة التأكيد')
    } catch {
      toast.error('تعذّر النسخ — انسخ يدوياً')
    }
  }

  const handleDelete = async () => {
    if (!canDelete) return
    setIsDeleting(true)
    try {
      const res = await fetch('/api/user/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: confirmation.trim() }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        message?: string
      }

      if (!res.ok) {
        toast.error(data.message || data.error || 'فشل حذف الحساب')
        return
      }

      queryClient.clear()
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(EDITOR_SESSION_KEY)
      }
      toast.success('تم حذف حسابك نهائياً')
      setOpen(false)
      router.push('/')
      router.refresh()
    } catch {
      toast.error('فشل حذف الحساب. حاول مرة أخرى.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Button type="button" variant="destructive" onClick={() => setOpen(true)}>
        حذف الحساب
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md gap-0 p-0 sm:p-0" dir="rtl">
          <DialogHeader className="gap-3 space-y-0 px-6 pt-6 pb-4 pe-12 text-start sm:text-start">
            <DialogTitle className="text-destructive leading-snug">
              حذف الحساب نهائياً
            </DialogTitle>
            <DialogDescription className="text-start leading-relaxed">
              هذا الإجراء لا رجعة فيه. سيتم حذف بياناتك واشتراكك وسجل التحسينات بشكل
              دائم. لن تتمكن من استعادة الحساب بعد التأكيد.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 px-6 py-4">
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-5 text-sm text-foreground dark:bg-destructive/10">
              <p className="mb-3 font-medium">للتأكيد، اكتب اسم العرض التالي بالضبط:</p>
              <div className="flex items-center gap-3">
                <code
                  className="flex-1 rounded-md border border-border bg-muted px-3 py-2.5 text-base font-semibold tracking-wide dark:bg-muted/80"
                  dir="auto"
                >
                  {phrase}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={() => void handleCopyPhrase()}
                  aria-label="نسخ عبارة التأكيد"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-2.5">
              <Label htmlFor="delete-confirm">أدخل اسم العرض هنا</Label>
              <Input
                id="delete-confirm"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder={phrase}
                autoComplete="off"
                disabled={isDeleting}
                className={cn(
                  confirmation.length > 0 &&
                    confirmation.trim() !== phrase &&
                    'border-destructive focus-visible:ring-destructive/30'
                )}
                dir="auto"
              />
              {confirmation.length > 0 && confirmation.trim() !== phrase ? (
                <p className="text-xs text-destructive">النص لا يطابق اسم العرض أعلاه.</p>
              ) : null}
            </div>
          </div>

          <DialogFooter className="flex-col gap-3 px-6 pb-6 pt-4 sm:flex-row sm:justify-end sm:gap-3 [&>button]:w-full sm:[&>button]:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isDeleting}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={!canDelete}
              onClick={() => void handleDelete()}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  جاري الحذف…
                </>
              ) : (
                'حذف حسابي نهائياً'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
