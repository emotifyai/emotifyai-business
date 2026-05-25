'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@emotifyai/ui'
import {
    LayoutDashboard,
    Wand2,
    BarChart3,
    CreditCard,
    Key,
    Settings,
    LogOut,
    Menu,
} from 'lucide-react'
import { useLogout } from '@/lib/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { Sheet, SheetContent, SheetTrigger } from '@emotifyai/ui'
import { useState } from 'react'

const sidebarItems = [
    {
        title: 'نظرة عامة',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'المحرر',
        href: '/dashboard/editor',
        icon: Wand2,
    },
    {
        title: 'الاستخدام',
        href: '/dashboard/usage',
        icon: BarChart3,
    },
    {
        title: 'الإعدادات',
        href: '/dashboard/settings',
        icon: Settings,
    },
]

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname()
    const logout = useLogout()
    const router = useRouter()

    const handleLogout = async () => {
        await logout.mutateAsync()
        router.push('/')
    }

    return (
        <div className={cn('pb-12', className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <div className="space-y-1">
                        {sidebarItems.map((item) => (
                            <Button
                                key={item.href}
                                variant={pathname === item.href ? 'secondary' : 'ghost'}
                                className="w-full justify-start"
                                asChild
                            >
                                <Link href={item.href}>
                                    <item.icon className="me-2 h-4 w-4" />
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </div>
                </div>
                <div className="px-3 py-2">
                    <div className="space-y-1">
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={handleLogout}
                        >
                            <LogOut className="me-2 h-4 w-4" />
                            تسجيل الخروج
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function MobileSidebar() {
    const [open, setOpen] = useState(false)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" className="me-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">فتح القائمة</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="pe-0">
                <div className="px-7">
                    <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
                        <span className="text-gradient-brand text-2xl font-bold">إيموتيف<span className="text-primary">اي</span></span>
                    </Link>
                </div>
                <Sidebar className="my-4 h-[calc(100vh-8rem)] pb-10 ps-6" />
            </SheetContent>
        </Sheet>
    )
}
