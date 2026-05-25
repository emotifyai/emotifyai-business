import { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'
import { Suspense } from 'react'
import { PageLoading } from '@emotifyai/ui'

export const metadata: Metadata = {
    title: 'تسجيل الدخول - إيموتيفاي',
    description: 'سجّل الدخول إلى حسابك في إيموتيفاي',
}

interface LoginPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function LoginContent({ searchParams }: LoginPageProps) {
    const params = await searchParams
    
    const urlParams = new URLSearchParams()
    if (params.source && typeof params.source === 'string') {
        urlParams.set('source', params.source)
    }
    if (params.redirect_to && typeof params.redirect_to === 'string') {
        urlParams.set('redirect_to', params.redirect_to)
    }
    const signupUrl = urlParams.toString() ? `/signup?${urlParams.toString()}` : '/signup'

    return (
        <>
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    مرحباً بعودتك
                </h1>
                <p className="text-sm text-muted-foreground">
                    سجّل الدخول لمتابعة استخدام إضافة إيموتيفاي
                </p>
            </div>
            <LoginForm />
            <p className="text-center text-sm text-muted-foreground">
                ليس لديك حساب؟{' '}
                <Link
                    href={signupUrl}
                    className="underline underline-offset-4 hover:text-primary"
                >
                    إنشاء حساب
                </Link>
            </p>
        </>
    )
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
    return (
        <Suspense fallback={<PageLoading message="جاري التحميل…" />}>
            <LoginContent searchParams={searchParams} />
        </Suspense>
    )
}
