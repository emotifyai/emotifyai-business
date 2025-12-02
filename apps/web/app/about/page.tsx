import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, Target, Zap, Shield, Globe, Users } from 'lucide-react'

export const metadata: Metadata = {
    title: 'About - Verba',
    description: 'Learn more about Verba and our mission to elevate writing with AI',
}

export default function AboutPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                {/* Hero Section */}
                <section className="border-b bg-gradient-to-b from-background to-muted/20">
                    <div className="container py-16 md:py-24">
                        <div className="mx-auto max-w-3xl text-center">
                            <div className="mb-6 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
                                <Sparkles className="h-8 w-8 text-primary" />
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight md:text-5xl mb-4">
                                About Verba
                            </h1>
                            <p className="text-xl text-muted-foreground">
                                Elevating writing with the power of AI, making communication effortless for everyone.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="container py-16 md:py-24">
                    <div className="mx-auto max-w-4xl space-y-12">
                        {/* Our Mission */}
                        <Card className="border-primary/20">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-primary/10 p-2">
                                        <Target className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                                        <p className="text-lg text-muted-foreground leading-relaxed">
                                            We believe that language shouldn&#39;t be a barrier to effective communication. Whether you&#39;re writing an important email, a technical document, or a creative piece, Verba helps you find the right words instantly—in English, Arabic, or French.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* How It Works */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-blue-500/10 p-2">
                                        <Zap className="h-6 w-6 text-blue-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-4">How It Works</h2>
                                        <div className="space-y-4">
                                            <p className="text-muted-foreground leading-relaxed">
                                                Verba leverages the power of <span className="font-semibold text-foreground">Claude 3.5 Sonnet</span>, one of the most advanced AI models available, to understand the context and nuance of your writing.
                                            </p>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="rounded-lg border bg-card p-4">
                                                    <h3 className="font-semibold mb-2">Browser Extension</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Integrates seamlessly into your workflow, allowing you to enhance text directly where you write.
                                                    </p>
                                                </div>
                                                <div className="rounded-lg border bg-card p-4">
                                                    <h3 className="font-semibold mb-2">Web Dashboard</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Manage your subscription, track usage, and access API keys from one central location.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Multi-Language Support */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-green-500/10 p-2">
                                        <Globe className="h-6 w-6 text-green-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-4">Multi-Language Excellence</h2>
                                        <p className="text-muted-foreground leading-relaxed mb-4">
                                            Verba specializes in three languages, ensuring high-quality enhancements tailored to each language&#39;s unique characteristics:
                                        </p>
                                        <div className="grid gap-3 md:grid-cols-3">
                                            <div className="rounded-lg border bg-card p-4 text-center">
                                                <div className="text-2xl font-bold mb-1">🇬🇧</div>
                                                <div className="font-semibold">English</div>
                                                <div className="text-xs text-muted-foreground">Professional & Creative</div>
                                            </div>
                                            <div className="rounded-lg border bg-card p-4 text-center">
                                                <div className="text-2xl font-bold mb-1">🇸🇦</div>
                                                <div className="font-semibold">Arabic</div>
                                                <div className="text-xs text-muted-foreground">RTL-Aware</div>
                                            </div>
                                            <div className="rounded-lg border bg-card p-4 text-center">
                                                <div className="text-2xl font-bold mb-1">🇫🇷</div>
                                                <div className="font-semibold">French</div>
                                                <div className="text-xs text-muted-foreground">Formal & Casual</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Privacy First */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-purple-500/10 p-2">
                                        <Shield className="h-6 w-6 text-purple-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-4">Privacy First</h2>
                                        <p className="text-muted-foreground leading-relaxed mb-4">
                                            We take your privacy seriously. Verba is designed with a security-first approach:
                                        </p>
                                        <ul className="space-y-2">
                                            <li className="flex items-start gap-2">
                                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                                                <span className="text-sm text-muted-foreground">
                                                    <strong className="text-foreground">No text storage:</strong> Your enhanced text is never stored on our servers
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                                                <span className="text-sm text-muted-foreground">
                                                    <strong className="text-foreground">Secure processing:</strong> Text is processed securely and not used for training AI models
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                                                <span className="text-sm text-muted-foreground">
                                                    <strong className="text-foreground">No tracking:</strong> We do not track your browsing history or activity
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                                                <span className="text-sm text-muted-foreground">
                                                    <strong className="text-foreground">Encrypted:</strong> All communication is encrypted with industry-standard protocols
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Who We Serve */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-orange-500/10 p-2">
                                        <Users className="h-6 w-6 text-orange-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-4">Who We Serve</h2>
                                        <p className="text-muted-foreground leading-relaxed mb-4">
                                            Verba is built for anyone who writes:
                                        </p>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <div className="rounded-lg border bg-card p-3">
                                                <div className="font-semibold text-sm mb-1">Professionals</div>
                                                <div className="text-xs text-muted-foreground">Craft polished emails and documents</div>
                                            </div>
                                            <div className="rounded-lg border bg-card p-3">
                                                <div className="font-semibold text-sm mb-1">Students</div>
                                                <div className="text-xs text-muted-foreground">Improve essays and assignments</div>
                                            </div>
                                            <div className="rounded-lg border bg-card p-3">
                                                <div className="font-semibold text-sm mb-1">Content Creators</div>
                                                <div className="text-xs text-muted-foreground">Enhance blog posts and articles</div>
                                            </div>
                                            <div className="rounded-lg border bg-card p-3">
                                                <div className="font-semibold text-sm mb-1">Non-Native Speakers</div>
                                                <div className="text-xs text-muted-foreground">Write confidently in any language</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}
