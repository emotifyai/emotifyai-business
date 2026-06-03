import { Metadata } from 'next'
import Link from 'next/link'
import { SignupForm } from '@/components/auth/signup-form'
import { Suspense } from 'react'
import { PageLoading } from '@emotifyai/ui'

export const metadata: Metadata = {
    title: 'إنشاء حساب - EmotifyAI',
    description: 'أنشئ حساباً جديداً في EmotifyAI',
}

function SignupContent({
    loginHref = '/login',
}: {
    loginHref?: string
}) {
    return (
        <>
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    إنشاء حساب
                </h1>
                <p className="text-sm text-muted-foreground">
                    سجّل بالبريد — ٥ تحويلات مجانية إضافية
                </p>
            </div>
            <SignupForm />
            <p className="px-8 text-center text-sm text-muted-foreground">
                بالمتابعة، أنت توافق على{' '}
                <Link
                    href="/terms"
                    className="underline underline-offset-4 hover:text-primary"
                >
                    شروط الخدمة
                </Link>{' '}
                و{' '}
                <Link
                    href="/privacy"
                    className="underline underline-offset-4 hover:text-primary"
                >
                    سياسة الخصوصية
                </Link>
                .
            </p>
            <p className="px-8 text-center text-sm text-muted-foreground">
                لديك حساب بالفعل؟{' '}
                <Link
                    href={loginHref}
                    className="underline underline-offset-4 hover:text-primary"
                >
                    تسجيل الدخول
                </Link>
            </p>
        </>
    )
}

interface SignupPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function SignupPageInner({ searchParams }: SignupPageProps) {
    const params = await searchParams
    const urlParams = new URLSearchParams()
    if (params.redirect_to && typeof params.redirect_to === 'string') {
        urlParams.set('redirect_to', params.redirect_to)
    }
    const loginHref = urlParams.toString() ? `/login?${urlParams.toString()}` : '/login'

    return <SignupContent loginHref={loginHref} />
}

export default function SignupPage({ searchParams }: SignupPageProps) {
    return (
        <Suspense fallback={<PageLoading message="جاري التحميل…" />}>
            <SignupPageInner searchParams={searchParams} />
        </Suspense>
    )
}
