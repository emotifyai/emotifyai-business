import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function PricingLoading() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                {/* Hero Section */}
                <section className="border-b bg-gradient-to-b from-background to-muted/20">
                    <div className="container py-16 md:py-24">
                        <div className="mx-auto max-w-3xl text-center space-y-4">
                            <Skeleton className="h-12 w-64 mx-auto" />
                            <Skeleton className="h-6 w-96 mx-auto" />
                        </div>
                    </div>
                </section>

                {/* Pricing Cards */}
                <section className="container py-16 md:py-24">
                    <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className={i === 2 ? 'border-primary shadow-lg' : ''}>
                                <CardHeader className="text-center">
                                    <Skeleton className="h-6 w-24 mx-auto mb-2" />
                                    <Skeleton className="h-10 w-32 mx-auto mb-2" />
                                    <Skeleton className="h-4 w-40 mx-auto" />
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        {[1, 2, 3, 4, 5].map((j) => (
                                            <Skeleton key={j} className="h-4 w-full" />
                                        ))}
                                    </div>
                                    <Skeleton className="h-10 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}
