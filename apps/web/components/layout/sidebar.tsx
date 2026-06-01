'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LogOut } from 'lucide-react'
import { useLogout } from '@/lib/hooks/use-auth'
import { useRouter } from 'next/navigation'
import {
  dashboardNavItems,
  isDashboardNavActive,
} from '@/components/layout/dashboard-nav'

type DashboardSidebarNavProps = {
  className?: string
  onNavigate?: () => void
}

export function DashboardSidebarBrand() {
  return (
    <Link
      href="/"
      className="mb-10 block rounded-lg px-4 py-2 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
      aria-label="EmotifyAI — الصفحة الرئيسية"
    >
      <h1 className="text-xl font-bold tracking-tight">
        <span className="text-gradient-brand">Emotify</span>
        <span className="text-primary">AI</span>
      </h1>
      <p className="mt-1 text-xs tracking-wide text-muted-foreground/80">
        لوحة التحكم
      </p>
    </Link>
  )
}

export function DashboardSidebarNav({
  className,
  onNavigate,
}: DashboardSidebarNavProps) {
  const pathname = usePathname()
  const logout = useLogout()
  const router = useRouter()

  const handleLogout = async () => {
    await logout.mutateAsync()
    onNavigate?.()
    router.push('/')
  }

  return (
    <div className={cn('flex h-full flex-col', className)}>
      <DashboardSidebarBrand />
      <nav className="flex-1 space-y-2" aria-label="لوحة التحكم">
        {dashboardNavItems.map((item) => {
          const isActive = isDashboardNavActive(pathname, item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar',
                isActive
                  ? 'bg-secondary font-bold text-secondary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              <span>{item.title}</span>
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto border-t border-sidebar-border pt-6 px-4">
        <button
          type="button"
          onClick={handleLogout}
          disabled={logout.isPending}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-0 py-1 text-sm text-destructive transition-opacity',
            'hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar',
            logout.isPending && 'pointer-events-none opacity-60'
          )}
        >
          <LogOut className="size-5 shrink-0" aria-hidden />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  )
}

export function DashboardSidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        'fixed inset-y-0 right-0 z-50 hidden w-64 flex-col border-l border-sidebar-border bg-sidebar py-8 px-4 md:flex',
        className
      )}
      aria-label="القائمة الجانبية"
    >
      <DashboardSidebarNav />
    </aside>
  )
}

/** @deprecated Use DashboardSidebarNav inside DashboardMobileNav */
export function Sidebar(props: DashboardSidebarNavProps) {
  return <DashboardSidebarNav {...props} />
}

/** @deprecated Use DashboardMobileNav from dashboard-header */
export function MobileSidebar() {
  return <DashboardSidebarNav className="px-2" />
}
