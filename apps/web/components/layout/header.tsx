'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@ui/button'
import { useUser } from '@/lib/hooks/use-auth'
import { NavbarUserMenu } from './navbar-user-menu'

export function Header() {
    const { data: user, isLoading } = useUser()
    const pathname = usePathname()

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2">
                    <div className="text-gradient-brand text-2xl font-bold">EmotifyAI</div>
                </Link>

                {/* Navigation */}
                <nav className="hidden md:flex items-center space-x-6">
                    <Link
                        href="/pricing"
                        className={`text-sm font-medium transition-colors ${pathname === '/pricing'
                            ? 'text-primary'
                            : 'text-muted-foreground hover:text-primary'
                            }`}
                    >
                        Pricing
                    </Link>
                    <Link
                        href="/docs"
                        className={`text-sm font-medium transition-colors ${pathname === '/docs'
                            ? 'text-primary'
                            : 'text-muted-foreground hover:text-primary'
                            }`}
                    >
                        Docs
                    </Link>
                    <Link
                        href="/about"
                        className={`text-sm font-medium transition-colors ${pathname === '/about'
                            ? 'text-primary'
                            : 'text-muted-foreground hover:text-primary'
                            }`}
                    >
                        About
                    </Link>
                </nav>

                {/* Auth Actions */}
                <div className="flex items-center space-x-4">
                    {isLoading ? (
                        <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
                    ) : user ? (
                        <NavbarUserMenu user={user} />
                    ) : (
                        <>
                            <Button variant="ghost" asChild>
                                <Link href="/login">Login</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
