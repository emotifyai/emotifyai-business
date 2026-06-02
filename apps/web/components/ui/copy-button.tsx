'use client'

import { useState, useCallback } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@emotifyai/ui'
import { toast } from '@emotifyai/ui'
import { trackCopyClicked } from '@/lib/analytics/ga'

/**
 * Hook: manages copy-to-clipboard state with a brief "copied" flash.
 * @param track - whether to fire the GA `trackCopyClicked` event on success
 */
export function useCopy(track = false) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        if (track) trackCopyClicked()
        setCopied(true)
        toast.success('تم النسخ!')
        setTimeout(() => setCopied(false), 2000)
      } catch {
        toast.error('فشل النسخ')
      }
    },
    [track]
  )

  return { copied, copy }
}

// ---------------------------------------------------------------------------
// CopyButton – drop-in icon button with animated ✓ feedback
// ---------------------------------------------------------------------------

interface CopyButtonProps {
  text: string
  /** Fire GA copy event (default: false) */
  track?: boolean
  /** Size of the icon, in tailwind units (default: 4) */
  iconSize?: number
  className?: string
  label?: string
}

export function CopyButton({
  text,
  track = false,
  iconSize = 4,
  className,
  label = 'نسخ',
}: CopyButtonProps) {
  const { copied, copy } = useCopy(track)

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => copy(text)}
      aria-label={copied ? 'تم النسخ' : label}
      className={className}
    >
      <span
        className={`transition-all duration-300 ${copied ? 'scale-110 text-primary' : 'text-muted-foreground'}`}
      >
        {copied ? (
          <Check className={`size-${iconSize}`} />
        ) : (
          <Copy className={`size-${iconSize}`} />
        )}
      </span>
      <span className="sr-only">{copied ? 'تم النسخ' : label}</span>
    </Button>
  )
}
