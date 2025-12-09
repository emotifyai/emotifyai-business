import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/auth/session
 * Validates the current session and returns user data
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
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

        return NextResponse.json({
            valid: true,
            user: {
                id: user.id,
                email: user.email!,
                name: profile?.full_name || user.email?.split('@')[0] || 'User',
                avatar: profile?.avatar_url || user.user_metadata?.avatar_url || null,
            },
        })
    } catch (error) {
        console.error('Session validation error:', error)
        return NextResponse.json({
            valid: false,
        })
    }
}
