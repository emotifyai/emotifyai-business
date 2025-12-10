import { useState, useEffect, useCallback } from 'react'

export interface LifetimeSlotInfo {
    total_slots: number
    used_slots: number
    remaining_slots: number
    is_available: boolean
    show_urgency: boolean
    percentage_taken: number
}

export interface UseLifetimeSlotsReturn {
    data: LifetimeSlotInfo | null
    isLoading: boolean
    error: string | null
    refetch: () => Promise<void>
}

/**
 * Hook for managing lifetime subscription slot data
 * Automatically refreshes every 30 seconds
 */
export function useLifetimeSlots(refreshInterval: number = 30000): UseLifetimeSlotsReturn {
    const [data, setData] = useState<LifetimeSlotInfo | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchSlotInfo = useCallback(async () => {
        try {
            const response = await fetch('/api/subscription/lifetime-slots')
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            const result = await response.json()
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch slot information')
            }

            setData(result.data)
            setError(null)
        } catch (err) {
            console.error('Error fetching lifetime slots:', err)
            setError(err instanceof Error ? err.message : 'Failed to fetch slot information')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        // Initial fetch
        fetchSlotInfo()

        // Set up auto-refresh if interval is provided
        if (refreshInterval > 0) {
            const interval = setInterval(fetchSlotInfo, refreshInterval)
            return () => clearInterval(interval)
        }
    }, [fetchSlotInfo, refreshInterval])

    return {
        data,
        isLoading,
        error,
        refetch: fetchSlotInfo
    }
}

/**
 * Hook for reserving a lifetime subscription slot
 */
export function useReserveLifetimeSlot() {
    const [isReserving, setIsReserving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const reserveSlot = useCallback(async (): Promise<{
        success: boolean
        subscriberNumber?: number
        error?: string
    }> => {
        setIsReserving(true)
        setError(null)

        try {
            const response = await fetch('/api/subscription/lifetime-slots', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            const result = await response.json()

            if (!result.success) {
                setError(result.error || 'Failed to reserve slot')
                return {
                    success: false,
                    error: result.error || 'Failed to reserve slot'
                }
            }

            return {
                success: true,
                subscriberNumber: result.data.subscriber_number
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to reserve slot'
            setError(errorMessage)
            return {
                success: false,
                error: errorMessage
            }
        } finally {
            setIsReserving(false)
        }
    }, [])

    return {
        reserveSlot,
        isReserving,
        error
    }
}
