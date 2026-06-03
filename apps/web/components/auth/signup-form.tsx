'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSignup } from '@/lib/hooks/use-auth'
import { Button } from '@emotifyai/ui'
import { Input } from '@emotifyai/ui'
import { Label } from '@emotifyai/ui'
import { OAuthButtons } from './oauth-buttons'
import { LoadingSpinner } from '@emotifyai/ui'
import { toast } from '@emotifyai/ui'

export function SignupForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const signup = useSignup()
    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [displayName, setDisplayName] = React.useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const result = await signup.mutateAsync({ email, password, displayName })
            
            // If email confirmations are enabled in Supabase, session will be null upon signup
            if (result?.session === null) {
                router.push('/verify-email')
                return
            }
            
            const source = searchParams.get('source')
            const redirectTo = searchParams.get('redirect_to')

            if (redirectTo) {
                toast.success(
                    source === 'extension'
                        ? 'تم إنشاء الحساب بنجاح! جاري إعداد الإضافة…'
                        : 'تم إنشاء الحساب بنجاح! جاري فتح المحرر…'
                )
                router.push(redirectTo)
            } else {
                toast.success('تم إنشاء الحساب بنجاح! اختر خطتك للبدء.')
                router.push('/pricing?from=new_user')
            }
        } catch (error) {
            toast.error(`فشل إنشاء الحساب. حاول مرة أخرى. ${error}`)
        }
    }

    return (
        <div className="grid gap-6">
            <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">الاسم الكامل</Label>
                        <Input
                            id="name"
                            placeholder="محمد أحمد"
                            type="text"
                            autoCapitalize="words"
                            autoComplete="name"
                            autoCorrect="off"
                            disabled={signup.isPending}
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">البريد الإلكتروني</Label>
                        <Input
                            id="email"
                            placeholder="name@example.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={signup.isPending}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">كلمة المرور</Label>
                        <Input
                            id="password"
                            type="password"
                            autoCapitalize="none"
                            autoComplete="new-password"
                            disabled={signup.isPending}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                        />
                        <p className="text-xs text-muted-foreground">
                            يجب أن تكون ٨ أحرف على الأقل
                        </p>
                    </div>
                    <Button disabled={signup.isPending} type="submit" variant="glow">
                        {signup.isPending && (
                            <LoadingSpinner className="me-2 h-4 w-4" />
                        )}
                        إنشاء حساب
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
