'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Wand2, BarChart3, Settings } from 'lucide-react'
import { BottomNav, type BottomNavItem } from '@emotifyai/ui'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: <LayoutDashboard /> },
  { href: '/dashboard/editor', label: 'Editor', icon: <Wand2 /> },
  { href: '/dashboard/usage', label: 'Usage', icon: <BarChart3 /> },
  { href: '/dashboard/settings', label: 'Settings', icon: <Settings /> },
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
