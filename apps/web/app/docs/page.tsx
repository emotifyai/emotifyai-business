import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
    title: 'Documentation - Verba',
    description: 'How to use Verba browser extension and web app',
}

export default function DocsPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                <section className="container py-24 max-w-4xl">
                    <h1 className="text-4xl font-bold tracking-tight mb-4">Documentation</h1>
                    <p className="text-xl text-muted-foreground mb-12">
                        Everything you need to know about using Verba.
                    </p>

                    <div className="grid gap-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Getting Started</CardTitle>
                            </CardHeader>
                            <CardContent className="prose prose-zinc dark:prose-invert max-w-none">
                                <h3>Installation</h3>
                                <ol>
                                    <li>Install the Verba extension from the Chrome Web Store or Firefox Add-ons.</li>
                                    <li>Click the Verba icon in your browser toolbar to open the popup.</li>
                                    <li>Log in with your Verba account or create a new one.</li>
                                </ol>

                                <h3>Authentication</h3>
                                <p>
                                    To use the extension, you need to authenticate. You can do this by:
                                </p>
                                <ul>
                                    <li>Logging in directly through the extension popup</li>
                                    <li>Creating an API key in your dashboard and entering it in the extension settings</li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Using Verba</CardTitle>
                            </CardHeader>
                            <CardContent className="prose prose-zinc dark:prose-invert max-w-none">
                                <h3>Enhancing Text</h3>
                                <p>
                                    1. Select any text on a webpage.<br />
                                    2. Right-click to open the context menu.<br />
                                    3. Hover over "Verba" and select "Enhance".<br />
                                    4. The text will be instantly rewritten with improved clarity and style.
                                </p>

                                <h3>Keyboard Shortcuts</h3>
                                <ul>
                                    <li><code>Ctrl+Shift+E</code> (Cmd+Shift+E on Mac): Enhance selected text</li>
                                    <li><code>Ctrl+Shift+Y</code>: Open Verba popup</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}
