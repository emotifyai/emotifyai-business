import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, X } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export const metadata: Metadata = {
    title: 'Pricing - Verba',
    description: 'Simple, transparent pricing for everyone',
}

export default function PricingPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                <section className="container py-24">
                    <div className="mx-auto max-w-3xl text-center mb-16">
                        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-4">
                            Simple, transparent pricing
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Choose the plan that's right for you. All plans include access to our browser extension.
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
                        {/* Free Trial */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Free Trial</CardTitle>
                                <CardDescription>
                                    <span className="text-3xl font-bold text-foreground">$0</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Perfect for testing the waters.
                                </p>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-primary" />
                                        10 AI enhancements
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-primary" />
                                        Browser extension access
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-primary" />
                                        All languages supported
                                    </li>
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" variant="outline" asChild>
                                    <Link href="/signup">Start Free Trial</Link>
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* Monthly */}
                        <Card className="border-primary shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                                POPULAR
                            </div>
                            <CardHeader>
                                <CardTitle>Pro Monthly</CardTitle>
                                <CardDescription>
                                    <span className="text-3xl font-bold text-foreground">$9.99</span>
                                    /month
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    For power users who write daily.
                                </p>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-primary" />
                                        Unlimited AI enhancements
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-primary" />
                                        Priority processing
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-primary" />
                                        Advanced tone controls
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-primary" />
                                        Priority support
                                    </li>
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" variant="glow" asChild>
                                    <Link href="/signup?plan=monthly">Get Started</Link>
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* Lifetime */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Lifetime</CardTitle>
                                <CardDescription>
                                    <span className="text-3xl font-bold text-foreground">$99.99</span>
                                    /one-time
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Pay once, use forever.
                                </p>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-primary" />
                                        Everything in Pro
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-primary" />
                                        Lifetime updates
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-primary" />
                                        No recurring fees
                                    </li>
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" variant="outline" asChild>
                                    <Link href="/signup?plan=lifetime">Buy Lifetime</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}
