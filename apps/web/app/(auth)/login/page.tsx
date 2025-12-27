import { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'
import { Suspense } from 'react'

export const metadata: Metadata = {
    title: 'Login - EmotifyAI',
    description: 'Login to your EmotifyAI account',
}

interface LoginPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function LoginContent({ searchParams }: LoginPageProps) {
    const params = await searchParams
    
    // Preserve URL parameters when linking to signup
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

export default async function LoginPage({ searchParams }: LoginPageProps) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginContent searchParams={searchParams} />
        </Suspense>
    )
}
