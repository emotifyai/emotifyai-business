'use client'

import { sendGAEvent } from '@next/third-parties/google'

function isGADebugMode(): boolean {
  if (process.env.NODE_ENV === 'development') return true
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'development') return true
  return false
}

function isGAEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID)
}

function safeSendGAEvent(payload: { event: string; [key: string]: unknown }): void {
  if (!isGAEnabled()) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[analytics] GA not configured — event skipped:', payload.event)
    }
    return
  }

  const { event, ...params } = payload
  
  if (typeof window !== 'undefined') {
    sendGAEvent('event', event, params)
  }
}

/** Central GA4 event helper — all client analytics should go through here. */
export function trackGAEvent(event: string, params?: Record<string, unknown>): void {
  safeSendGAEvent({
    event,
    ...params,
    ...(isGADebugMode() ? { debug_mode: true } : {}),
  })
}

/** Free retry submitted — `value` is the Arabic label (e.g. "آلياً"). */
export function trackRetryUsed(feedbackReasonLabel: string): void {
  trackGAEvent('retry_used', { value: feedbackReasonLabel })
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
