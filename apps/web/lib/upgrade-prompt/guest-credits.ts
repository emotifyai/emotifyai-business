import { GUEST_FREE_ATTEMPTS, GUEST_PRICING } from '@emotifyai/config/pricing'
import { v4 as uuidv4 } from 'uuid'

const GUEST_STORAGE_KEY = GUEST_PRICING.storageKey
export const GUEST_CREDIT_LIMIT = GUEST_FREE_ATTEMPTS

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

export function getGuestToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (parsed?.token) return parsed.token
    
    // Generate one if it doesn't exist
    const token = uuidv4()
    localStorage.setItem(
      GUEST_STORAGE_KEY,
      JSON.stringify({ ...(parsed || { used: 0 }), token })
    )
    return token
  } catch {
    return null
  }
}

export function clearGuestToken(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(GUEST_STORAGE_KEY)
  } catch {}
}

export function getGuestCreditsRemaining(): number {
  return Math.max(0, GUEST_CREDIT_LIMIT - getGuestCreditsUsed())
}

export function consumeGuestCredit(): boolean {
  if (typeof window === 'undefined') return false
  const used = getGuestCreditsUsed()
  if (used >= GUEST_CREDIT_LIMIT) return false
  const token = getGuestToken()
  localStorage.setItem(
    GUEST_STORAGE_KEY,
    JSON.stringify({ used: used + 1, updatedAt: new Date().toISOString(), token })
  )
  return true
}

export function isGuestCreditsExhausted(): boolean {
  return getGuestCreditsRemaining() <= 0
}
