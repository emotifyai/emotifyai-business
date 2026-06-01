import type { User } from '@supabase/supabase-js'

type AvatarUser = Pick<User, 'user_metadata' | 'identities'>

function pickUrl(value: unknown): string | null {
    if (typeof value !== 'string') return null
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
}

/** OAuth providers (e.g. Google) often use `picture` instead of `avatar_url` in user_metadata. */
export function getOAuthAvatarUrl(user: AvatarUser): string | null {
    const meta = user.user_metadata ?? {}

    const fromMeta =
        pickUrl(meta.avatar_url) ??
        pickUrl(meta.picture) ??
        null

    if (fromMeta) return fromMeta

    for (const identity of user.identities ?? []) {
        const data = identity.identity_data as Record<string, unknown> | undefined
        if (!data) continue

        const fromIdentity = pickUrl(data.picture) ?? pickUrl(data.avatar_url)
        if (fromIdentity) return fromIdentity
    }

    return null
}

/** Prefer stored profile URL, then OAuth/session metadata. */
export function resolveUserAvatarUrl(
    profileAvatarUrl: string | null | undefined,
    user: AvatarUser
): string | null {
    return pickUrl(profileAvatarUrl) ?? getOAuthAvatarUrl(user)
}
