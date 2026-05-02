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
{/* Chrome Extension CTA */}
<section className="container py-12">
  <div className="mx-auto max-w-2xl text-center">
    <a href="https://chromewebstore.google.com/detail/emotifyai/gfdhmjalkhficdnaoojpgcmcjfjbmldl" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-semibold hover:opacity-90 transition-opacity shadow-lg">
      Add to Chrome — It&apos;s Free
    </a>
    <p className="mt-3 text-sm text-muted-foreground">10 free enhancements. No credit card required.</p>
  </div>
</section>
        <section className="container py-12">
  <div className="mx-auto max-w-4xl text-center">
    <h2 className="mb-4 text-3xl font-bold">See EmotifyAI in Action</h2>
    <p className="text-muted-foreground mb-8">Watch how one right-click transforms boring text into powerful marketing copy</p>
    <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl">
      <iframe
        width="100%"
        height="100%"
        src="https://www.youtube.com/embed/axq8kcw2ZVQ"
        title="EmotifyAI Demo"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  </div>
</section>
      {/* Before & After Section */}
<section className="container py-24">
  <div className="mx-auto max-w-4xl">
    <div className="mb-12 text-center">
      <h2 className="mb-4 text-3xl font-bold">See The Difference</h2>
      <p className="text-muted-foreground">From dry technical text to powerful emotional copy — instantly</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="flex flex-col items-center">
        <span className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Before</span>
        <img src="/before.png" alt="Before EmotifyAI" className="rounded-xl shadow-2xl w-full" />
      </div>
      <div className="flex flex-col items-center">
        <span className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">After</span>
        <img src="/after.png" alt="After EmotifyAI" className="rounded-xl shadow-2xl w-full" />
      </div>
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
                    {isAuthenticated ? "Go to Dashboard" : "Start Free"}
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
