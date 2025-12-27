import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent } from '@ui/card'
import { Mail, MessageCircle, FileText, Clock } from 'lucide-react'
import { Button } from '@ui/button'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Support - EmotifyAI',
    description: 'Get help with EmotifyAI - contact support, view documentation, and find answers to common questions',
}

export default function SupportPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                {/* Hero Section */}
                <section className="border-b bg-gradient-to-b from-background to-muted/20">
                    <div className="container py-16 md:py-24">
                        <div className="mx-auto max-w-3xl text-center">
                            <div className="mb-6 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
                                <MessageCircle className="h-8 w-8 text-primary" />
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight md:text-5xl mb-4">
                                How can we help you?
                            </h1>
                            <p className="text-xl text-muted-foreground">
                                Get support, find answers, or contact our team directly.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Support Options */}
                <section className="container py-16 md:py-24">
                    <div className="mx-auto max-w-4xl">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Email Support */}
                            <Card className="border-primary/20">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <div className="rounded-lg bg-primary/10 p-2">
                                            <Mail className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold mb-2">Email Support</h3>
                                            <p className="text-muted-foreground mb-4">
                                                Send us an email and we'll get back to you within 24 hours.
                                            </p>
                                            <Button asChild>
                                                <a href="mailto:support@emotifyai.com">
                                                    Contact Support
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Documentation */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <div className="rounded-lg bg-blue-500/10 p-2">
                                            <FileText className="h-6 w-6 text-blue-500" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold mb-2">Documentation</h3>
                                            <p className="text-muted-foreground mb-4">
                                                Find detailed guides and troubleshooting information.
                                            </p>
                                            <Button variant="outline" asChild>
                                                <Link href="/docs">
                                                    View Docs
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Response Times */}
                <Card className="mt-8">
  <CardContent className="pt-6">
    <div className="flex items-start gap-4">
      <div className="rounded-lg bg-green-500/10 p-2">
        <Clock className="h-6 w-6 text-green-500" />
      </div>

      <div className="flex-1">
        <h3 className="text-xl font-bold mb-4">Response Times</h3>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="text-center p-4 rounded-lg border bg-card">
            <div className="text-2xl font-bold text-primary mb-1">
              &lt; 24h
            </div>
            <div className="text-sm text-muted-foreground">
              General Support
            </div>
          </div>

          <div className="text-center p-4 rounded-lg border bg-card">
            <div className="text-2xl font-bold text-primary mb-1">
              &lt; 12h
            </div>
            <div className="text-sm text-muted-foreground">
              Billing Issues
            </div>
          </div>

          <div className="text-center p-4 rounded-lg border bg-card">
            <div className="text-2xl font-bold text-primary mb-1">
              &lt; 4h
            </div>
            <div className="text-sm text-muted-foreground">
              Critical Issues
            </div>
          </div>
        </div>
      </div>
    </div>
  </CardContent>
</Card>


                        {/* Common Issues */}
                        <div className="mt-16">
                            <h2 className="text-2xl font-bold text-center mb-8">Common Questions</h2>
                            <div className="space-y-6">
                                <Card>
                                    <CardContent className="pt-6">
                                        <h4 className="font-semibold mb-2">Extension not working on a website?</h4>
                                        <p className="text-muted-foreground text-sm">
                                            Some websites block extensions. Try refreshing the page or check if the extension is enabled in your browser settings.
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="pt-6">
                                        <h4 className="font-semibold mb-2">Credits not updating?</h4>
                                        <p className="text-muted-foreground text-sm">
                                            Credits may take a few minutes to sync. Try logging out and back in, or contact support if the issue persists.
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="pt-6">
                                        <h4 className="font-semibold mb-2">Billing or subscription issues?</h4>
                                        <p className="text-muted-foreground text-sm">
                                            For billing questions, please email us with your account email and we'll resolve it quickly.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}