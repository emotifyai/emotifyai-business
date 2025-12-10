'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, LogOut, Settings, BarChart3 } from 'lucide-react'
import { useUser, useLogout } from '@/lib/hooks/use-auth'
import { useRouter } from 'next/navigation'

export function Header() {
    const { data: user, isLoading } = useUser()
    const logout = useLogout()
    const router = useRouter()

    const handleLogout = async () => {
        await logout.mutateAsync()
        router.push('/')
    }

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
                        className={`text-sm font-medium transition-colors ${typeof window !== 'undefined' && window.location.pathname === '/pricing'
                            ? 'text-primary'
                            : 'text-muted-foreground hover:text-primary'
                            }`}
                    >
                        Pricing
                    </Link>
                    <Link
                        href="/docs"
                        className={`text-sm font-medium transition-colors ${typeof window !== 'undefined' && window.location.pathname === '/docs'
                            ? 'text-primary'
                            : 'text-muted-foreground hover:text-primary'
                            }`}
                    >
                        Docs
                    </Link>
                    <Link
                        href="/about"
                        className={`text-sm font-medium transition-colors ${typeof window !== 'undefined' && window.location.pathname === '/about'
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
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                    {user.avatar_url ? (
                                        <img
                                            src={user.avatar_url}
                                            alt={user.display_name || 'User'}
                                            className="h-9 w-9 rounded-full object-cover"
                                        />
                                    ) : (
                                        <User className="h-5 w-5" />
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user.display_name || 'User'}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/pricing" className="cursor-pointer">
                                        <BarChart3 className="mr-2 h-4 w-4" />
                                        Subscription
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard" className="cursor-pointer">
                                        <Settings className="mr-2 h-4 w-4" />
                                        Dashboard
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <Button variant="ghost" asChild>
                                <Link href="/login">Login</Link>
                            </Button>
                            <Button variant="glow" asChild>
                                <Link href="/signup">Get Started</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
