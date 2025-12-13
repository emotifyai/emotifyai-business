import { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'
import { Suspense } from 'react'

export const metadata: Metadata = {
    title: 'Login - Verba',
    description: 'Login to your Verba account',
}

function LoginContent() {
    return (
        <>
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Welcome back
                </h1>
                <p className="text-sm text-muted-foreground">
                    Sign in to continue using your Verba extension
                </p>
            </div>
            <LoginForm />
            <p className="px-8 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link
                    href="/signup"
                    className="underline underline-offset-4 hover:text-primary"
                >
                    Sign up
                </Link>
            </p>
        </>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginContent />
        </Suspense>
    )
}
