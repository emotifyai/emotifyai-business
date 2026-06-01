"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
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
        className="flex max-h-dvh flex-col gap-3 sm:max-h-[min(90dvh,48rem)] sm:max-w-4xl"
        aria-describedby={undefined}
      >
        <DialogHeader className="shrink-0 text-start">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {showCharCount && (
          <p className="shrink-0 text-end text-xs text-muted-foreground">
            {value.length} {charCountLabel}
          </p>
        )}
        <Textarea
          dir="auto"
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          readOnly={readOnly}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          className={cn(
            "min-h-[min(60dvh,32rem)] flex-1 resize-none text-base border-2 border-gray-300 dark:border-border bg-gray-50/30 dark:bg-background focus:bg-white dark:focus:bg-background sm:text-sm",
            scrollbarHideClass
          )}
        />
      </DialogContent>
    </Dialog>
  )
}
