"use client"

import * as React from "react"
import { Sparkles, ArrowLeft } from "lucide-react"
import { cn } from "../lib/utils"
import { Button } from "./button"
import { Progress } from "./progress"
import {
  getUpgradePromptContent,
} from "./upgrade-prompt-content"
import type { UpgradePromptLayout, UpgradePromptVariant } from "./upgrade-prompt-types"

export type { UpgradePromptVariant, UpgradePromptLayout } from "./upgrade-prompt-types"
export { UPGRADE_PROMPT_CONTENT, getUpgradePromptContent } from "./upgrade-prompt-content"

export type UpgradePromptProps = {
  variant: UpgradePromptVariant
  layout?: UpgradePromptLayout
  creditsUsed?: number
  creditsLimit?: number
  remainingCredits?: number
  className?: string
  primaryAction?: React.ReactNode
  secondaryAction?: React.ReactNode
  onPrimaryClick?: () => void
  onSecondaryClick?: () => void
  /** Hide secondary CTA row */
  compact?: boolean
}

export function UpgradePrompt({
  variant,
  layout = "card",
  creditsUsed,
  creditsLimit,
  remainingCredits,
  className,
  primaryAction,
  secondaryAction,
  onPrimaryClick,
  onSecondaryClick,
  compact = false,
}: UpgradePromptProps) {
  const content = getUpgradePromptContent(variant)
  const limit = creditsLimit ?? content.defaultLimit ?? 0
  const used =
    creditsUsed !== undefined
      ? creditsUsed
      : limit > 0 && remainingCredits !== undefined
        ? Math.max(0, limit - remainingCredits)
        : 0
  const progressValue =
    limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 100

  const isOverlay = layout === "overlay"
  const isBestPlan = variant === "best_plan"

  return (
    <div
      dir="rtl"
      role="region"
      aria-labelledby="upgrade-prompt-heading"
      className={cn(
        "text-right font-sans",
        isOverlay &&
          "absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/80 p-4 backdrop-blur-md sm:p-6",
        className
      )}
    >
      <div
        className={cn(
          "w-full max-w-md rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-lg sm:p-6",
          isOverlay && "shadow-xl",
          !isOverlay && "mx-auto"
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-full",
              isBestPlan
                ? "bg-primary/15 text-primary"
                : "bg-primary/20 text-primary"
            )}
          >
            <Sparkles className="size-5" aria-hidden />
          </div>
          {content.badge && (
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
              {content.badge}
            </span>
          )}
        </div>

        <h3
          id="upgrade-prompt-heading"
          className="mb-2 text-lg font-bold leading-snug text-foreground sm:text-xl"
        >
          {content.headline}
        </h3>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          {content.subtext}
        </p>

        {content.showProgress && limit > 0 && (
          <div className="mb-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>الاستخدام</span>
              <span className="tabular-nums font-medium text-foreground">
                {used} / {limit}
              </span>
            </div>
            <Progress
              value={progressValue}
              className="h-2 bg-muted"
              indicatorClassName="bg-primary"
            />
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          {primaryAction ?? (
            <Button
              type="button"
              variant="default"
              className="w-full min-h-11 font-semibold"
              onClick={onPrimaryClick}
            >
              {content.primaryCta}
            </Button>
          )}
          {!compact &&
            (secondaryAction ?? (
              <Button
                type="button"
                variant="ghost"
                className="w-full min-h-10 text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={onSecondaryClick}
              >
                <ArrowLeft className="ms-1 size-4 rotate-180" aria-hidden />
                {content.secondaryCta}
              </Button>
            ))}
        </div>
      </div>
    </div>
  )
}
