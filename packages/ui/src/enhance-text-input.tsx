"use client"



import * as React from "react"

import { cva, type VariantProps } from "class-variance-authority"

import { Maximize2 } from "lucide-react"

import { cn } from "../lib/utils/cn"

import { scrollbarHideClass } from "./lib/scrollbar-hide"

import { TextExpandDialog } from "./text-expand-dialog"

import { Button } from "./button"

import { Textarea } from "./textarea"



const enhanceTextInputVariants = cva("w-full", {

  variants: {

    variant: {

      editor: "",

      hero: "",

      default: "",

    },

  },

  defaultVariants: {

    variant: "editor",

  },

})



const textareaVariants = cva(

  "w-full resize-none ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",

  {

    variants: {

      variant: {

        editor:

          "min-h-[280px] max-h-[280px] text-sm border-2 border-gray-300 dark:border-border bg-gray-50/30 dark:bg-background focus:bg-white dark:focus:bg-background rounded-md px-3 py-3",

        hero: "min-h-[2.5rem] max-h-32 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-start text-base sm:text-lg py-1 px-0 rounded-none",

        default:

          "min-h-[120px] text-base border border-input bg-background rounded-md px-3 py-3 sm:min-h-[80px] sm:py-2 sm:text-sm",

      },

    },

    defaultVariants: {

      variant: "editor",

    },

  }

)



export interface EnhanceTextInputProps

  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange">,

    VariantProps<typeof enhanceTextInputVariants> {

  value: string

  onChange: (value: string) => void

  showCharCount?: boolean

  charCountLabel?: string

  headerSlot?: React.ReactNode

  onSubmit?: () => void

  textareaClassName?: string

  /** Show expand-to-fullscreen control (default: true for editor variant). */

  expandable?: boolean

  expandTitle?: string

}



export const EnhanceTextInput = React.forwardRef<HTMLTextAreaElement, EnhanceTextInputProps>(

  (

    {

      value,

      onChange,

      variant = "editor",

      showCharCount,

      charCountLabel = "حرف",

      headerSlot,

      onSubmit,

      className,

      textareaClassName,

      expandable,

      expandTitle = "النص الأصلي",

      placeholder = "اكتب أو الصق النص، أو استخدم إضافة المتصفح لتحديد النص…",

      ...props

    },

    ref

  ) => {

    const resolvedShowCharCount = showCharCount ?? variant === "editor"

    const resolvedExpandable = expandable ?? variant === "editor"

    const [expandOpen, setExpandOpen] = React.useState(false)



    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {

      if (onSubmit && (e.ctrlKey || e.metaKey) && e.key === "Enter") {

        e.preventDefault()

        onSubmit()

      }

      props.onKeyDown?.(e)

    }



    return (

      <div className={cn(enhanceTextInputVariants({ variant }), className)}>

        {(headerSlot || resolvedShowCharCount || resolvedExpandable) && variant === "editor" && (

          <div className="mb-2 flex items-center justify-between gap-2">

            {headerSlot ? <div className="min-w-0 flex-1">{headerSlot}</div> : <span />}

            <div className="flex shrink-0 items-center gap-1">

              {resolvedShowCharCount && (

                <span className="text-xs text-muted-foreground">

                  {value.length} {charCountLabel}

                </span>

              )}

              {resolvedExpandable && (

                <Button

                  type="button"

                  variant="ghost"

                  size="icon"

                  className="h-9 w-9 sm:h-8 sm:w-8"

                  onClick={() => setExpandOpen(true)}

                  aria-label="توسيع النص"

                >

                  <Maximize2 className="h-4 w-4" />

                </Button>

              )}

            </div>

          </div>

        )}

        <Textarea

          ref={ref}

          dir="auto"

          value={value}

          onChange={(e) => onChange(e.target.value)}

          onKeyDown={handleKeyDown}

          placeholder={placeholder}

          className={cn(

            textareaVariants({ variant }),

            variant === "editor" && scrollbarHideClass,

            textareaClassName

          )}

          {...props}

        />

        {resolvedShowCharCount && variant === "hero" && value.length > 0 && (

          <p className="mt-1 text-end text-xs text-muted-foreground">

            {value.length} {charCountLabel}

          </p>

        )}

        {resolvedExpandable && (

          <TextExpandDialog

            open={expandOpen}

            onOpenChange={setExpandOpen}

            title={expandTitle}

            value={value}

            onChange={onChange}

            placeholder={placeholder}

            onSubmit={onSubmit}

            charCountLabel={charCountLabel}

            showCharCount={resolvedShowCharCount}

          />

        )}

      </div>

    )

  }

)

EnhanceTextInput.displayName = "EnhanceTextInput"


