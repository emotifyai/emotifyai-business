'use client'

import { useEffect, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { Button } from '@emotifyai/ui'
import { Input } from '@emotifyai/ui'
import { Label } from '@emotifyai/ui'
import { UserAvatar } from '@/components/user-avatar'
import { useUpdateProfile } from '@/lib/hooks/use-auth'
import { toast } from '@emotifyai/ui'
import { cn } from '@/lib/utils'

type ProfileSettingsFormProps = {
  userId: string
  email: string
  displayName: string
  avatarUrl: string | null
}

type SaveVisual = 'idle' | 'saving' | 'saved'

export function ProfileSettingsForm({
  userId,
  email,
  displayName: initialDisplayName,
  avatarUrl,
}: ProfileSettingsFormProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [saveVisual, setSaveVisual] = useState<SaveVisual>('idle')
  const updateProfile = useUpdateProfile()

  useEffect(() => {
    setDisplayName(initialDisplayName)
  }, [initialDisplayName])

  useEffect(() => {
    if (saveVisual !== 'saved') return
    const timer = window.setTimeout(() => setSaveVisual('idle'), 2500)
    return () => window.clearTimeout(timer)
  }, [saveVisual])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (saveVisual === 'saving') return

    const trimmed = displayName.trim()
    if (!trimmed) {
      toast.error('أدخل اسم العرض')
      return
    }

    if (trimmed === initialDisplayName.trim()) {
      toast.message('لا توجد تغييرات للحفظ')
      return
    }

    setSaveVisual('saving')
    try {
      await updateProfile.mutateAsync({ displayName: trimmed })
      setSaveVisual('saved')
      toast.success('تم حفظ الملف الشخصي')
    } catch (err) {
      setSaveVisual('idle')
      toast.error(err instanceof Error ? err.message : 'فشل حفظ التغييرات')
    }
  }

  const isSaved = saveVisual === 'saved'
  const isSaving = saveVisual === 'saving'

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <div className="flex items-center gap-4">
        <UserAvatar
          avatarUrl={avatarUrl}
          seed={userId || email}
          alt={displayName || 'مستخدم'}
          size="lg"
        />
        <p className="text-sm text-muted-foreground">
          صورة ملفك من مزود تسجيل الدخول أو رمز تعبيري تلقائي
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="name">اسم العرض</Label>
        <Input
          id="name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={isSaving}
          dir="auto"
          maxLength={80}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input id="email" value={email} disabled />
      </div>
      <Button
        type="submit"
        disabled={isSaving}
        className={cn(
          'min-w-[10rem] transition-all duration-300',
          isSaved &&
            'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90'
        )}
      >
        {isSaving ? (
          <>
            <Loader2 className="me-2 h-4 w-4 animate-spin" aria-hidden />
            جاري الحفظ…
          </>
        ) : isSaved ? (
          <>
            <span
              className="me-2 inline-flex animate-in zoom-in-50 duration-300"
              aria-hidden
            >
              <Check className="h-5 w-5 stroke-[2.5]" />
            </span>
            تم الحفظ
          </>
        ) : (
          'حفظ التغييرات'
        )}
      </Button>
    </form>
  )
}
