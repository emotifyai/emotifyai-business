import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/auth/session
 * Validates the current session and returns user data
 */
export async function GET(request: NextRequest) {
    try {
        // Check cookies
        const cookies = request.cookies
        const supabase = await createClient()

        // Get user first
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
            return NextResponse.json({
                valid: false,
            })
        }

        // Get session to access the token
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) {
        }
        
        if (session) {
        }
        
        if (sessionError || !session) {
            return NextResponse.json({
                valid: false,
            })
        }

        // Get user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        const responseData = {
            valid: true,
            user: {
                id: user.id,
                email: user.email!,
                name: (profile as any)?.display_name || user.email?.split('@')[0] || 'User',
                avatar: (profile as any)?.avatar_url || user.user_metadata?.avatar_url || null,
            },
            token: session.access_token,
        }
        return NextResponse.json(responseData)
    } catch (error) {
        console.error('Session validation error:', error)
        return NextResponse.json({
            valid: false,
        })
    }
}
