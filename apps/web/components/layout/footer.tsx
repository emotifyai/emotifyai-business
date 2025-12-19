import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="border-t bg-muted/20">
            <div className="container mx-auto px-6 py-12 md:px-12 md:py-16 lg:py-20">
                <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="mb-6 flex items-center gap-2 text-xl font-bold">
                            <Sparkles className="h-6 w-6 text-primary" />
                            <span>Emotify<span className="text-primary">AI</span></span>
                        </Link>
                        <p className="mb-6 max-w-sm text-sm text-muted-foreground leading-relaxed">
                            Transform your text instantly with AI-powered rewriting.
                            The ultimate tool for clear, professional, and engaging communication in English, Arabic, and French.
                        </p>
                    </div>

                    {/* Product */}
                    <div>
                        <h3 className="mb-6 text-sm font-semibold tracking-wider uppercase text-foreground/90">Product</h3>
                        <ul className="space-y-4 text-sm">
                            <li>
                                <Link href="/pricing" className="text-muted-foreground hover:text-primary transition-colors">
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link href="/docs" className="text-muted-foreground hover:text-primary transition-colors">
                                    Documentation
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="mb-6 text-sm font-semibold tracking-wider uppercase text-foreground/90">Company</h3>
                        <ul className="space-y-4 text-sm">
                            <li>
                                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                                    About
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal & Support */}
                    <div>
                        <h3 className="mb-6 text-sm font-semibold tracking-wider uppercase text-foreground/90">Legal</h3>
                        <ul className="space-y-4 text-sm">
                            <li>
                                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <a href="mailto:support@emotifyai.com" className="text-muted-foreground hover:text-primary transition-colors">
                                    Contact Support
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <p>&copy; {currentYear} EmotifyAI. All rights reserved.</p>
                    <div className="flex gap-6">
                        {/* Social links could go here */}
                    </div>
                </div>
            </div>
        </footer>
    )
}
