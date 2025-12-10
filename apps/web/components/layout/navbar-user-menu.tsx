'use client'

import Link from 'next/link'
import { Button } from '@ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@ui/dropdown-menu'
import { User, LogOut, Settings, BarChart3 } from 'lucide-react'
import { useLogout } from '@/lib/hooks/use-auth'
import { useSubscription } from '@/lib/hooks/use-subscription'
import { useRouter } from 'next/navigation'

interface NavbarUserMenuProps {
    user: {
        id: string
        email: string
        display_name: string
        avatar_url: string | null
    }
}

export function NavbarUserMenu({ user }: NavbarUserMenuProps) {
    const logout = useLogout()
    const router = useRouter()
    const { data: subscription, isLoading: subscriptionLoading } = useSubscription()

    const handleLogout = async () => {
        await logout.mutateAsync()
        router.push('/')
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="ghost" 
                    className="relative h-9 w-9 rounded-full cursor-pointer hover:bg-accent transition-colors"
                >
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
            <DropdownMenuContent 
                align="end" 
                className="w-56 animate-in slide-in-from-top-2 duration-200"
            >
                <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.display_name || 'User'}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        {subscriptionLoading ? (
                            <div className="h-3 w-20 animate-pulse rounded bg-muted mt-1" />
                        ) : subscription ? (
                            <p className="text-xs leading-none text-muted-foreground mt-1">
                                {subscription.tier_name}
                            </p>
                        ) : null}
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Dashboard
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/pricing" className="cursor-pointer">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Subscription
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="cursor-pointer text-destructive focus:text-destructive"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}