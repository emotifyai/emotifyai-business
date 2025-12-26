'use client'

import { Button } from '@ui/button'
import Link from 'next/link'
import { useUser } from '@/lib/hooks/use-auth'

export function PersonalizedHero() {
  const { data: user, isLoading } = useUser()
  const isAuthenticated = !!user

  if (isLoading) {
    return (
      <section className="container py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Enhance Your Writing with{' '}
            <span className="text-gradient-brand">AI Power</span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Transform your text instantly with AI-powered rewriting. Perfect for English, Arabic, and French.
            Right-click anywhere to enhance your writing.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <div className="h-12 w-40 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <Button size="lg" variant="outline" asChild>
              <Link href="/docs">View Documentation</Link>
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="container py-24 md:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
          {isAuthenticated && user?.display_name ? (
            <>Welcome back, {user.display_name}! <br /></>
          ) : isAuthenticated ? (
            <>Welcome back! <br /></>
          ) : null}
          Enhance Your Writing with{' '}
          <span className="text-gradient-brand">AI Power</span>
        </h1>
        <p className="mb-8 text-lg text-muted-foreground">
          {isAuthenticated 
            ? "Continue enhancing your text with AI-powered rewriting. Access your dashboard to manage your account and view usage statistics."
            : "Transform your text instantly with AI-powered rewriting. Perfect for English, Arabic, and French. Right-click anywhere to enhance your writing."
          }
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button size="lg" variant="glow" asChild>
            <Link href={isAuthenticated ? "/dashboard" : "/signup"}>
              {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/docs">View Documentation</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}