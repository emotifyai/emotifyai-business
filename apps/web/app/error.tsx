'use client'

import { useEffect } from 'react'
import { Button } from '@emotifyai/ui'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground">
            <div className="mx-auto flex max-w-[500px] flex-col items-center justify-center text-center">
                <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
                    <AlertTriangle className="h-12 w-12 text-destructive" />
                </div>
                <h1 className="mb-4 text-4xl font-bold tracking-tight">حدث خطأ ما!</h1>
                <p className="mb-8 text-lg text-muted-foreground">
                    نعتذر عن الإزعاج. حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Button onClick={() => reset()} variant="default">
                        <RefreshCcw className="ms-2 h-4 w-4" />
                        إعادة المحاولة
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/">
                            <Home className="ms-2 h-4 w-4" />
                            الصفحة الرئيسية
                        </Link>
                    </Button>
                </div>
                {error.digest && (
                    <p className="mt-8 text-xs text-muted-foreground">
                        معرّف الخطأ: {error.digest}
                    </p>
                )}
            </div>
        </div>
    )
}
