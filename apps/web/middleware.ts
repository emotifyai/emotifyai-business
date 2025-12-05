import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Rate limiting map (in-memory, use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT = {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
}

function rateLimit(ip: string): boolean {
    const now = Date.now()
    const record = rateLimitMap.get(ip)

    if (!record || now > record.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT.windowMs })
        return true
    }

    if (record.count >= RATE_LIMIT.maxRequests) {
        return false
    }

    record.count++
    return true
}

export async function middleware(request: NextRequest) {
    const startTime = Date.now()
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const path = request.nextUrl.pathname

    // Rate limiting for API routes
    if (path.startsWith('/api/') && !path.startsWith('/api/webhooks/')) {
        if (!rateLimit(ip)) {
            console.warn(`[Middleware] Rate limit exceeded for IP: ${ip}`)
            return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429, headers: { 'Retry-After': '60' } }
            )
        }
    }

    // Update Supabase session
    const response = await updateSession(request)

    // Add security headers
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

    // Logging
    const duration = Date.now() - startTime
    console.log(`[Middleware] ${request.method} ${path} - ${response.status} (${duration}ms)`)

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
