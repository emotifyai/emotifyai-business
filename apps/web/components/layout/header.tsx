'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@emotifyai/ui'
import { useUser } from '@/lib/hooks/use-auth'
import { NavbarUserMenu } from './navbar-user-menu'
import { ThemeToggle } from './theme-toggle'
import { MobileNavMenu } from './mobile-nav-menu'
import { cn } from '@/lib/utils'

export function Header({ showMobileMenu = true }: { showMobileMenu?: boolean }) {
  const { data: user, isLoading } = useUser()
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-top safe-area-x">
      <div className="page-container flex h-14 items-center justify-between gap-2 sm:h-16">
        <div className="flex min-w-0 items-center gap-2">
          {showMobileMenu && <MobileNavMenu />}
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <img
              src="/logo.svg"
              alt="EmotifyAI"
              className="h-8 w-8 shrink-0"
            />
            <span className="text-gradient-brand truncate text-lg font-bold sm:text-2xl">
              EmotifyAI
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          {[
            { href: '/pricing', label: 'Pricing' },
            { href: '/docs', label: 'Docs' },
            { href: '/about', label: 'About' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <span className="hidden sm:inline-flex">
            <ThemeToggle />
          </span>
          {isLoading ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted sm:w-24 sm:rounded-md" />
          ) : user ? (
            <NavbarUserMenu user={user} />
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
