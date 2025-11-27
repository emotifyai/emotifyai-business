import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
            <div className="mx-auto flex max-w-[500px] flex-col items-center justify-center text-center">
                <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                    <FileQuestion className="h-12 w-12 text-muted-foreground" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-4">404</h1>
                <h2 className="text-2xl font-semibold tracking-tight mb-4">Page not found</h2>
                <p className="text-muted-foreground mb-8 text-lg">
                    Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or never existed.
                </p>
                <div className="flex gap-4">
                    <Button variant="outline" asChild>
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" />
                            Go Home
                        </Link>
                    </Button>
                    <Button variant="ghost" asChild>
                        <Link href="javascript:history.back()">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Go Back
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
