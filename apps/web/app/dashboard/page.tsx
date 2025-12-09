import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BarChart3, CreditCard, Settings } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Dashboard - Verba',
    description: 'Manage your Verba account and subscription',
}

export default function DashboardPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                <section className="container py-24">
                    <div className="mx-auto max-w-5xl">
                        <div className="mb-12">
                            <h1 className="text-4xl font-bold tracking-tight mb-2">Dashboard</h1>
                            <p className="text-muted-foreground">
                                Manage your account, subscription, and usage
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            {/* Usage Card */}
                            <Card>
                                <CardHeader>
                                    <BarChart3 className="h-8 w-8 text-primary mb-2" />
                                    <CardTitle>Usage</CardTitle>
                                    <CardDescription>
                                        View your enhancement usage
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href="/dashboard/usage">View Usage</Link>
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Subscription Card */}
                            <Card>
                                <CardHeader>
                                    <CreditCard className="h-8 w-8 text-primary mb-2" />
                                    <CardTitle>Subscription</CardTitle>
                                    <CardDescription>
                                        Manage your subscription plan
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href="/pricing">View Plans</Link>
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Settings Card */}
                            <Card>
                                <CardHeader>
                                    <Settings className="h-8 w-8 text-primary mb-2" />
                                    <CardTitle>Settings</CardTitle>
                                    <CardDescription>
                                        Configure your preferences
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href="/dashboard/settings">Settings</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Actions */}
                        <div className="mt-12">
                            <Card variant="glass">
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <h2 className="text-2xl font-bold mb-4">Ready to enhance your writing?</h2>
                                        <p className="text-muted-foreground mb-6">
                                            Install the browser extension to start using Verba across the web
                                        </p>
                                        <Button size="lg" variant="glow" asChild>
                                            <Link href="/docs">Get Extension</Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}
