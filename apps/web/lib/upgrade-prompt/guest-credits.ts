const GUEST_STORAGE_KEY = 'emotifyai_guest_conversions'
export const GUEST_CREDIT_LIMIT = 10

export function getGuestCreditsUsed(): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : { used: 0 }
    return typeof parsed.used === 'number' ? Math.min(parsed.used, GUEST_CREDIT_LIMIT) : 0
  } catch {
    return 0
  }
}

export function getGuestCreditsRemaining(): number {
  return Math.max(0, GUEST_CREDIT_LIMIT - getGuestCreditsUsed())
}

export function consumeGuestCredit(): boolean {
  if (typeof window === 'undefined') return false
  const used = getGuestCreditsUsed()
  if (used >= GUEST_CREDIT_LIMIT) return false
  localStorage.setItem(
    GUEST_STORAGE_KEY,
    JSON.stringify({ used: used + 1, updatedAt: new Date().toISOString() })
  )
  return true
}

export function isGuestCreditsExhausted(): boolean {
  return getGuestCreditsRemaining() <= 0
}
