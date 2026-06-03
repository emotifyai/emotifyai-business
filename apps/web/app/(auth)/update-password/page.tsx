'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@emotifyai/ui'
import { Input } from '@emotifyai/ui'
import { Label } from '@emotifyai/ui'
import { toast } from '@emotifyai/ui'
import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from 'lucide-react'

export const metadata = {
    title: 'تعيين كلمة مرور جديدة - إيموتيفاي',
    description: 'أنشئ كلمة مرور جديدة آمنة لحسابك في إيموتيفاي',
}

type State = 'idle' | 'loading' | 'success'

function StrengthBar({ password }: { password: string }) {
    const checks = [
        password.length >= 8,
        /[A-Z]/.test(password),
        /[0-9]/.test(password),
        /[^A-Za-z0-9]/.test(password),
    ]
    const score = checks.filter(Boolean).length
    const labels = ['ضعيفة جداً', 'ضعيفة', 'متوسطة', 'قوية', 'ممتازة']
    const colors = [
        'bg-destructive',
        'bg-orange-500',
        'bg-yellow-500',
        'bg-emerald-400',
        'bg-emerald-500',
    ]

    if (!password) return null

    return (
        <div className="space-y-1.5">
            <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i < score ? colors[score] : 'bg-muted'
                        }`}
                    />
                ))}
            </div>
            <p className="text-xs text-muted-foreground">
                قوة كلمة المرور:{' '}
                <span className="font-medium text-foreground">{labels[score]}</span>
            </p>
        </div>
    )
}

export default function UpdatePasswordPage() {
    const router = useRouter()
    const [password, setPassword] = React.useState('')
    const [confirm, setConfirm] = React.useState('')
    const [showPassword, setShowPassword] = React.useState(false)
    const [showConfirm, setShowConfirm] = React.useState(false)
    const [state, setState] = React.useState<State>('idle')
    const [errorMsg, setErrorMsg] = React.useState('')

    const passwordsMatch = password === confirm && confirm.length > 0
    const isValid = password.length >= 8 && passwordsMatch

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setErrorMsg('')

        if (!isValid) {
            setErrorMsg(
                password.length < 8
                    ? 'يجب أن تكون كلمة المرور 8 أحرف على الأقل.'
                    : 'كلمتا المرور غير متطابقتين.'
            )
            return
        }

        setState('loading')

        try {
            const supabase = createClient()
            const { error } = await supabase.auth.updateUser({ password })

            if (error) {
                setErrorMsg(error.message)
                setState('idle')
                return
            }

            setState('success')
            toast.success('تم تغيير كلمة المرور بنجاح!')

            // Small delay so the success toast is visible before redirect
            await new Promise((r) => setTimeout(r, 1500))
            router.push('/dashboard')
        } catch {
            setErrorMsg('حدث خطأ غير متوقع. حاول مرة أخرى.')
            setState('idle')
        }
    }

    if (state === 'success') {
        return (
            <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">تم بنجاح!</h1>
                    <p className="text-sm text-muted-foreground">
                        كلمة مرورك الجديدة جاهزة. جاري تحويلك…
                    </p>
                </div>
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <>
            <div className="flex flex-col space-y-2 text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <KeyRound className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    تعيين كلمة مرور جديدة
                </h1>
                <p className="text-sm text-muted-foreground">
                    أنشئ كلمة مرور قوية لحماية حسابك
                </p>
            </div>

            <div className="grid gap-6">
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4">
                        {/* New password field */}
                        <div className="grid gap-2">
                            <Label htmlFor="password">كلمة المرور الجديدة</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    dir="ltr"
                                    disabled={state === 'loading'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="pe-10"
                                    required
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    aria-label="إظهار/إخفاء كلمة المرور"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            <StrengthBar password={password} />
                        </div>

                        {/* Confirm password field */}
                        <div className="grid gap-2">
                            <Label htmlFor="confirm">تأكيد كلمة المرور</Label>
                            <div className="relative">
                                <Input
                                    id="confirm"
                                    type={showConfirm ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    dir="ltr"
                                    disabled={state === 'loading'}
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    placeholder="••••••••"
                                    className={`pe-10 ${
                                        confirm && !passwordsMatch
                                            ? 'border-destructive focus-visible:ring-destructive'
                                            : ''
                                    }`}
                                    required
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => setShowConfirm((v) => !v)}
                                    className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    aria-label="إظهار/إخفاء كلمة المرور"
                                >
                                    {showConfirm ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {confirm && !passwordsMatch && (
                                <p className="text-xs text-destructive">
                                    كلمتا المرور غير متطابقتين
                                </p>
                            )}
                            {confirm && passwordsMatch && (
                                <p className="flex items-center gap-1 text-xs text-emerald-500">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    كلمتا المرور متطابقتان
                                </p>
                            )}
                        </div>

                        {/* Requirements hint */}
                        <div className="flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2">
                            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل. يُنصح بإضافة
                                أحرف كبيرة وأرقام ورموز لزيادة القوة.
                            </p>
                        </div>

                        {errorMsg && (
                            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                {errorMsg}
                            </p>
                        )}

                        <Button
                            type="submit"
                            variant="glow"
                            disabled={state === 'loading' || !isValid}
                            className="gap-2"
                        >
                            {state === 'loading' ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <KeyRound className="h-4 w-4" />
                            )}
                            تعيين كلمة المرور الجديدة
                        </Button>
                    </div>
                </form>
            </div>
        </>
    )
}
