"use client"

import * as React from "react"
import { cn } from "../lib/utils"

export type TextDemoPair = {
  input: string
  output: string
}

type TextDemoCarouselProps = {
  pairs: TextDemoPair[]
  intervalMs?: number
  className?: string
  inputLabel?: string
  outputLabel?: string
}

export function TextDemoCarousel({
  pairs,
  intervalMs = 4000,
  className,
  inputLabel = "النص الأصلي",
  outputLabel = "بعد التحسين",
}: TextDemoCarouselProps) {
  const [index, setIndex] = React.useState(0)
  const [direction, setDirection] = React.useState<"up" | "down">("up")
  const pair = pairs[index] ?? pairs[0]

  React.useEffect(() => {
    if (pairs.length <= 1) return
    const id = window.setInterval(() => {
      setDirection("up")
      setIndex((i) => (i + 1) % pairs.length)
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [pairs.length, intervalMs])

  if (!pair) return null

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 p-6 shadow-xl shadow-black/25 backdrop-blur-sm",
        className
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{inputLabel}</span>
        <span className="text-primary">→</span>
        <span>{outputLabel}</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <DemoPane
          key={`in-${index}`}
          direction={direction}
          label={inputLabel}
          text={pair.input}
          variant="input"
        />
        <DemoPane
          key={`out-${index}`}
          direction={direction}
          label={outputLabel}
          text={pair.output}
          variant="output"
        />
      </div>
      {pairs.length > 1 && (
        <div className="mt-4 flex justify-center gap-1.5">
          {pairs.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`عرض المثال ${i + 1}`}
              onClick={() => {
                setDirection(i > index ? "up" : "down")
                setIndex(i)
              }}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/70"
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function DemoPane({
  text,
  label,
  variant,
  direction,
}: {
  text: string
  label: string
  variant: "input" | "output"
  direction: "up" | "down"
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm leading-relaxed",
        variant === "input"
          ? "border-border/40 bg-background/50 text-muted-foreground"
          : "border-primary/30 bg-primary/10 text-foreground",
        direction === "up" ? "animate-carousel-up" : "animate-carousel-down"
      )}
    >
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      <p dir="auto" className="text-pretty">
        {text}
      </p>
    </div>
  )
}
