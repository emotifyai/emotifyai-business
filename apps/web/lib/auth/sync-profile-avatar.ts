import type { SupabaseClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'
import { getOAuthAvatarUrl } from '@/lib/auth/oauth-avatar'

type AvatarUser = Pick<User, 'user_metadata' | 'identities'>

/**
 * Persist OAuth profile photo to profiles.avatar_url when available.
 * Updates on each call when an OAuth URL exists (keeps Google photo in sync).
 */
export async function syncProfileAvatarFromAuth(
    supabase: SupabaseClient,
    userId: string,
    user: AvatarUser
): Promise<string | null> {
    const oauthAvatar = getOAuthAvatarUrl(user)
    if (!oauthAvatar) return null

    const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: oauthAvatar })
        .eq('id', userId)

    if (error) throw error
    return oauthAvatar
}
