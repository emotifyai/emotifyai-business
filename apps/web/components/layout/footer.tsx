import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="border-t bg-muted/20 safe-area-bottom">
            <div className="page-container py-10 sm:py-12 md:py-16">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-12">
                    <div className="sm:col-span-2 lg:col-span-2">
                        <Link href="/" className="mb-4 flex items-center gap-2 text-lg font-bold sm:mb-6 sm:text-xl">
                            <Sparkles className="h-6 w-6 shrink-0 text-primary" />
                            <span>Emotify<span className="text-primary">AI</span></span>
                        </Link>
                        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                            Transform your text instantly with AI-powered rewriting.
                            The ultimate tool for clear, professional, and engaging communication in English, Arabic, and French.
                        </p>
                    </div>

                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground/90 sm:mb-6">Product</h3>
                        <ul className="space-y-3 text-sm sm:space-y-4">
                            <li>
                                <Link href="/pricing" className="touch-target inline-flex items-center text-muted-foreground transition-colors hover:text-primary active:text-primary">
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link href="/docs" className="touch-target inline-flex items-center text-muted-foreground transition-colors hover:text-primary active:text-primary">
                                    Documentation
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground/90 sm:mb-6">Company</h3>
                        <ul className="space-y-3 text-sm sm:space-y-4">
                            <li>
                                <Link href="/about" className="touch-target inline-flex items-center text-muted-foreground transition-colors hover:text-primary active:text-primary">
                                    About
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground/90 sm:mb-6">Legal</h3>
                        <ul className="space-y-3 text-sm sm:space-y-4">
                            <li>
                                <Link href="/privacy" className="touch-target inline-flex items-center text-muted-foreground transition-colors hover:text-primary active:text-primary">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="touch-target inline-flex items-center text-muted-foreground transition-colors hover:text-primary active:text-primary">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/support" className="touch-target inline-flex items-center text-muted-foreground transition-colors hover:text-primary active:text-primary">
                                    Contact Support
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-6 text-sm text-muted-foreground sm:mt-16 sm:flex-row sm:pt-8">
                    <p className="text-center sm:text-start">&copy; {currentYear} EmotifyAI. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
