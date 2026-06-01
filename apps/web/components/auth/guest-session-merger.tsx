'use client'

import { useEffect, useRef } from 'react'
import { getGuestToken, clearGuestToken } from '@/lib/upgrade-prompt/guest-credits'
import { useQueryClient } from '@tanstack/react-query'

export function GuestSessionMerger() {
  const queryClient = useQueryClient()
  const attempted = useRef(false)

  useEffect(() => {
    // Only attempt once per session
    if (attempted.current) return
    attempted.current = true

    const token = getGuestToken()
    // If no token exists, the user never used the app as a guest, nothing to merge
    if (!token) return

    async function mergeGuestSession() {
      try {
        const res = await fetch('/api/guest/merge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const data = await res.json()
        
        if (data.success) {
          // Clear the token from localStorage so we don't keep trying
          clearGuestToken()

          // If credits were merged, invalidate the usage & subscription queries 
          // so the UI immediately reflects the deducted credits
          if (data.merged > 0) {
            void queryClient.invalidateQueries({ queryKey: ['usage-stats'] })
            void queryClient.invalidateQueries({ queryKey: ['subscription'] })
            console.log(`[DUCK guest/merge] merged ${data.merged} guest actions`)
          }
        }
      } catch (err) {
        console.error('[DUCK guest/merge] Failed to merge guest session:', err)
      }
    }

    void mergeGuestSession()
  }, [queryClient])

  return null
}
