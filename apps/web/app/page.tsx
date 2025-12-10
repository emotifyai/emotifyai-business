import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@ui/card'
import { Badge } from '@ui/badge'
import { Sparkles, Zap, Globe, Shield } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4" variant="secondary">
              Powered by Claude 3.5 Sonnet
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
              Enhance Your Writing with{' '}
              <span className="text-gradient-brand">AI Power</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              Transform your text instantly with AI-powered rewriting. Perfect for English, Arabic, and French.
              Right-click anywhere to enhance your writing.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" variant="glow" asChild>
                <Link href="/signup">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/docs">View Documentation</Link>
              </Button>
            </div>
          </div>
        </section>

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
                <h2 className="mb-4 text-3xl font-bold">Ready to enhance your writing?</h2>
                <p className="mb-6 text-muted-foreground">
                  Start with 10 free enhancements. No credit card required.
                </p>
                <Button size="lg" variant="glow" asChild>
                  <Link href="/signup">Start Free Trial</Link>
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
