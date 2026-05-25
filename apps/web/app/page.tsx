import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@emotifyai/ui'
import { Card, CardHeader, CardTitle, CardDescription } from '@emotifyai/ui'
import { Sparkles, Zap, Globe, Shield } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PersonalizedHero } from '@/components/personalized-hero'
import { MobileShell } from '@emotifyai/ui'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = !!user

  return (
    <MobileShell header={<Header />} footer={<Footer />}>
      <main className="flex-1 overflow-x-hidden">
        <PersonalizedHero />

        <section className="page-container py-12 sm:py-16 md:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 text-center sm:mb-12">
              <h2 className="mb-3 text-2xl font-bold sm:mb-4 sm:text-3xl">Why Choose EmotifyAI?</h2>
              <p className="text-sm text-muted-foreground sm:text-base">
                Powerful features to enhance your writing workflow
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <Sparkles className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle>AI-Powered</CardTitle>
                  <CardDescription>
                    Advanced AI delivers intelligent, context-aware rewriting
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Zap className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle>Instant Results</CardTitle>
                  <CardDescription>
                    Right-click context menu for instant text enhancement
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Globe className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle>Multi-Language</CardTitle>
                  <CardDescription>
                    Full support for English, Arabic, and French
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle>Secure</CardTitle>
                  <CardDescription>
                    Your data is protected with enterprise-grade security
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        <section className="page-container pb-12 sm:pb-16 md:pb-24">
          <Card variant="glass" className="mx-auto max-w-3xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl sm:text-3xl">
                {isAuthenticated ? 'Continue your writing journey' : 'Ready to enhance your writing?'}
              </CardTitle>
              <CardDescription className="text-base">
                {isAuthenticated
                  ? 'Access your dashboard to manage your subscription and view usage analytics.'
                  : 'Start with 10 free enhancements. No credit card required.'}
              </CardDescription>
              <Button size="lg" variant="glow" className="mt-4 w-full sm:mx-auto sm:w-auto" asChild>
                <Link href={isAuthenticated ? '/dashboard' : '/signup'}>
                  {isAuthenticated ? 'Go to Dashboard' : 'Start Free'}
                </Link>
              </Button>
            </CardHeader>
          </Card>
        </section>
      </main>
    </MobileShell>
  )
}
