'use client'

import { useCallback } from 'react'
import confetti from 'canvas-confetti'

// ---------------------------------------------------------------------------
// Shared confetti presets
// ---------------------------------------------------------------------------

/**
 * Celebratory burst: two cannons firing from the bottom corners.
 * Best for milestone moments (first enhance, purchase).
 */
export function fireCelebrationConfetti() {
  const count = 220
  const defaults = {
    origin: { y: 0.8 },
    zIndex: 9999,
  }

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    })
  }

  // Left cannon
  fire(0.25, { spread: 26, startVelocity: 55, origin: { x: 0.1, y: 0.8 } })
  fire(0.2,  { spread: 60,                    origin: { x: 0.1, y: 0.8 } })
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, origin: { x: 0.1, y: 0.8 } })
  fire(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, origin: { x: 0.1, y: 0.8 } })
  fire(0.1,  { spread: 120, startVelocity: 45, origin: { x: 0.1, y: 0.8 } })

  // Right cannon (slight delay for staggered feel)
  setTimeout(() => {
    fire(0.25, { spread: 26, startVelocity: 55, origin: { x: 0.9, y: 0.8 } })
    fire(0.2,  { spread: 60,                    origin: { x: 0.9, y: 0.8 } })
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, origin: { x: 0.9, y: 0.8 } })
    fire(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, origin: { x: 0.9, y: 0.8 } })
    fire(0.1,  { spread: 120, startVelocity: 45, origin: { x: 0.9, y: 0.8 } })
  }, 150)
}

/**
 * School-pride style: continuous streams from both sides for 3 seconds.
 * Best for the payment thank-you page.
 */
export function fireSchoolPrideConfetti() {
  const end = Date.now() + 3 * 1000
  const colors = ['#10b981', '#6ee7b7', '#34d399', '#fff', '#a7f3d0']

  let frame: number

  function frame_() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
      zIndex: 9999,
    })
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
      zIndex: 9999,
    })

    if (Date.now() < end) {
      frame = requestAnimationFrame(frame_)
    }
  }

  frame_()

  // Cleanup safety: cancel after 4 seconds no matter what
  setTimeout(() => cancelAnimationFrame(frame), 4000)
}

// ---------------------------------------------------------------------------
// localStorage key for first-enhance tracking (per account identity)
// ---------------------------------------------------------------------------
function getFirstEnhanceKey(userId?: string | null): string {
  // Guests share one key; authenticated users get their own
  return `emotifyai:first_enhance_done:${userId ?? 'guest'}`
}

/**
 * Hook: fires celebration confetti only on the very first successful
 * enhancement the user has ever made, scoped by account identity.
 *
 * @param userId - Supabase user id for authenticated users, or null/undefined for guests
 *
 * Returns a `markFirstEnhance` callback — call it right after a successful
 * enhance response.
 */
export function useFirstEnhanceConfetti(userId?: string | null) {
  const markFirstEnhance = useCallback(() => {
    if (typeof window === 'undefined') return
    const key = getFirstEnhanceKey(userId)
    if (localStorage.getItem(key)) return // already celebrated for this account

    localStorage.setItem(key, '1')
    fireCelebrationConfetti()
  }, [userId])

  return { markFirstEnhance }
}
