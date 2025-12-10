'use client'

import { useEffect } from 'react'
import { Button } from '@ui/button'
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
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
            <div className="mx-auto flex max-w-[500px] flex-col items-center justify-center text-center">
                <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
                    <AlertTriangle className="h-12 w-12 text-destructive" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">Something went wrong!</h1>
                <p className="text-muted-foreground mb-8 text-lg">
                    We apologize for the inconvenience. An unexpected error has occurred.
                </p>
                <div className="flex gap-4">
                    <Button onClick={() => reset()} variant="default">
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Try again
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" />
                            Go Home
                        </Link>
                    </Button>
                </div>
                {error.digest && (
                    <p className="mt-8 text-xs text-muted-foreground">
                        Error ID: {error.digest}
                    </p>
                )}
            </div>
        </div>
    )
}
