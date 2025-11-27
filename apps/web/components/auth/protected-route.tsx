'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/hooks/use-auth'
import { Loader2 } from 'lucide-react'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { data: user, isLoading } = useUser()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login')
        }
    }, [user, isLoading, router])

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!user) {
        return null
    }

    return <>{children}</>
}
