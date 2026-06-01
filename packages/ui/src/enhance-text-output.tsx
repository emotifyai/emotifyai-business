"use client"

import * as React from "react"
import { Maximize2 } from "lucide-react"
import { cn } from "../lib/utils/cn"
import {
  editorTextAreaWrapperClass,
  editorToolbarIconButtonClass,
} from "./lib/editor-text-area-wrapper"
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
  /** Actions shown beside char count in the panel header (copy, share, retry, etc.). */
  trailingActions?: React.ReactNode
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
      trailingActions,
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
      <div className={cn("flex min-h-0 w-full flex-1 flex-col", className)}>
        {(headerSlot || showCharCount || trailingActions || expandable) && (
          <div className="flex shrink-0 items-center justify-between gap-3">
            {headerSlot ? <div className="min-w-0 flex-1">{headerSlot}</div> : <span />}
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
              {showCharCount && (
                <span className="text-xs text-muted-foreground">
                  {value.length} {charCountLabel}
                </span>
              )}
              {trailingActions}
              {expandable && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  title="توسيع"
                  className={editorToolbarIconButtonClass}
                  onClick={() => setExpandOpen(true)}
                  aria-label="توسيع"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
        <div className={editorTextAreaWrapperClass}>
          <Textarea
            ref={ref}
            dir="auto"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "min-h-0 h-full flex-1 resize-none text-base border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none p-0",
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
