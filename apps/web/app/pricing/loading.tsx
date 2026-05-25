import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Skeleton } from '@emotifyai/ui'

export default function PricingLoading() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                <section className="page-container py-12 sm:py-16">
                    <div className="mx-auto mb-10 max-w-3xl text-center space-y-3">
                        <Skeleton className="mx-auto h-10 w-48" />
                        <Skeleton className="mx-auto h-5 w-72" />
                    </div>
                    <Skeleton className="mx-auto mb-8 h-14 max-w-4xl rounded-xl" />
                    <div className="mx-auto flex max-w-4xl flex-col gap-4 md:hidden">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Skeleton key={i} className="h-36 rounded-xl" />
                        ))}
                    </div>
                    <Skeleton className="mx-auto hidden h-96 max-w-4xl rounded-xl md:block" />
                </section>
            </main>
            <Footer />
        </div>
    )
}
