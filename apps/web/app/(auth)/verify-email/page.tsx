import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@emotifyai/ui'

export const metadata: Metadata = {
    title: 'تأكيد البريد الإلكتروني - إيموتيفاي',
    description: 'تحقق من بريدك الإلكتروني لتفعيل حسابك',
}

export default function VerifyEmailPage() {
    return (
        <div className="flex flex-col items-center justify-center space-y-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-4xl">✉️</span>
            </div>
            
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                    تحقق من بريدك الإلكتروني
                </h1>
                <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
                    لقد أرسلنا رابط التفعيل إلى بريدك الإلكتروني. يرجى الضغط عليه لتتمكن من تسجيل الدخول والبدء في استخدام إيموتيفاي.
                </p>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-sm pt-4">
                <Button asChild variant="glow" className="w-full">
                    <Link href="/login">العودة لتسجيل الدخول</Link>
                </Button>
                
                <p className="text-xs text-muted-foreground">
                    لم تصلك الرسالة؟ تفقد مجلد البريد المزعج (Spam) أو حاول التسجيل مرة أخرى إذا كان البريد خاطئاً.
                </p>
            </div>
        </div>
    )
}
