import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  FilePenLine,
  BarChart3,
  CreditCard,
  Receipt,
  Settings,
} from 'lucide-react'

export type DashboardNavItem = {
  title: string
  href: string
  icon: LucideIcon
}

export const dashboardNavItems: DashboardNavItem[] = [
  { title: 'نظرة عامة', href: '/dashboard', icon: LayoutDashboard },
  { title: 'المحرر', href: '/dashboard/editor', icon: FilePenLine },
  { title: 'الاستخدام', href: '/dashboard/usage', icon: BarChart3 },
  { title: 'الاشتراك', href: '/dashboard/subscription', icon: CreditCard },
  { title: 'الفواتير', href: '/dashboard/invoices', icon: Receipt },
  { title: 'الإعدادات', href: '/dashboard/settings', icon: Settings },
]

export function isDashboardNavActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') {
    return pathname === '/dashboard'
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}
