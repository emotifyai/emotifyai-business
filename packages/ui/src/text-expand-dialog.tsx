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
          "!flex max-h-[90vh] w-[95vw] max-w-3xl flex-col gap-0 overflow-hidden p-6",
          "sm:inset-auto sm:max-h-[90vh] sm:max-w-3xl sm:rounded-xl"
        )}
        aria-describedby={undefined}
        showCloseButton={false}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <header className="flex shrink-0 items-center justify-between gap-3 border-b pb-4">
            <DialogTitle className="min-w-0 flex-1 text-start text-lg font-semibold leading-none">
              {title}
            </DialogTitle>
            <div className="flex shrink-0 items-center gap-3">
              {showCharCount && (
                <span className="whitespace-nowrap text-xs text-muted-foreground">
                  {value.length} {charCountLabel}
                </span>
              )}
              <DialogClose
                className="rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
              >
                <XIcon />
                <span className="sr-only">إغلاق</span>
              </DialogClose>
            </div>
          </header>
          <div className="mt-4 flex min-h-[50vh] flex-1 flex-col overflow-hidden rounded-xl border border-border bg-muted/40 p-5">
            <Textarea
              dir="auto"
              value={value}
              onChange={onChange ? (e) => onChange(e.target.value) : undefined}
              readOnly={readOnly}
              placeholder={placeholder}
              onKeyDown={handleKeyDown}
              className={cn(
                "h-full min-h-[40vh] w-full flex-1 resize-none border-0 bg-transparent p-0 text-base shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 sm:text-sm",
                scrollbarHideClass
              )}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
