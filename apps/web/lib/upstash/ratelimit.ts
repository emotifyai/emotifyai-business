import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'
import { GUEST_FREE_ATTEMPTS } from '@emotifyai/config/pricing'
import { env } from '@/lib/env'

/**
 * Upstash Redis client — credentials validated at startup by T3 env.
 * Any misconfiguration throws immediately rather than silently bypassing.
 */
export const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
})

/**
 * Guest rate limiter: GUEST_FREE_ATTEMPTS per IP lifetime (365-day window).
 * Uses a fixed window so credits never reset unless manually cleared in Redis.
 */
export const guestRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(GUEST_FREE_ATTEMPTS, '365 d'),
    analytics: true,
    prefix: 'emotifyai:ratelimit:guest',
})

export async function checkGuestRateLimit(
    ip: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
    const result = await guestRateLimit.limit(`ip_${ip}`)
    return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
    }
}

// ---------------------------------------------------------------------------
// Guest Session — tracks usage by a per-browser token (not just IP)
// ---------------------------------------------------------------------------

const GUEST_SESSION_PREFIX = 'emotifyai:guest_session:'
/** TTL: 30 days. Enough for a user to sign up after trying. */
const GUEST_SESSION_TTL_SECONDS = 30 * 24 * 60 * 60

interface GuestSessionData {
    used: number
    merged: boolean
}

function sessionKey(token: string): string {
    return `${GUEST_SESSION_PREFIX}${token}`
}

/**
 * Record one enhancement usage against a guest session token.
 * Creates the session if it doesn't exist yet.
 * Returns the updated session data.
 */
export async function recordGuestSessionUsage(
    token: string
): Promise<GuestSessionData> {
    const key = sessionKey(token)
    const existing = await redis.get<GuestSessionData>(key)

    const updated: GuestSessionData = {
        used: (existing?.used ?? 0) + 1,
        merged: existing?.merged ?? false,
    }

    await redis.set(key, updated, { ex: GUEST_SESSION_TTL_SECONDS })
    return updated
}

/**
 * Read how many enhancements were used under a guest session token.
 * Returns null if the token doesn't exist or was already merged.
 */
export async function getGuestSessionUsage(
    token: string
): Promise<GuestSessionData | null> {
    return redis.get<GuestSessionData>(sessionKey(token))
}

/**
 * Mark a guest session as merged so it cannot be applied twice.
 * Returns the number of credits that were consumed before merging, or 0 if
 * the session didn't exist / was already merged.
 */
export async function consumeGuestSession(token: string): Promise<number> {
    const key = sessionKey(token)
    const session = await redis.get<GuestSessionData>(key)

    if (!session || session.merged) return 0

    const creditsUsed = session.used
    await redis.set(
        key,
        { ...session, merged: true },
        { ex: GUEST_SESSION_TTL_SECONDS }
    )
    return creditsUsed
}
