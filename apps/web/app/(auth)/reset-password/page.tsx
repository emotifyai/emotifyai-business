import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@emotifyai/ui'
import { Input } from '@emotifyai/ui'
import { Label } from '@emotifyai/ui'

export const metadata: Metadata = {
    title: 'إعادة تعيين كلمة المرور - إيموتيفاي',
    description: 'أعد تعيين كلمة مرور حسابك في إيموتيفاي',
}

export default function ResetPasswordPage() {
    return (
        <>
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    إعادة تعيين كلمة المرور
                </h1>
                <p className="text-sm text-muted-foreground">
                    أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور
                </p>
            </div>
            <div className="grid gap-6">
                <form>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">البريد الإلكتروني</Label>
                            <Input
                                id="email"
                                placeholder="name@example.com"
                                type="email"
                                autoCapitalize="none"
                                autoComplete="email"
                                autoCorrect="off"
                                required
                            />
                        </div>
                        <Button type="submit" variant="glow">
                            إرسال رابط إعادة التعيين
                        </Button>
                    </div>
                </form>
            </div>
            <p className="px-8 text-center text-sm text-muted-foreground">
                <Link
                    href="/login"
                    className="underline underline-offset-4 hover:text-primary"
                >
                    العودة لتسجيل الدخول
                </Link>
            </p>
        </>
    )
}
