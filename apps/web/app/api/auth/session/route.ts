import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/auth/session
 * Validates the current session and returns user data
 */
export async function GET(request: NextRequest) {
    try {
        console.log('🦆 DUCK: Session API called')
        
        // Check cookies
        const cookies = request.cookies
        console.log('🦆 DUCK: Request cookies:', cookies.getAll().map(c => ({ name: c.name, hasValue: !!c.value })))
        
        const supabase = await createClient()

        const { data: { user, session }, error } = await supabase.auth.getUser()
        console.log('🦆 DUCK: Supabase getUser result - user:', !!user, 'session:', !!session, 'error:', error)
        
        if (error) {
            console.log('🦆 DUCK: Supabase error details:', error)
        }

        if (error || !user || !session) {
            console.log('🦆 DUCK: Session validation failed - returning invalid')
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
                name: profile?.full_name || user.email?.split('@')[0] || 'User',
                avatar: profile?.avatar_url || user.user_metadata?.avatar_url || null,
            },
            token: session.access_token,
        }
        console.log('🦆 DUCK: Session API returning valid session with token:', !!session.access_token)
        return NextResponse.json(responseData)
    } catch (error) {
        console.error('Session validation error:', error)
        return NextResponse.json({
            valid: false,
        })
    }
}
