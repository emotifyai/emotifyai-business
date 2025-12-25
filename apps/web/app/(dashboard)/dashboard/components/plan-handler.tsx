'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { LoadingSpinner } from '@ui/loading-spinner'

/**
 * PlanHandler Component
 * 
 * Automatically triggers checkout when a plan parameter is detected in the URL.
 * This handles the flow when users sign up with a plan selection.
 */
export function PlanHandler() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isProcessing, setIsProcessing] = useState(false)
    const plan = searchParams.get('plan')

    useEffect(() => {
        if (!plan || isProcessing) return

        // Don't auto-checkout for trial plan
        if (plan === 'trial') {
            // Just remove the parameter
            const url = new URL(window.location.href)
            url.searchParams.delete('plan')
            router.replace(url.pathname + url.search)
            return
        }

        // Trigger checkout for paid plans
        setIsProcessing(true)

        fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tier: plan,
                redirectUrl: window.location.origin + '/dashboard',
            }),
        })
            .then(res => res.json())
            .then(data => {
                if (data.url) {
                    window.location.href = data.url
                } else {
                    throw new Error(data.error || 'Failed to start checkout')
                }
            })
            .catch(error => {
                toast.error('Failed to start checkout. Please try again.')
                console.error(error)
                setIsProcessing(false)
                // Remove plan parameter on error
                const url = new URL(window.location.href)
                url.searchParams.delete('plan')
                router.replace(url.pathname + url.search)
            })
    }, [plan, isProcessing, router])

    if (!plan || plan === 'trial') return null

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-card p-8 rounded-lg shadow-lg flex flex-col items-center gap-4">
                <LoadingSpinner className="h-8 w-8" />
                <p className="text-lg font-medium">Redirecting to checkout...</p>
                <p className="text-sm text-muted-foreground">Please wait</p>
            </div>
        </div>
    )
}
