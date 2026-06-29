'use client'

import { sendGAEvent } from '@next/third-parties/google'
import { TIER_DEFINITIONS, type SubscriptionTierId } from '@emotifyai/config/pricing'

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

/**
 * Purchase completed — fires the standard GA4 `purchase` event.
 * Reads the fixed USD price from pricing config based on tier.
 */
export function trackPurchase(tier: SubscriptionTierId, transactionId: string): void {
  const def = TIER_DEFINITIONS[tier]
  if (!def) return

  trackGAEvent('purchase', {
    transaction_id: transactionId,
    value: def.priceUsd,
    currency: 'USD',
    items: [
      {
        item_id: tier,
        item_name: def.labelEn,
        price: def.priceUsd,
        quantity: 1,
      },
    ],
  })
}
