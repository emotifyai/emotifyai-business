import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent } from '@ui/card'
import { Shield, Lock, Eye, Database, FileText, UserCheck } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Privacy Policy - EmotifyAI',
    description: 'Learn how EmotifyAI protects your privacy and handles your data',
}

export default function PrivacyPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                {/* Hero Section */}
                <section className="border-b bg-gradient-to-b from-background to-muted/20">
                    <div className="container py-16 md:py-24">
                        <div className="mx-auto max-w-3xl text-center">
                            <div className="mb-6 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
                                <Shield className="h-8 w-8 text-primary" />
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight md:text-5xl mb-4">
                                Privacy Policy
                            </h1>
                            <p className="text-xl text-muted-foreground">
                                Your privacy is our priority. Learn how we collect, use, and protect your data.
                            </p>
                            <p className="mt-4 text-sm text-muted-foreground">
                                Last updated: November 27, 2025
                            </p>
                        </div>
                    </div>
                </section>

                {/* Content */}
                <section className="container py-16 md:py-24">
                    <div className="mx-auto max-w-4xl space-y-8">
                        {/* Introduction */}
                        <Card className="border-primary/20">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-primary/10 p-2">
                                        <FileText className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-4">Introduction</h2>
                                        <div className="prose prose-zinc dark:prose-invert max-w-none">
                                            <p>
                                                EmotifyAI ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our browser extension and web application.
                                            </p>
                                            <p>
                                                By using EmotifyAI, you agree to the collection and use of information in accordance with this policy.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Information We Collect */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-blue-500/10 p-2">
                                        <Database className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
                                        <div className="prose prose-zinc dark:prose-invert max-w-none">
                                            <h3>Account Information</h3>
                                            <ul>
                                                <li>Email address</li>
                                                <li>Display name</li>
                                                <li>OAuth provider information (if you sign in with Google or GitHub)</li>
                                            </ul>

                                            <h3>Usage Data</h3>
                                            <ul>
                                                <li>Number of text enhancements performed</li>
                                                <li>Subscription tier and status</li>
                                                <li>API key usage (anonymized)</li>
                                                <li>Browser and extension version</li>
                                            </ul>

                                            <h3>Text Data</h3>
                                            <p>
                                                When you use EmotifyAI to enhance text, we temporarily process your text through our AI service. <strong>We do not store or log the content of your text.</strong> Text is processed in real-time and immediately discarded after enhancement.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* How We Use Your Information */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-green-500/10 p-2">
                                        <UserCheck className="h-5 w-5 text-green-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
                                        <div className="prose prose-zinc dark:prose-invert max-w-none">
                                            <p>We use the collected information to:</p>
                                            <ul>
                                                <li>Provide and maintain our service</li>
                                                <li>Authenticate and authorize users</li>
                                                <li>Process text enhancement requests</li>
                                                <li>Manage subscriptions and billing</li>
                                                <li>Monitor usage limits and prevent abuse</li>
                                                <li>Improve our service and user experience</li>
                                                <li>Send important service updates and notifications</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Data Security */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-purple-500/10 p-2">
                                        <Lock className="h-5 w-5 text-purple-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-4">Data Security</h2>
                                        <div className="prose prose-zinc dark:prose-invert max-w-none">
                                            <p>We implement industry-standard security measures to protect your data:</p>
                                            <ul>
                                                <li><strong>Encryption:</strong> All data is encrypted in transit using HTTPS/TLS</li>
                                                <li><strong>Authentication:</strong> Secure OAuth 2.0 and JWT-based authentication</li>
                                                <li><strong>Database Security:</strong> Row-level security policies on all database tables</li>
                                                <li><strong>API Keys:</strong> Hashed and stored securely, never exposed in plain text</li>
                                                <li><strong>No Text Storage:</strong> Your enhanced text is never stored on our servers</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Third-Party Services */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-orange-500/10 p-2">
                                        <Eye className="h-5 w-5 text-orange-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-4">Third-Party Services</h2>
                                        <div className="prose prose-zinc dark:prose-invert max-w-none">
                                            <p>We use the following third-party services:</p>
                                            <ul>
                                                <li><strong>Supabase:</strong> Authentication and database hosting</li>
                                                <li><strong>Anthropic (Claude AI):</strong> Text enhancement processing</li>
                                                <li><strong>Lemon Squeezy:</strong> Payment processing and subscription management</li>
                                            </ul>
                                            <p>
                                                These services have their own privacy policies. We recommend reviewing them:
                                            </p>
                                            <ul>
                                                <li><a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Supabase Privacy Policy</a></li>
                                                <li><a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer">Anthropic Privacy Policy</a></li>
                                                <li><a href="https://www.lemonsqueezy.com/privacy" target="_blank" rel="noopener noreferrer">Lemon Squeezy Privacy Policy</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Your Rights */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="prose prose-zinc dark:prose-invert max-w-none">
                                    <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
                                    <p>You have the right to:</p>
                                    <ul>
                                        <li><strong>Access:</strong> Request a copy of your personal data</li>
                                        <li><strong>Correction:</strong> Update or correct your information</li>
                                        <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                                        <li><strong>Data Portability:</strong> Export your data in a machine-readable format</li>
                                        <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
                                    </ul>
                                    <p>
                                        To exercise these rights, please contact us at <a href="mailto:privacy@emotifyai.com">privacy@emotifyai.com</a>.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact */}
                        <Card className="border-primary/20 bg-primary/5">
                            <CardContent className="pt-6">
                                <div className="prose prose-zinc dark:prose-invert max-w-none">
                                    <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                                    <p>
                                        If you have questions about this Privacy Policy, please contact us:
                                    </p>
                                    <ul>
                                        <li>Email: <a href="mailto:privacy@emotifyai.com">privacy@emotifyai.com</a></li>
                                        <li>Support: <a href="mailto:support@emotifyai.com">support@emotifyai.com</a></li>
                                    </ul>
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
