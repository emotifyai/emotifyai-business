'use client'

import { Button } from '@emotifyai/ui'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

export default function GlobalError({
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html lang="ar" dir="rtl">
            <body>
                <div className="flex min-h-screen flex-col items-center justify-center bg-white text-black p-4">
                    <div className="mx-auto flex max-w-[500px] flex-col items-center justify-center text-center">
                        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
                            <AlertTriangle className="h-12 w-12 text-red-600" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight mb-4">خطأ حرج</h1>
                        <p className="text-gray-500 mb-8 text-lg">
                            حدث خطأ حرج في تخطيط التطبيق.
                        </p>
                        <Button onClick={() => reset()} variant="default">
                            <RefreshCcw className="me-2 h-4 w-4" />
                            حاول مرة أخرى
                        </Button>
                    </div>
                </div>
            </body>
        </html>
    )
}
