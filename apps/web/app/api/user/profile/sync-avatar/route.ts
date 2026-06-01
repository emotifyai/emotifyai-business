import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOAuthAvatarUrl } from '@/lib/auth/oauth-avatar'
import { syncProfileAvatarFromAuth } from '@/lib/auth/sync-profile-avatar'

/**
 * POST /api/user/profile/sync-avatar
 * Backfill profiles.avatar_url from OAuth metadata for existing users.
 */
export async function POST() {
    try {
        const supabase = await createClient()
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const oauthAvatar = getOAuthAvatarUrl(user)
        if (!oauthAvatar) {
            return NextResponse.json({ synced: false, avatar_url: null })
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', user.id)
            .single()

        const storedAvatar = (profile as { avatar_url?: string | null } | null)?.avatar_url
        if (storedAvatar === oauthAvatar) {
            return NextResponse.json({ synced: false, avatar_url: oauthAvatar })
        }

        const avatar_url = await syncProfileAvatarFromAuth(supabase, user.id, user)
        return NextResponse.json({ synced: true, avatar_url })
    } catch (error) {
        console.error('sync-avatar error:', error)
        return NextResponse.json({ error: 'Failed to sync avatar' }, { status: 500 })
    }
}
