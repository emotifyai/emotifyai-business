'use client'

import Link from 'next/link'
import { Button } from '@emotifyai/ui'
import { FileQuestion, Home, ArrowRight } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground">
            <div className="mx-auto flex max-w-[500px] flex-col items-center justify-center text-center">
                <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                    <FileQuestion className="h-12 w-12 text-muted-foreground" />
                </div>
                <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-6xl">٤٠٤</h1>
                <h2 className="mb-4 text-2xl font-semibold tracking-tight">الصفحة غير موجودة</h2>
                <p className="mb-8 text-lg text-muted-foreground">
                    عذراً، لم نتمكن من العثور على الصفحة المطلوبة. ربما نُقلت أو حُذفت أو لم تُنشأ من الأساس.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Button variant="outline" asChild>
                        <Link href="/">
                            <Home className="ms-2 h-4 w-4" />
                            الصفحة الرئيسية
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        type="button"
                        onClick={() => window.history.back()}
                    >
                        <ArrowRight className="ms-2 h-4 w-4" />
                        رجوع
                    </Button>
                </div>
            </div>
        </div>
    )
}
