import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware helper for Supabase authentication
 * Refreshes the user's session and manages cookies
 */
export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key',
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                    })
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) => {
                        supabaseResponse.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protected routes
    const protectedPaths = ['/dashboard', '/settings', '/billing']
    const isProtectedPath = protectedPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path)
    )

    // Auth routes (redirect away if already authenticated)
    const authPaths = ['/login', '/signup']
    const isAuthPath = authPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path)
    )

    // Redirect unauthenticated users to login
    if (isProtectedPath && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirectTo', request.nextUrl.pathname)
        return NextResponse.redirect(url)
    }

    // Redirect authenticated users away from auth pages
    if (isAuthPath && user) {
        const url = request.nextUrl.clone()
        
        // Special handling for extension signup flow
        if (request.nextUrl.searchParams.get('source') === 'extension') {
            url.pathname = '/auth/extension-success'
            // Preserve the redirect_to parameter if it exists
            const redirectTo = request.nextUrl.searchParams.get('redirect_to')
            if (redirectTo) {
                url.searchParams.set('redirect_to', redirectTo)
            }
        } else {
            url.pathname = '/dashboard'
        }
        
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
