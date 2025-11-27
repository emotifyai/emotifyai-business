'use client'

import { useMutation } from '@tanstack/react-query'
import { delay, mockEnhancementResponse } from '@/lib/mock-data'
import { EnhancementMode } from '@/types/database'

interface EnhanceOptions {
    text: string
    mode: EnhancementMode
    language?: string
    tone?: 'formal' | 'casual' | 'professional'
}

/**
 * Enhance text using AI
 */
export function useEnhancement() {
    return useMutation({
        mutationFn: async (options: EnhanceOptions) => {
            await delay(1000) // Simulate AI processing time
            return mockEnhancementResponse
        },
    })
}
