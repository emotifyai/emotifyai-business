import { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'
import { Suspense } from 'react'

export const metadata: Metadata = {
    title: 'Login - EmotifyAI',
    description: 'Login to your EmotifyAI account',
}

function LoginContent({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    // Preserve URL parameters when linking to signup
    const params = new URLSearchParams()
    if (searchParams.source) params.set('source', searchParams.source as string)
    if (searchParams.redirect_to) params.set('redirect_to', searchParams.redirect_to as string)
    const signupUrl = params.toString() ? `/signup?${params.toString()}` : '/signup'

    return (
        <>
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Welcome back
                </h1>
                <p className="text-sm text-muted-foreground">
                    Sign in to continue using your EmotifyAI extension
                </p>
            </div>
            <LoginForm />
            <p className="px-8 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link
                    href={signupUrl}
                    className="underline underline-offset-4 hover:text-primary"
                >
                    Sign up
                </Link>
            </p>
        </>
    )
}

export default function LoginPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginContent searchParams={searchParams} />
        </Suspense>
    )
}
