'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSignup } from '@/lib/hooks/use-auth'
import { Button } from '@ui/button'
import { Input } from '@ui/input'
import { Label } from '@ui/label'
import { OAuthButtons } from './oauth-buttons'
import { LoadingSpinner } from '@ui/loading-spinner'
import { toast } from 'sonner'

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
            await signup.mutateAsync({ email, password, displayName })
            
            // Check if this is from extension
            const source = searchParams.get('source')
            const redirectTo = searchParams.get('redirect_to')
            
            if (source === 'extension' && redirectTo) {
                toast.success('Account created successfully! Setting up your extension...')
                router.push(redirectTo)
            } else {
                toast.success('Account created successfully! Choose your plan to get started.')
                router.push('/pricing?from=new_user')
            }
        } catch (error) {
            toast.error(`Failed to create account. Please try again. ${error}`)
        }
    }

    return (
        <div className="grid gap-6">
            <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            placeholder="John Doe"
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
                        <Label htmlFor="email">Email</Label>
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
                        <Label htmlFor="password">Password</Label>
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
                            Must be at least 8 characters long
                        </p>
                    </div>
                    <Button disabled={signup.isPending} type="submit" variant="glow">
                        {signup.isPending && (
                            <LoadingSpinner className="mr-2 h-4 w-4" />
                        )}
                        Create Account
                    </Button>
                </div>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                    </span>
                </div>
            </div>

            <OAuthButtons />
        </div>
    )
}
