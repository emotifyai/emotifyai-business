/** Fallback avatars: DiceBear fun-emoji — https://api.dicebear.com/7.x/fun-emoji/svg?seed=... */
export function getFallbackAvatarUrl(seed: string): string {
    return `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(seed)}`
}

export function resolveAvatarSrc(
    avatarUrl: string | null | undefined,
    seed: string
): string {
    return avatarUrl?.trim() || getFallbackAvatarUrl(seed)
}
