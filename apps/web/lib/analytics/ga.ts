'use client'

import { sendGAEvent } from '@next/third-parties/google'

function isGADebugMode(): boolean {
  if (process.env.NODE_ENV === 'development') return true
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'development') return true
  return false
}

/** Central GA4 event helper — all client analytics should go through here. */
export function trackGAEvent(event: string, params?: Record<string, unknown>): void {
  sendGAEvent({
    event,
    ...params,
    ...(isGADebugMode() ? { debug_mode: true } : {}),
  })
}

/** Free retry submitted — `value` is the Arabic label (e.g. "آلياً"). */
export function trackRetryUsed(feedbackReasonLabel: string): void {
  sendGAEvent({
    event: 'retry_used',
    value: feedbackReasonLabel,
    ...(isGADebugMode() ? { debug_mode: true } : {}),
  })
}

export function trackTransformCompleted(): void {
  trackGAEvent('transform_completed')
}

export function trackCopyClicked(): void {
  trackGAEvent('copy_clicked')
}

export function trackShareClicked(): void {
  trackGAEvent('share_clicked')
}

export function trackUpgradeClicked(source?: string): void {
  trackGAEvent('upgrade_clicked', source ? { source } : undefined)
}

export function trackBundlePurchased(tier: string): void {
  trackGAEvent('bundle_purchased', { tier })
}
