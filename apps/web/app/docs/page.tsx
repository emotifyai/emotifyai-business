import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Download, Key, MousePointerClick, Keyboard, Settings, Code, Zap } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Documentation - Verba',
    description: 'Complete guide to using Verba browser extension and web app',
}

export default function DocsPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                {/* Hero Section */}
                <section className="border-b bg-gradient-to-b from-background to-muted/20">
                    <div className="container py-16 md:py-24">
                        <div className="mx-auto max-w-3xl text-center">
                            <div className="mb-6 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
                                <BookOpen className="h-8 w-8 text-primary" />
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight md:text-5xl mb-4">
                                Documentation
                            </h1>
                            <p className="text-xl text-muted-foreground">
                                Everything you need to know about using Verba to enhance your writing.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Content */}
                <section className="container py-16 md:py-24">
                    <div className="mx-auto max-w-5xl space-y-12">
                        {/* Getting Started */}
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Getting Started</h2>
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Installation */}
                                <Card className="border-primary/20">
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-primary/10 p-2">
                                                <Download className="h-5 w-5 text-primary" />
                                            </div>
                                            <CardTitle>Installation</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <ol className="space-y-3 text-sm">
                                            <li className="flex gap-3">
                                                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">1</span>
                                                <span className="text-muted-foreground">Install the Verba extension from the <strong className="text-foreground">Chrome Web Store</strong> or <strong className="text-foreground">Firefox Add-ons</strong></span>
                                            </li>
                                            <li className="flex gap-3">
                                                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">2</span>
                                                <span className="text-muted-foreground">Click the Verba icon in your browser toolbar to open the popup</span>
                                            </li>
                                            <li className="flex gap-3">
                                                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">3</span>
                                                <span className="text-muted-foreground">Log in with your Verba account or create a new one</span>
                                            </li>
                                        </ol>
                                    </CardContent>
                                </Card>

                                {/* Authentication */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-blue-500/10 p-2">
                                                <Key className="h-5 w-5 text-blue-500" />
                                            </div>
                                            <CardTitle>Authentication</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            To use the extension, you need to authenticate. You can do this by:
                                        </p>
                                        <ul className="space-y-2 text-sm">
                                            <li className="flex items-start gap-2">
                                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                                <span className="text-muted-foreground">Logging in directly through the extension popup</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                                <span className="text-muted-foreground">Creating an API key in your dashboard and entering it in the extension settings</span>
                                            </li>
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Using Verba */}
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Using Verba</h2>
                            <div className="grid gap-6">
                                {/* Text Enhancement */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-green-500/10 p-2">
                                                <MousePointerClick className="h-5 w-5 text-green-500" />
                                            </div>
                                            <CardTitle>Enhancing Text</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="font-semibold mb-2">Context Menu Method</h4>
                                                <ol className="space-y-2 text-sm">
                                                    <li className="flex gap-3">
                                                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-500/10 text-xs font-semibold text-green-500">1</span>
                                                        <span className="text-muted-foreground">Select any text on a webpage</span>
                                                    </li>
                                                    <li className="flex gap-3">
                                                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-500/10 text-xs font-semibold text-green-500">2</span>
                                                        <span className="text-muted-foreground">Right-click to open the context menu</span>
                                                    </li>
                                                    <li className="flex gap-3">
                                                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-500/10 text-xs font-semibold text-green-500">3</span>
                                                        <span className="text-muted-foreground">Hover over "Verba" and select "Enhance"</span>
                                                    </li>
                                                    <li className="flex gap-3">
                                                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-500/10 text-xs font-semibold text-green-500">4</span>
                                                        <span className="text-muted-foreground">The text will be instantly rewritten with improved clarity and style</span>
                                                    </li>
                                                </ol>
                                            </div>
                                            <div className="rounded-lg bg-muted/50 p-4 border">
                                                <p className="text-sm text-muted-foreground">
                                                    <strong className="text-foreground">💡 Tip:</strong> The enhanced text automatically replaces your selection. You can undo the change using Ctrl+Z (Cmd+Z on Mac).
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Keyboard Shortcuts */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-purple-500/10 p-2">
                                                <Keyboard className="h-5 w-5 text-purple-500" />
                                            </div>
                                            <CardTitle>Keyboard Shortcuts</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between rounded-lg border bg-card p-3">
                                                <span className="text-sm text-muted-foreground">Enhance selected text</span>
                                                <kbd className="rounded bg-muted px-2 py-1 text-xs font-semibold">Ctrl+Shift+E</kbd>
                                            </div>
                                            <div className="flex items-center justify-between rounded-lg border bg-card p-3">
                                                <span className="text-sm text-muted-foreground">Open Verba popup</span>
                                                <kbd className="rounded bg-muted px-2 py-1 text-xs font-semibold">Ctrl+Shift+Y</kbd>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                <strong className="text-foreground">Note:</strong> On Mac, use Cmd instead of Ctrl
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Advanced Features */}
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Advanced Features</h2>
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* API Keys */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-orange-500/10 p-2">
                                                <Code className="h-5 w-5 text-orange-500" />
                                            </div>
                                            <CardTitle>API Keys</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            Create API keys to integrate Verba into your own applications:
                                        </p>
                                        <ul className="space-y-2 text-sm">
                                            <li className="flex items-start gap-2">
                                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                                                <span className="text-muted-foreground">Go to Dashboard → API Keys</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                                                <span className="text-muted-foreground">Click "Create API Key"</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                                                <span className="text-muted-foreground">Copy and store the key securely</span>
                                            </li>
                                        </ul>
                                        <div className="mt-3 rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                                            <p className="text-xs text-destructive">
                                                <strong>⚠️ Security:</strong> Never share your API keys publicly or commit them to version control.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Settings */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-cyan-500/10 p-2">
                                                <Settings className="h-5 w-5 text-cyan-500" />
                                            </div>
                                            <CardTitle>Extension Settings</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            Customize Verba to fit your workflow:
                                        </p>
                                        <ul className="space-y-2 text-sm">
                                            <li className="flex items-start gap-2">
                                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-500 flex-shrink-0" />
                                                <span className="text-muted-foreground"><strong className="text-foreground">Default Language:</strong> Set your preferred language</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-500 flex-shrink-0" />
                                                <span className="text-muted-foreground"><strong className="text-foreground">Default Tone:</strong> Choose professional, casual, or formal</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-500 flex-shrink-0" />
                                                <span className="text-muted-foreground"><strong className="text-foreground">Notifications:</strong> Enable/disable success notifications</span>
                                            </li>
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Quick Tips */}
                        <Card className="border-primary/20 bg-primary/5">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-primary/10 p-2">
                                        <Zap className="h-5 w-5 text-primary" />
                                    </div>
                                    <CardTitle>Quick Tips</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-sm">Best Practices</h4>
                                        <ul className="space-y-1.5 text-sm">
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary">✓</span>
                                                <span className="text-muted-foreground">Select complete sentences for better results</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary">✓</span>
                                                <span className="text-muted-foreground">Review AI suggestions before accepting</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary">✓</span>
                                                <span className="text-muted-foreground">Use keyboard shortcuts for faster workflow</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-sm">Troubleshooting</h4>
                                        <ul className="space-y-1.5 text-sm">
                                            <li className="flex items-start gap-2">
                                                <span className="text-muted-foreground">•</span>
                                                <span className="text-muted-foreground">If enhancement fails, check your internet connection</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-muted-foreground">•</span>
                                                <span className="text-muted-foreground">Verify you haven't exceeded your usage limit</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-muted-foreground">•</span>
                                                <span className="text-muted-foreground">Try refreshing the page if context menu doesn't appear</span>
                                            </li>
                                        </ul>
                                    </div>
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
