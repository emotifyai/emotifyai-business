import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/auth/callback
 *
 * Handles the redirect from Supabase after the user clicks:
 *   - An email confirmation link
 *   - A password reset link
 *
 * Supabase appends ?code=... to this URL. We exchange the code for a session,
 * then redirect the user to the correct destination.
 */
export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const type = searchParams.get('type') // 'recovery' for password reset
    const next = searchParams.get('next') ?? '/dashboard'

    if (!code) {
        // No code present — redirect to login with an error
        return NextResponse.redirect(`${origin}/login?error=missing_code`)
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
        console.error('[Auth Callback] exchangeCodeForSession error:', error.message)
        return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
    }

    // For password-reset emails, redirect to the update-password page
    if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/update-password`)
    }

    // For all other flows (email confirmation, OAuth, etc.) go to the requested page
    return NextResponse.redirect(`${origin}${next}`)
}
