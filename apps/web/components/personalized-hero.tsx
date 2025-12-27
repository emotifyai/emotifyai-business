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
            Turn dry technical text into{' '}
            <span className="text-gradient-brand">persuasive emotional copy that sells</span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            EmotifyAI rewrites your product descriptions and marketing messages in a premium, confident voice—built to boost conversions in seconds. Right-click anywhere to transform text instantly (Arabic, English, French).
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <div className="h-12 w-40 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">See an example</Link>
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
          Turn dry technical text into{' '}
          <span className="text-gradient-brand">persuasive emotional copy that sells</span>
        </h1>
        <p className="mb-8 text-lg text-muted-foreground">
          {isAuthenticated 
            ? "Continue enhancing your text with AI-powered rewriting. Access your dashboard to manage your account and view usage statistics."
            : "EmotifyAI rewrites your product descriptions and marketing messages in a premium, confident voice—built to boost conversions in seconds. Right-click anywhere to transform text instantly (Arabic, English, French)."
          }
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button size="lg" variant="glow" asChild>
            <Link href={isAuthenticated ? "/dashboard" : "/signup"}>
              {isAuthenticated ? "Go to Dashboard" : "Start Free"}
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/pricing">See an example</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}