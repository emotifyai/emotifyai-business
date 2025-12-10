import { canMakeEnhancement, consumeCredits, hasFeatureAccess } from '../validation'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase server client
jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn()
}))

const mockSupabase = {
    rpc: jest.fn()
}

beforeEach(() => {
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
    jest.clearAllMocks()
})

describe('Subscription Validation', () => {
    describe('canMakeEnhancement', () => {
        it('should allow enhancement for user with available credits', async () => {
            // Mock can_use_credits RPC call
            mockSupabase.rpc
                .mockReturnValueOnce({
                    single: jest.fn().mockResolvedValue({ data: true, error: null })
                })
                .mockReturnValueOnce({
                    single: jest.fn().mockResolvedValue({
                        data: {
                            tier_name: 'basic_monthly',
                            credits_limit: 350,
                            credits_used: 100,
                            credits_remaining: 250,
                            credits_reset_date: '2024-02-01T00:00:00Z',
                            validity_days: null,
                            is_expired: false,
                            can_use: true
                        },
                        error: null
                    })
                })

            const result = await canMakeEnhancement('user-123')

            expect(result.allowed).toBe(true)
            expect(result.creditStatus?.credits_remaining).toBe(250)
            expect(result.reason).toBeUndefined()
        })

        it('should reject enhancement when credits exceeded', async () => {
            // Mock can_use_credits RPC call
            mockSupabase.rpc
                .mockReturnValueOnce({
                    single: jest.fn().mockResolvedValue({ data: false, error: null })
                })
                .mockReturnValueOnce({
                    single: jest.fn().mockResolvedValue({
                        data: {
                            tier_name: 'basic_monthly',
                            credits_limit: 350,
                            credits_used: 350,
                            credits_remaining: 0,
                            credits_reset_date: '2024-02-01T00:00:00Z',
                            validity_days: null,
                            is_expired: false,
                            can_use: false
                        },
                        error: null
                    })
                })

            const result = await canMakeEnhancement('user-123')

            expect(result.allowed).toBe(false)
            expect(result.reason).toBe('CREDIT_LIMIT_EXCEEDED')
            expect(result.creditStatus?.credits_remaining).toBe(0)
        })

        it('should reject enhancement for expired subscription', async () => {
            // Mock can_use_credits RPC call
            mockSupabase.rpc
                .mockReturnValueOnce({
                    single: jest.fn().mockResolvedValue({ data: false, error: null })
                })
                .mockReturnValueOnce({
                    single: jest.fn().mockResolvedValue({
                        data: {
                            tier_name: 'free',
                            credits_limit: 50,
                            credits_used: 25,
                            credits_remaining: 25,
                            credits_reset_date: null,
                            validity_days: 10,
                            is_expired: true,
                            can_use: false
                        },
                        error: null
                    })
                })

            const result = await canMakeEnhancement('user-123')

            expect(result.allowed).toBe(false)
            expect(result.reason).toBe('SUBSCRIPTION_EXPIRED')
            expect(result.creditStatus?.is_expired).toBe(true)
        })
    })

    describe('consumeCredits', () => {
        it('should successfully consume credits', async () => {
            mockSupabase.rpc.mockReturnValue({
                single: jest.fn().mockResolvedValue({
                    data: true,
                    error: null
                })
            })

            const result = await consumeCredits('user-123', 1)

            expect(result).toBe(true)
            expect(mockSupabase.rpc).toHaveBeenCalledWith('consume_credits', {
                user_uuid: 'user-123',
                credits_to_consume: 1
            })
        })

        it('should handle credit consumption failure', async () => {
            mockSupabase.rpc.mockReturnValue({
                single: jest.fn().mockResolvedValue({
                    data: false,
                    error: null
                })
            })

            const result = await consumeCredits('user-123', 1)

            expect(result).toBe(false)
        })

        it('should handle database errors', async () => {
            mockSupabase.rpc.mockReturnValue({
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Database error' }
                })
            })

            const result = await consumeCredits('user-123', 1)

            expect(result).toBe(false)
        })
    })

    describe('hasFeatureAccess', () => {
        it('should grant access to all tiers for basic features', () => {
            expect(hasFeatureAccess('free', 'text_enhancement')).toBe(true)
            expect(hasFeatureAccess('basic_monthly', 'text_enhancement')).toBe(true)
            expect(hasFeatureAccess('lifetime_launch', 'text_enhancement')).toBe(true)
        })
    })
})