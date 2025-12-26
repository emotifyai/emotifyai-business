'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@ui/button'
import {
    LayoutDashboard,
    BarChart3,
    CreditCard,
    Key,
    Settings,
    LogOut,
    Menu,
} from 'lucide-react'
import { useLogout } from '@/lib/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { Sheet, SheetContent, SheetTrigger } from '@ui/sheet'
import { useState } from 'react'

const sidebarItems = [
    {
        title: 'Overview',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Usage',
        href: '/dashboard/usage',
        icon: BarChart3,
    },
    // {
    //     title: 'Subscription',
    //     href: '/dashboard/subscription',
    //     icon: CreditCard,
    // },
    // {
    //     title: 'API Keys',
    //     href: '/dashboard/api-keys',
    //     icon: Key,
    // },
    {
        title: 'Settings',
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
                                    <item.icon className="mr-2 h-4 w-4" />
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
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
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
                <Button variant="ghost" className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
                <div className="px-7">
                    <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
                        <span className="text-gradient-brand text-2xl font-bold">EmotifyAI</span>
                    </Link>
                </div>
                <Sidebar className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6" />
            </SheetContent>
        </Sheet>
    )
}
