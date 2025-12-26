'use client'

import { Button } from '@ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { SubscriptionTier } from '@/lib/subscription/types'
import { LoadingSpinner } from '@ui/loading-spinner'

interface PricingButtonProps {
    tier: SubscriptionTier
    fromNewUser: boolean
    isFree: boolean
    isLifetime: boolean
    buttonText: string
    variant: 'default' | 'outline' | 'glow' | 'destructive' | 'secondary' | 'ghost' | 'link'
    soldOut?: boolean
    isAuthenticated?: boolean
    disabled?: boolean
    isCurrentPlan?: boolean
    isDowngrade?: boolean
}

export function PricingButton({
    tier,
    fromNewUser,
    isFree,
    isLifetime,
    buttonText,
    variant,
    soldOut = false,
    isAuthenticated = false,
    disabled = false,
    isCurrentPlan = false,
    isDowngrade = false
}: PricingButtonProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleCheckout = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tier,
                    redirectUrl: window.location.origin + '/dashboard',
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to start checkout')
            }

            if (data.url) {
                window.location.href = data.url
            } else {
                throw new Error('No checkout URL returned')
            }
        } catch (error) {
            toast.error('Something went wrong. Please try again.')
            console.error(error)
            setIsLoading(false)
        }
    }

    // Show SOLD OUT for lifetime if no slots available
    if (soldOut && isLifetime) {
        return (
            <Button className="w-full" variant="destructive" disabled>
                SOLD OUT
            </Button>
        )
    }

    // Show Current Plan for user's active subscription
    if (isCurrentPlan) {
        return (
            <Button className="w-full" variant="default" disabled>
                ✓ Current Plan
            </Button>
        )
    }

    // Show Not Available for downgrades (e.g., lifetime user trying to buy monthly)
    if (isDowngrade) {
        return (
            <Button className="w-full" variant="outline" disabled>
                Not Available
            </Button>
        )
    }

    // Show disabled state for any other disabled scenarios
    if (disabled) {
        return (
            <Button className="w-full" variant="outline" disabled>
                {buttonText}
            </Button>
        )
    }

    // Logic for Free Plan
    if (isFree) {
        if (fromNewUser || isAuthenticated) {
            return (
                <Button className="w-full" variant={variant} asChild>
                    <Link href="/dashboard">
                        {buttonText}
                    </Link>
                </Button>
            )
        }
        return (
            <Button className="w-full" variant={variant} asChild>
                <Link href="/signup?plan=trial">
                    {buttonText}
                </Link>
            </Button>
        )
    }

    // Logic for Paid Plans
    // If user is authenticated (and not from new_user flow), trigger checkout directly
    if (isAuthenticated && !fromNewUser) {
        return (
            <Button
                className="w-full"
                variant={variant}
                onClick={handleCheckout}
                disabled={isLoading}
            >
                {isLoading && <LoadingSpinner className="mr-2 h-4 w-4" />}
                {buttonText}
            </Button>
        )
    }

    // If from new user (just signed up), trigger checkout
    if (fromNewUser) {
        return (
            <Button
                className="w-full"
                variant={variant}
                onClick={handleCheckout}
                disabled={isLoading}
            >
                {isLoading && <LoadingSpinner className="mr-2 h-4 w-4" />}
                {buttonText}
            </Button>
        )
    }

    // Default: Not logged in -> Go to signup with plan parameter
    return (
        <Button className="w-full" variant={variant} asChild>
            <Link href={`/signup?plan=${tier}`}>
                {buttonText}
            </Link>
        </Button>
    )
}
