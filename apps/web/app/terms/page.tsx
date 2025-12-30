import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent } from '@ui/card'
import { FileText, Scale, AlertCircle, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Terms of Service - EmotifyAI',
    description: 'Terms and conditions for using EmotifyAI',
}

export default function TermsPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                {/* Hero Section */}
                <section className="border-b bg-gradient-to-b from-background to-muted/20">
                    <div className="container py-16 md:py-24">
                        <div className="mx-auto max-w-3xl text-center">
                            <div className="mb-6 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
                                <Scale className="h-8 w-8 text-primary" />
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight md:text-5xl mb-4">
                                Terms of Service
                            </h1>
                            <p className="text-xl text-muted-foreground">
                                Please read these terms carefully before using EmotifyAI.
                            </p>
                            <p className="mt-4 text-sm text-muted-foreground">
                                Last updated: December 30, 2025
                            </p>
                        </div>
                    </div>
                </section>

                {/* Content */}
                <section className="container py-16 md:py-24">
                    <div className="mx-auto max-w-4xl space-y-8">
                        {/* Acceptance */}
                        <Card className="border-primary/20">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-primary/10 p-2">
                                        <CheckCircle className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-4">Acceptance of Terms</h2>
                                        <div className="prose prose-zinc dark:prose-invert max-w-none">
                                            <p>
                                                By accessing or using EmotifyAI's browser extension and web application ("Service"), you agree to be bound by these Terms of Service ("Terms"). We've designed these terms to be clear and fair. If you do not agree to these Terms, please do not use our Service.
                                            </p>
                                            <p>
                                                We reserve the right to modify these Terms at any time to reflect changes in our service or legal requirements. Continued use of the Service after changes constitutes acceptance of the modified Terms.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Service Description */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-blue-500/10 p-2">
                                        <FileText className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-4">Service Description</h2>
                                        <div className="prose prose-zinc dark:prose-invert max-w-none">
                                            <p>
                                                EmotifyAI is an AI-powered text enhancement tool that helps users improve their writing quality, tone, and clarity. The Service includes:
                                            </p>
                                            <ul>
                                                <li>Browser extension for integration with your favorite websites</li>
                                                <li>Web application dashboard for account management</li>
                                                <li>AI-driven text enhancement processing (powered by industry-leading models)</li>
                                                <li>Subscription and usage tracking</li>
                                                <li>Usage analytics and logging for service improvement and user experience optimization</li>
                                            </ul>
                                            <p>
                                                We strive to provide premium, reliable service, but because we rely on complex AI and third-party infrastructure, we do not guarantee 100% uninterrupted or error-free operation.
                                            </p>

                                            <h3>Data Collection for Service Enhancement</h3>
                                            <p>
                                                To provide the best possible user experience, we collect usage logs that include metadata about your interactions with our service (such as enhancement requests, language preferences, success/failure status, and performance metrics). <strong>These logs never contain the actual text content you enhance</strong> - only technical metadata that helps us improve service reliability and develop better features.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* User Accounts */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="prose prose-zinc dark:prose-invert max-w-none">
                                    <h2 className="text-2xl font-bold mb-4">User Accounts</h2>
                                    <h3>Account Creation</h3>
                                    <p>
                                        To use EmotifyAI, you must create a secure account. You agree to:
                                    </p>
                                    <ul>
                                        <li>Provide accurate information (email is required for account recovery)</li>
                                        <li>Maintain the security of your account and API keys</li>
                                        <li>Notify us immediately of any suspected unauthorized access</li>
                                        <li>Take responsibility for all activities occurring under your account</li>
                                    </ul>

                                    <h3>Account Privacy</h3>
                                    <p>
                                        Your account data is managed through Supabase. We do not have access to your OAuth passwords (e.g., Google/GitHub passwords). For more details, see our <a href="/privacy">Privacy Policy</a>.
                                    </p>

                                    <h3>Account Termination</h3>
                                    <p>
                                        We reserve the right to suspend or terminate accounts that violate these Terms, engage in system abuse, or perform illegal activities.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Subscription and Billing */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="prose prose-zinc dark:prose-invert max-w-none">
                                    <h2 className="text-2xl font-bold mb-4">Subscription and Billing</h2>

                                    <h3>Subscription Tiers</h3>
                                    <ul>
                                        <li><strong>Trial:</strong> 10 free enhancements for new users (one-time use)</li>
                                        <li><strong>Monthly Plans:</strong> Recurring subscriptions providing a fixed number of enhancements monthly</li>
                                        <li><strong>Lifetime:</strong> A one-time purchase granting a perpetual monthly credit allowance</li>
                                    </ul>

                                    <h3>Usage Limits (Credits)</h3>
                                    <p>
                                        Our Service operates on a credit-based system to ensure fair resource allocation:
                                    </p>
                                    <ul>
                                        <li>One enhancement action typically consumes one credit</li>
                                        <li>Credits reset at the start of your monthly billing cycle</li>
                                        <li>Unused credits do not roll over to the next month</li>
                                        <li>If you reach your limit, you can upgrade your plan or wait for the next cycle</li>
                                    </ul>

                                    <h3>Billing & Payments</h3>
                                    <p>
                                        All payments are securely processed through Lemon Squeezy. By subscribing, you agree to:
                                    </p>
                                    <ul>
                                        <li>Automatic renewal for monthly subscriptions until cancelled</li>
                                        <li>Charges to your provided payment method according to your plan</li>
                                        <li>Understanding that access depends on successful payment</li>
                                    </ul>

                                    <h3>Cancellation & Refunds</h3>
                                    <p>
                                        You can cancel your subscription anytime via the dashboard. Access remains active until the current period ends.
                                    </p>
                                    <p>
                                        <strong>Refunds:</strong> We offer a short-term "no questions asked" refund for your first monthly subscription payment. Lifetime licenses are non-refundable after 30 days due to the permanent nature of the access.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Data Usage and Privacy */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="prose prose-zinc dark:prose-invert max-w-none">
                                    <h2 className="text-2xl font-bold mb-4">Data Usage and Privacy</h2>

                                    <h3>Usage Analytics</h3>
                                    <p>
                                        By using EmotifyAI, you consent to our collection of usage analytics data to improve service quality and user experience. This includes:
                                    </p>
                                    <ul>
                                        <li>Enhancement request metadata (timestamps, language preferences, success/failure status)</li>
                                        <li>Performance metrics (processing time, token usage, error rates)</li>
                                        <li>Feature usage patterns to guide product development</li>
                                        <li>Technical diagnostics for troubleshooting and optimization</li>
                                    </ul>

                                    <h3>Content Privacy</h3>
                                    <p>
                                        <strong>We do not store, log, or analyze the actual text content you enhance.</strong> Your text is processed in real-time and immediately discarded after enhancement. Only technical metadata about the enhancement process is retained for service improvement purposes.
                                    </p>

                                    <h3>Data Retention</h3>
                                    <p>
                                        Usage logs and analytics data are retained for a reasonable period to enable service improvements and troubleshooting. You may request deletion of your data by contacting us at any time.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Acceptable Use */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-orange-500/10 p-2">
                                        <AlertCircle className="h-5 w-5 text-orange-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-4">Acceptable Use Policy</h2>
                                        <div className="prose prose-zinc dark:prose-invert max-w-none">
                                            <p>You agree NOT to:</p>
                                            <ul>
                                                <li>Use the Service for illegal or unauthorized purposes</li>
                                                <li>Attempt to gain unauthorized access to our systems</li>
                                                <li>Reverse engineer or decompile the Service</li>
                                                <li>Share your API keys or account credentials</li>
                                                <li>Abuse the Service through excessive automated requests</li>
                                                <li>Use the Service to generate harmful, offensive, or illegal content</li>
                                                <li>Resell or redistribute the Service without permission</li>
                                            </ul>
                                            <p className="font-semibold text-destructive">
                                                Violation of this policy may result in immediate account termination.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Intellectual Property */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="prose prose-zinc dark:prose-invert max-w-none">
                                    <h2 className="text-2xl font-bold mb-4">Intellectual Property</h2>

                                    <h3>Our Rights</h3>
                                    <p>
                                        EmotifyAI and all related trademarks, logos, and content are owned by us or our licensors. You may not use our intellectual property without written permission.
                                    </p>

                                    <h3>Your Content</h3>
                                    <p>
                                        You retain all rights to the text you input into EmotifyAI. We do not claim ownership of your content. By using the Service, you grant us a limited license to process your text for the purpose of providing the enhancement service.
                                    </p>

                                    <h3>AI-Generated Content</h3>
                                    <p>
                                        Enhanced text generated by our AI is provided "as-is." You are responsible for reviewing and verifying the accuracy of AI-generated content before use.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Limitation of Liability */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="prose prose-zinc dark:prose-invert max-w-none">
                                    <h2 className="text-2xl font-bold mb-4">Limitation of Liability</h2>
                                    <p>
                                        TO THE MAXIMUM EXTENT PERMITTED BY LAW:
                                    </p>
                                    <ul>
                                        <li>EmotifyAI is provided "AS-IS" without warranties of any kind</li>
                                        <li>We are not liable for any indirect, incidental, or consequential damages</li>
                                        <li>Our total liability is limited to the amount you paid in the last 12 months</li>
                                        <li>We are not responsible for third-party services or content</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Governing Law */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="prose prose-zinc dark:prose-invert max-w-none">
                                    <h2 className="text-2xl font-bold mb-4">Governing Law and Jurisdiction</h2>
                                    <p>
                                        These Terms of Service are governed by and construed in accordance with the laws of the Hashemite Kingdom of Jordan. Any disputes, claims, or legal proceedings arising out of or relating to these Terms or the use of EmotifyAI services shall be subject to the exclusive jurisdiction of the courts of Jordan.
                                    </p>
                                    <p>
                                        By using our Service, you consent to the jurisdiction and venue of the Jordanian courts for the resolution of any disputes.
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
                                        If you have questions about these Terms, please contact us:
                                    </p>
                                    <ul>
                                        <li>Email: <a href="mailto:legal@emotifyai.com">legal@emotifyai.com</a></li>
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
