import React, { useEffect } from 'react'
import { X, Copy, Twitter, Linkedin, Facebook, Instagram } from 'lucide-react'
import { toast } from '@emotifyai/ui'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  text: string
}

export function ShareModal({ isOpen, onClose, text }: ShareModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const encodedText = encodeURIComponent(text)
  const appUrl = encodeURIComponent('https://emotifyai.com')

  const handleCopy = async (showToast: boolean = true) => {
    try {
      await navigator.clipboard.writeText(text)
      if (showToast) {
        toast.success('تم نسخ النص للمشاركة')
      }
    } catch {
      if (showToast) {
        toast.error('فشل النسخ')
      }
    }
  }

  const handleX = () => {
    window.open(`https://x.com/intent/tweet?text=${encodedText}`, '_blank')
  }

  const handleLinkedIn = () => {
    // LinkedIn requires a URL, but we can pass text in summary/body depending on the endpoint.
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${appUrl}`, '_blank')
  }

  const handleFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${appUrl}&quote=${encodedText}`, '_blank')
  }

  const handleInstagram = async () => {
    await handleCopy(false)
    toast.success('تم نسخ النص! افتح انستجرام للصق.')
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir="rtl">
      <div 
        className="bg-background rounded-3xl shadow-xl w-full max-w-lg p-8 relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute left-6 top-6 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        
        <h2 className="text-xl font-bold mb-6 text-center">مشاركة النص</h2>
        
        <div className="bg-muted/50 p-5 rounded-2xl text-sm mb-8 text-foreground/80 line-clamp-4 leading-relaxed border border-border">
          {text}
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-8">
          <ShareOption icon={<Copy />} label="نسخ النص" onClick={handleCopy} color="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700" />
          <ShareOption icon={<Twitter />} label="X" onClick={handleX} color="bg-[#1DA1F2] text-white hover:bg-[#1a8cd8]" />
          <ShareOption icon={<Linkedin />} label="LinkedIn" onClick={handleLinkedIn} color="bg-[#0A66C2] text-white hover:bg-[#084e96]" />
          <ShareOption icon={<Facebook />} label="Facebook" onClick={handleFacebook} color="bg-[#1877F2] text-white hover:bg-[#166fe5]" />
          <ShareOption icon={<Instagram />} label="Instagram" onClick={handleInstagram} color="bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white hover:opacity-90" />
        </div>
      </div>
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  )
}

function ShareOption({ icon, label, onClick, color }: { icon: React.ReactNode, label: string, onClick: () => void, color: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={onClick}
        className={`h-14 w-14 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-sm ${color}`}
      >
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "h-6 w-6" })}
      </button>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  )
}
