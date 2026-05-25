'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { useState } from 'react'
import { Button, Sheet, SheetContent, SheetTrigger } from '@emotifyai/ui'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './theme-toggle'

const publicNavItems = [
  { href: '/pricing', label: 'Pricing' },
  { href: '/docs', label: 'Docs' },
  { href: '/about', label: 'About' },
]

export function MobileNavMenu() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="safe-area-top w-full sm:max-w-sm">
        <div className="flex flex-col gap-6 pt-2">
          <Link
            href="/"
            className="text-gradient-brand text-xl font-bold"
            onClick={() => setOpen(false)}
          >
            EmotifyAI
          </Link>
          <nav className="flex flex-col gap-1">
            {publicNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'touch-target flex items-center rounded-lg px-3 text-base font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground active:bg-muted'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center justify-between border-t pt-4">
            <span className="text-sm text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
