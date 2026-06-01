"use client"

import * as React from "react"
import { Maximize2 } from "lucide-react"
import { cn } from "../lib/utils/cn"
import { scrollbarHideClass } from "./lib/scrollbar-hide"
import { TextExpandDialog } from "./text-expand-dialog"
import { Button } from "./button"
import { Textarea } from "./textarea"

export interface EnhanceTextOutputProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange"> {
  value: string
  onChange: (value: string) => void
  showCharCount?: boolean
  charCountLabel?: string
  headerSlot?: React.ReactNode
  textareaClassName?: string
  expandable?: boolean
  expandTitle?: string
  /** Content rendered over the textarea (e.g. upgrade prompt). */
  overlay?: React.ReactNode
}

export const EnhanceTextOutput = React.forwardRef<HTMLTextAreaElement, EnhanceTextOutputProps>(
  (
    {
      value,
      onChange,
      showCharCount = true,
      charCountLabel = "حرف",
      headerSlot,
      className,
      textareaClassName,
      expandable = true,
      expandTitle = "النص المحسّن",
      placeholder = "سيظهر النص المحسّن هنا…",
      overlay,
      ...props
    },
    ref
  ) => {
    const [expandOpen, setExpandOpen] = React.useState(false)

    return (
      <div className={cn("w-full", className)}>
        {(headerSlot || showCharCount || expandable) && (
          <div className="mb-2 flex items-center justify-between gap-2">
            {headerSlot ? <div className="min-w-0 flex-1">{headerSlot}</div> : <span />}
            <div className="flex shrink-0 items-center gap-1">
              {showCharCount && (
                <span className="text-xs text-muted-foreground">
                  {value.length} {charCountLabel}
                </span>
              )}
              {expandable && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 sm:h-8 sm:w-8"
                  onClick={() => setExpandOpen(true)}
                  aria-label="توسيع النص المحسّن"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
        <div className="relative">
          <Textarea
            ref={ref}
            dir="auto"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "min-h-[280px] max-h-[280px] resize-none text-sm border-2 border-gray-300 dark:border-border bg-gray-50/30 dark:bg-background focus:bg-white dark:focus:bg-background",
              scrollbarHideClass,
              textareaClassName
            )}
            {...props}
          />
          {overlay}
        </div>
        {expandable && (
          <TextExpandDialog
            open={expandOpen}
            onOpenChange={setExpandOpen}
            title={expandTitle}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            charCountLabel={charCountLabel}
            showCharCount={showCharCount}
          />
        )}
      </div>
    )
  }
)
EnhanceTextOutput.displayName = "EnhanceTextOutput"
