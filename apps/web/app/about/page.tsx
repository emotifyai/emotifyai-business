import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export const metadata: Metadata = {
    title: 'About - Verba',
    description: 'Learn more about Verba and our mission',
}

export default function AboutPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                <section className="container py-24 max-w-3xl">
                    <h1 className="text-4xl font-bold tracking-tight mb-8">About Verba</h1>

                    <div className="prose prose-zinc dark:prose-invert max-w-none">
                        <p className="text-xl text-muted-foreground mb-8">
                            Verba is an AI-powered writing assistant designed to help you communicate with clarity and confidence in any language.
                        </p>

                        <h2>Our Mission</h2>
                        <p>
                            We believe that language shouldn't be a barrier to effective communication. Whether you're writing an important email, a technical document, or a creative piece, Verba helps you find the right words instantly.
                        </p>

                        <h2>How It Works</h2>
                        <p>
                            Verba leverages the power of Claude 3.5 Sonnet, one of the most advanced AI models available, to understand the context and nuance of your writing. Our browser extension integrates seamlessly into your workflow, allowing you to enhance text directly where you write.
                        </p>

                        <h2>Privacy First</h2>
                        <p>
                            We take your privacy seriously. Verba is designed with a security-first approach:
                        </p>
                        <ul>
                            <li>No sensitive data is stored on our servers</li>
                            <li>Your text is processed securely and not used for training AI models</li>
                            <li>We do not track your browsing history</li>
                        </ul>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}
