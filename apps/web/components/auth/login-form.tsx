'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLogin } from '@/lib/hooks/use-auth'
import { Button } from '@emotifyai/ui'
import { Input } from '@emotifyai/ui'
import { Label } from '@emotifyai/ui'
import { OAuthButtons } from './oauth-buttons'
import { toast } from 'sonner'
import Link from 'next/link'

export function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const login = useLogin()
    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            await login.mutateAsync({ email, password })
            
            const source = searchParams.get('source')
            const redirectTo = searchParams.get('redirect_to')

            if (redirectTo) {
                toast.success(
                    source === 'extension'
                        ? 'تم تسجيل الدخول بنجاح! جاري الاتصال بالإضافة…'
                        : 'تم تسجيل الدخول بنجاح'
                )
                router.push(redirectTo)
            } else {
                toast.success('تم تسجيل الدخول بنجاح')
                router.push('/dashboard')
            }
        } catch (error) {
            toast.error(`فشل تسجيل الدخول. تحقق من بياناتك. ${error}`)
        }
    }

    return (
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
                            disabled={login.isPending}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">كلمة المرور</Label>
                            <Link
                                href="/reset-password"
                                className="text-sm font-medium text-muted-foreground hover:text-primary"
                            >
                                نسيت كلمة المرور؟
                            </Link>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            autoCapitalize="none"
                            autoComplete="current-password"
                            disabled={login.isPending}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button disabled={login.isPending} type="submit" variant="glow">
                        {login.isPending && (
                            <span className="me-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        )}
                        تسجيل الدخول
                    </Button>
                </div>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        أو تابع باستخدام
                    </span>
                </div>
            </div>

            <OAuthButtons />
        </div>
    )
}
