"use client"

import * as React from "react"
import { XIcon } from "lucide-react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "./dialog"
import { Textarea } from "./textarea"
import { scrollbarHideClass } from "./lib/scrollbar-hide"
import { cn } from "../lib/utils/cn"

export interface TextExpandDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  value: string
  onChange?: (value: string) => void
  readOnly?: boolean
  placeholder?: string
  onSubmit?: () => void
  charCountLabel?: string
  showCharCount?: boolean
}

export function TextExpandDialog({
  open,
  onOpenChange,
  title,
  value,
  onChange,
  readOnly = false,
  placeholder,
  onSubmit,
  charCountLabel = "حرف",
  showCharCount = true,
}: TextExpandDialogProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (onSubmit && (e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "!flex max-h-[90vh] w-[95vw] max-w-3xl flex-col gap-0 overflow-hidden p-0 border-0 shadow-2xl",
          "sm:max-h-[90vh] sm:max-w-4xl sm:rounded-2xl bg-card"
        )}
        aria-describedby={undefined}
        showCloseButton={false}
      >
        <div className="flex min-h-0 flex-1 flex-col p-6 sm:p-8">
          <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border/50 pb-5">
            <DialogTitle className="min-w-0 flex-1 text-start text-xl font-semibold tracking-tight text-foreground">
              {title}
            </DialogTitle>
            <div className="flex shrink-0 items-center gap-4">
              {showCharCount && (
                <span className="whitespace-nowrap rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {value.length} {charCountLabel}
                </span>
              )}
              <DialogClose
                className="rounded-full bg-muted/50 p-2 text-muted-foreground opacity-70 ring-offset-background transition-all hover:bg-muted hover:text-foreground hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
              >
                <XIcon className="h-5 w-5" />
                <span className="sr-only">إغلاق</span>
              </DialogClose>
            </div>
          </header>
          <div className="mt-6 flex min-h-[50vh] flex-1 flex-col overflow-hidden rounded-xl border border-border/60 bg-muted/30 p-1 shadow-inner">
            <Textarea
              dir="auto"
              value={value}
              onChange={onChange ? (e) => onChange(e.target.value) : undefined}
              readOnly={readOnly}
              placeholder={placeholder}
              onKeyDown={handleKeyDown}
              className={cn(
                "h-full min-h-[40vh] w-full flex-1 resize-none border-0 bg-transparent p-5 text-base shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 sm:text-base leading-relaxed text-foreground",
                scrollbarHideClass
              )}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
