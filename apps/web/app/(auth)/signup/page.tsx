import { Metadata } from 'next'
import Link from 'next/link'
import { SignupForm } from '@/components/auth/signup-form'
import { Suspense } from 'react'
import { PageLoading } from '@emotifyai/ui'

export const metadata: Metadata = {
    title: 'إنشاء حساب - إيموتيفاي',
    description: 'أنشئ حساباً جديداً في إيموتيفاي',
}

function SignupContent() {
    return (
        <>
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    إنشاء حساب
                </h1>
                <p className="text-sm text-muted-foreground">
                    ابدأ بتجربتك المجانية — ١٠ تحسينات مشمولة
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
                    href="/login"
                    className="underline underline-offset-4 hover:text-primary"
                >
                    تسجيل الدخول
                </Link>
            </p>
        </>
    )
}

export default function SignupPage() {
    return (
        <Suspense fallback={<PageLoading message="جاري التحميل…" />}>
            <SignupContent />
        </Suspense>
    )
}
