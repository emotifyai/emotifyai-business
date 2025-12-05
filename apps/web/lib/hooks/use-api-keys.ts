/**
 * Custom hook for API key management
 * 
 * @future - Will be used when API key management UI is implemented
 * @see Planned feature: User-managed API keys for bring-your-own-key model
 * @status Not yet implemented - awaiting backend API key management endpoints
 */

import { useState, useEffect } from 'react'

export interface ApiKey {
    id: string
    name: string
    key: string
    createdAt: string
    lastUsed?: string
}

export function useApiKeys() {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    // Future implementation will fetch from /api/keys
    useEffect(() => {
        setLoading(false)
    }, [])

    return { apiKeys, loading, error }
}
