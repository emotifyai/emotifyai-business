import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@ui/card'
import { Badge } from '@ui/badge'
import { Sparkles, Zap, Globe, Shield } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PersonalizedHero } from '@/components/personalized-hero'

export default async function Home() {
  // Check if user is authenticated for CTA section
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = !!user
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <PersonalizedHero />

        {/* Features Section */}
        <section className="container py-24">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">Why Choose EmotifyAI?</h2>
              <p className="text-muted-foreground">
                Powerful features to enhance your writing workflow
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <Sparkles className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle>AI-Powered</CardTitle>
                  <CardDescription>
                    Claude 3.5 Sonnet delivers intelligent, context-aware rewriting
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

        {/* CTA Section */}
        <section className="container py-24">
          <Card variant="glass" className="mx-auto max-w-3xl">
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="mb-4 text-3xl font-bold">
                  {isAuthenticated ? "Continue your writing journey" : "Ready to enhance your writing?"}
                </h2>
                <p className="mb-6 text-muted-foreground">
                  {isAuthenticated 
                    ? "Access your dashboard to manage your subscription and view usage analytics."
                    : "Start with 10 free enhancements. No credit card required."
                  }
                </p>
                <Button size="lg" variant="glow" asChild>
                  <Link href={isAuthenticated ? "/dashboard" : "/signup"}>
                    {isAuthenticated ? "Go to Dashboard" : "Start Free Trial"}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  )
}
