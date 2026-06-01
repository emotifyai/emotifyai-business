'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { getFallbackAvatarUrl, resolveAvatarSrc } from '@/lib/avatar'

const sizeClasses = {
    sm: 'size-8',
    md: 'size-9',
    lg: 'size-12',
} as const

export type UserAvatarProps = {
    avatarUrl?: string | null
    seed: string
    alt?: string
    className?: string
    size?: keyof typeof sizeClasses
}

export function UserAvatar({
    avatarUrl,
    seed,
    alt = '',
    className,
    size = 'md',
}: UserAvatarProps) {
    const fallbackSrc = getFallbackAvatarUrl(seed)
    const [src, setSrc] = useState(() => resolveAvatarSrc(avatarUrl, seed))

    useEffect(() => {
        setSrc(resolveAvatarSrc(avatarUrl, seed))
    }, [avatarUrl, seed])

    const handleError = () => {
        setSrc((current) => (current === fallbackSrc ? current : fallbackSrc))
    }

    return (
        <img
            src={src}
            alt={alt}
            onError={handleError}
            className={cn(
                'aspect-square shrink-0 rounded-full object-cover',
                sizeClasses[size],
                className
            )}
        />
    )
}
