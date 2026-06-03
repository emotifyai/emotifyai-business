'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from '@emotifyai/ui'

export function AuthMessageHandler() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const handled = useRef(false)

    useEffect(() => {
        if (handled.current) return

        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        const messageParam = searchParams.get('message')
        
        let hasError = false
        let hasMessage = false
        let errorMessage = ''
        let successMessage = ''

        if (error) {
            hasError = true
            errorMessage = errorDescription ? decodeURIComponent(errorDescription.replace(/\+/g, ' ')) : error
        } else if (typeof window !== 'undefined' && window.location.hash.includes('error=')) {
            const hashParams = new URLSearchParams(window.location.hash.substring(1))
            const hashError = hashParams.get('error')
            const hashDesc = hashParams.get('error_description')
            
            if (hashError) {
                hasError = true
                errorMessage = hashDesc ? decodeURIComponent(hashDesc.replace(/\+/g, ' ')) : hashError
            }
        }

        if (messageParam) {
            hasMessage = true
            if (messageParam === 'verified') {
                successMessage = 'تم التحقق من البريد الإلكتروني بنجاح! يمكنك الآن استخدام حسابك.'
            } else {
                successMessage = decodeURIComponent(messageParam.replace(/\+/g, ' '))
            }
        }

        if (hasError || hasMessage) {
            handled.current = true
            
            // Clean up the URL first
            if (typeof window !== 'undefined') {
                const url = new URL(window.location.href)
                url.searchParams.delete('error')
                url.searchParams.delete('error_code')
                url.searchParams.delete('error_description')
                url.searchParams.delete('message')
                url.hash = ''
                // We use replaceState instead of router.replace so it doesn't trigger a re-render
                // before the toast has a chance to show up on the initial load.
                window.history.replaceState({}, '', url.pathname + url.search)
            }

            // Show toasts after a slight delay to ensure the Toaster component is fully mounted
            setTimeout(() => {
                if (hasError) {
                    let translatedMessage = 'حدث خطأ في المصادقة. يرجى المحاولة مرة أخرى.'
                    if (errorMessage.toLowerCase().includes('expired') || errorMessage.toLowerCase().includes('invalid')) {
                        translatedMessage = 'رابط التفعيل غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد.'
                    } else if (errorMessage) {
                        translatedMessage = `خطأ: ${errorMessage}`
                    }
                    toast.error(translatedMessage, { duration: 8000 })
                }

                if (hasMessage) {
                    toast.success(successMessage, { duration: 6000 })
                }
            }, 150)
        }
    }, [searchParams, router])

    return null
}
