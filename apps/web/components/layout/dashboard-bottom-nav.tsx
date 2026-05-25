'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Wand2, BarChart3, Settings } from 'lucide-react'
import { BottomNav, type BottomNavItem } from '@emotifyai/ui'

const navItems = [
  { href: '/dashboard', label: 'الرئيسية', icon: <LayoutDashboard /> },
  { href: '/dashboard/editor', label: 'المحرر', icon: <Wand2 /> },
  { href: '/dashboard/usage', label: 'الاستخدام', icon: <BarChart3 /> },
  { href: '/dashboard/settings', label: 'الإعدادات', icon: <Settings /> },
]

export function DashboardBottomNav() {
  const pathname = usePathname()

  const items: BottomNavItem[] = navItems.map((item) => ({
    ...item,
    active:
      item.href === '/dashboard'
        ? pathname === '/dashboard'
        : pathname.startsWith(item.href),
  }))

  return <BottomNav items={items} linkComponent={Link} />
}
