'use client'

import { Button } from '@emotifyai/ui'
import Link from 'next/link'
import { useUser } from '@/lib/hooks/use-auth'

export function PersonalizedHero() {
  const { data: user, isLoading } = useUser()
  const isAuthenticated = !!user

  const headline = (
    <>
      {isAuthenticated && user?.display_name ? (
        <>Welcome back, {user.display_name}! <br className="hidden sm:block" /></>
      ) : isAuthenticated ? (
        <>Welcome back! <br className="hidden sm:block" /></>
      ) : null}
      Turn dry technical text into{' '}
      <span className="text-gradient-brand">persuasive emotional copy that sells</span>
    </>
  )

  const description = isAuthenticated
    ? 'Continue enhancing your text with AI-powered rewriting. Access your dashboard to manage your account and view usage statistics.'
    : 'EmotifyAI rewrites your product descriptions and marketing messages in a premium, confident voice—built to boost conversions in seconds. Right-click anywhere to transform text instantly (Arabic, English, French).'

  const cta = (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
      <Button size="lg" variant="glow" className="w-full sm:w-auto" asChild>
        <Link href={isAuthenticated ? '/dashboard' : '/signup'}>
          {isAuthenticated ? 'Go to Dashboard' : 'Start Free'}
        </Link>
      </Button>
      <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
        <Link href="/pricing">See an example</Link>
      </Button>
    </div>
  )

  if (isLoading) {
    return (
      <section className="page-container py-12 sm:py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl">
            {headline}
          </h1>
          <p className="mb-6 text-base text-muted-foreground sm:mb-8 sm:text-lg">
            {description}
          </p>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <div className="h-12 w-full animate-pulse rounded-lg bg-muted sm:w-40" />
            <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
              <Link href="/pricing">See an example</Link>
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="page-container py-12 sm:py-20 md:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl">
          {headline}
        </h1>
        <p className="mb-6 text-base leading-relaxed text-muted-foreground sm:mb-8 sm:text-lg">
          {description}
        </p>
        {cta}
      </div>
    </section>
  )
}
