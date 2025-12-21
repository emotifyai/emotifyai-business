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
                                Last updated: November 27, 2025
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
                                                By accessing or using EmotifyAI's browser extension and web application ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service.
                                            </p>
                                            <p>
                                                We reserve the right to modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the modified Terms.
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
                                                EmotifyAI is an AI-powered text enhancement tool that helps users improve their writing. The Service includes:
                                            </p>
                                            <ul>
                                                <li>Browser extension for Chrome and Firefox</li>
                                                <li>Web application dashboard</li>
                                                <li>API access for text enhancement</li>
                                                <li>Subscription management</li>
                                            </ul>
                                            <p>
                                                We strive to provide reliable service but do not guarantee uninterrupted or error-free operation.
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
                                        To use EmotifyAI, you must create an account. You agree to:
                                    </p>
                                    <ul>
                                        <li>Provide accurate and complete information</li>
                                        <li>Maintain the security of your account credentials</li>
                                        <li>Notify us immediately of any unauthorized access</li>
                                        <li>Be responsible for all activities under your account</li>
                                    </ul>

                                    <h3>Account Termination</h3>
                                    <p>
                                        We reserve the right to suspend or terminate accounts that violate these Terms or engage in abusive behavior.
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
                                        <li><strong>Trial:</strong> 10 free enhancements to try the service</li>
                                        <li><strong>Monthly:</strong> Unlimited enhancements, billed monthly</li>
                                        <li><strong>Lifetime:</strong> One-time payment for unlimited access</li>
                                    </ul>

                                    <h3>Billing</h3>
                                    <p>
                                        Subscriptions are processed through Lemon Squeezy. By subscribing, you agree to:
                                    </p>
                                    <ul>
                                        <li>Automatic renewal for monthly subscriptions</li>
                                        <li>Charges to your payment method on file</li>
                                        <li>No refunds for partial months</li>
                                    </ul>

                                    <h3>Cancellation</h3>
                                    <p>
                                        You may cancel your subscription at any time. Access continues until the end of the current billing period.
                                    </p>

                                    <h3>Refund Policy</h3>
                                    <p>
                                        We offer refunds within 14 days of purchase for monthly subscriptions. Lifetime licenses are non-refundable after 30 days.
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
