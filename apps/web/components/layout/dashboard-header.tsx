'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Home, Menu } from 'lucide-react'
import { Button, Sheet, SheetContent, SheetTrigger, SheetTitle } from '@emotifyai/ui'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { NavbarUserMenu } from '@/components/layout/navbar-user-menu'
import { DashboardSidebarNav } from '@/components/layout/sidebar'
import { useUser } from '@/lib/hooks/use-auth'
import { useSubscription } from '@/lib/hooks/use-subscription'

export function DashboardHeader() {
  const { data: user, isLoading } = useUser()
  const { data: subscription, isLoading: subscriptionLoading } = useSubscription()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-md safe-area-top">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <div className="flex items-center gap-2 sm:gap-4">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full md:hidden"
                aria-label="فتح القائمة"
              >
                <Menu className="size-5 text-muted-foreground" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-64 border-l border-sidebar-border bg-sidebar p-0 pt-8"
              aria-describedby={undefined}
            >
              <SheetTitle className="sr-only">قائمة لوحة التحكم</SheetTitle>
              <DashboardSidebarNav
                className="px-4"
                onNavigate={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link href="/" aria-label="الصفحة الرئيسية">
              <Home className="size-5 text-muted-foreground" />
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          {!subscriptionLoading && subscription ? (
            <span className="hidden rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary lg:inline">
              {subscription.tier_name}
            </span>
          ) : null}
          {isLoading ? (
            <div
              className="size-10 animate-pulse rounded-full bg-muted"
              aria-hidden
            />
          ) : user ? (
            <NavbarUserMenu user={user} />
          ) : null}
        </div>
      </div>
    </header>
  )
}
