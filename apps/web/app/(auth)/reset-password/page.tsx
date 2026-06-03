'use client'

import * as React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@emotifyai/ui'
import { Input } from '@emotifyai/ui'
import { Label } from '@emotifyai/ui'
import { Mail, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'

type State = 'idle' | 'loading' | 'success' | 'error'

export default function ResetPasswordPage() {
    const [email, setEmail] = React.useState('')
    const [state, setState] = React.useState<State>('idle')
    const [errorMsg, setErrorMsg] = React.useState('')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setState('loading')
        setErrorMsg('')

        try {
            const supabase = createClient()
            const redirectTo = `${window.location.origin}/api/auth/callback?type=recovery`

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo,
            })

            if (error) {
                setErrorMsg(error.message)
                setState('error')
                return
            }

            setState('success')
        } catch (err) {
            setErrorMsg('حدث خطأ غير متوقع. حاول مرة أخرى.')
            setState('error')
        }
    }

    if (state === 'success') {
        return (
            <>
                <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <CheckCircle2 className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            تحقق من بريدك الإلكتروني
                        </h1>
                        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                            أرسلنا رابطاً لإعادة تعيين كلمة المرور إلى{' '}
                            <span className="font-medium text-foreground">{email}</span>.
                            الرابط صالح لمدة ساعة واحدة.
                        </p>
                    </div>
                </div>
                <div className="space-y-3">
                    <p className="text-center text-xs text-muted-foreground">
                        لم تجد الرسالة؟ تحقق من مجلد الرسائل غير المرغوب فيها (Spam).
                    </p>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                            setState('idle')
                            setEmail('')
                        }}
                    >
                        إعادة الإرسال
                    </Button>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-primary"
                    >
                        العودة لتسجيل الدخول
                    </Link>
                </p>
            </>
        )
    }

    return (
        <>
            <div className="flex flex-col space-y-2 text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    نسيت كلمة المرور؟
                </h1>
                <p className="text-sm text-muted-foreground">
                    أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة التعيين
                </p>
            </div>

            <div className="grid gap-6">
                <form onSubmit={handleSubmit}>
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
                                dir="ltr"
                                disabled={state === 'loading'}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {state === 'error' && (
                            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                {errorMsg}
                            </p>
                        )}

                        <Button
                            type="submit"
                            variant="glow"
                            disabled={state === 'loading'}
                            className="gap-2"
                        >
                            {state === 'loading' ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <ArrowRight className="h-4 w-4" />
                            )}
                            إرسال رابط إعادة التعيين
                        </Button>
                    </div>
                </form>
            </div>

            <p className="text-center text-sm text-muted-foreground">
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
