'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from '@emotifyai/ui'

export function AuthErrorHandler() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const handled = useRef(false)

    useEffect(() => {
        if (handled.current) return

        // Supabase puts errors in both searchParams and hash
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        
        let hasError = false
        let message = ''

        if (error) {
            hasError = true
            message = errorDescription ? decodeURIComponent(errorDescription.replace(/\+/g, ' ')) : error
        } else if (typeof window !== 'undefined' && window.location.hash.includes('error=')) {
            // Parse hash fragment if it contains error
            const hashParams = new URLSearchParams(window.location.hash.substring(1))
            const hashError = hashParams.get('error')
            const hashDesc = hashParams.get('error_description')
            
            if (hashError) {
                hasError = true
                message = hashDesc ? decodeURIComponent(hashDesc.replace(/\+/g, ' ')) : hashError
            }
        }

        if (hasError) {
            handled.current = true
            
            // Translate common Supabase error messages
            let translatedMessage = 'حدث خطأ في المصادقة. يرجى المحاولة مرة أخرى.'
            if (message.toLowerCase().includes('expired') || message.toLowerCase().includes('invalid')) {
                translatedMessage = 'رابط التفعيل غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد.'
            } else if (message) {
                translatedMessage = `خطأ: ${message}`
            }

            toast.error(translatedMessage, { duration: 8000 })

            // Clean up the URL
            if (typeof window !== 'undefined') {
                const url = new URL(window.location.href)
                url.searchParams.delete('error')
                url.searchParams.delete('error_code')
                url.searchParams.delete('error_description')
                url.hash = ''
                router.replace(url.pathname + url.search)
            }
        }
    }, [searchParams, router])

    return null
}
