import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { GUEST_FREE_ATTEMPTS } from '@emotifyai/config/pricing'
import { env } from '@/lib/env'

/**
 * Upstash Redis client — credentials validated at startup by T3 env.
 * Any misconfiguration throws immediately rather than silently bypassing.
 */
const redis = new Redis({
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
