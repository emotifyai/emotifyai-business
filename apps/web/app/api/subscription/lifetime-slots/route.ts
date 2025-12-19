import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/subscription/lifetime-slots
 * 
 * Returns the current status of lifetime subscription slots
 * - total_slots: Total number of lifetime slots (500)
 * - used_slots: Number of slots already taken
 * - remaining_slots: Number of slots still available
 * - is_available: Whether the offer is still available
 * - show_urgency: Whether to show urgency messaging (< 50 slots remaining)
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Try to use the database function first
        const { data, error } = await supabase
            .rpc('get_lifetime_offer_status')
            .single()

        if (error) {
            console.error('Database function error, using fallback query:', error)
            
            // Fallback: manually count lifetime subscribers
            const { count, error: countError } = await supabase
                .from('lifetime_subscribers')
                .select('*', { count: 'exact', head: true })

            if (countError) {
                console.error('Error counting lifetime subscribers:', countError)
                return NextResponse.json(
                    { 
                        success: false, 
                        error: 'Failed to fetch lifetime offer status' 
                    },
                    { status: 500 }
                )
            }

            const usedSlots = count || 0
            const remainingSlots = Math.max(0, 500 - usedSlots)
            const percentageTaken = usedSlots > 0 ? Math.round((usedSlots / 500) * 100) : 0

            return NextResponse.json({
                success: true,
                data: {
                    total_slots: 500,
                    used_slots: usedSlots,
                    remaining_slots: remainingSlots,
                    is_available: remainingSlots > 0,
                    show_urgency: remainingSlots < 50 && remainingSlots > 0,
                    percentage_taken: percentageTaken
                }
            })
        }

        // Type assertion for the database function result
        const lifetimeData = data as {
            total_slots: number
            used_slots: number
            remaining_slots: number
            is_available: boolean
            show_urgency: boolean
        }

        // Return the lifetime offer status
        return NextResponse.json({
            success: true,
            data: {
                total_slots: lifetimeData.total_slots,
                used_slots: lifetimeData.used_slots,
                remaining_slots: lifetimeData.remaining_slots,
                is_available: lifetimeData.is_available,
                show_urgency: lifetimeData.show_urgency,
                percentage_taken: lifetimeData.used_slots > 0 ? 
                    Math.round((lifetimeData.used_slots / lifetimeData.total_slots) * 100) : 0
            }
        })

    } catch (error) {
        console.error('Unexpected error in lifetime-slots API:', error)
        return NextResponse.json(
            { 
                success: false, 
                error: 'Internal server error' 
            },
            { status: 500 }
        )
    }
}

/**
 * POST /api/subscription/lifetime-slots/reserve
 * 
 * Reserves a lifetime subscription slot for the authenticated user
 * Requires authentication
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Get the current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Authentication required' 
                },
                { status: 401 }
            )
        }

        // Try to reserve a lifetime slot
        const { data: subscriberNumber, error } = await (supabase as any)
            .rpc('reserve_lifetime_subscriber_slot', { user_uuid: user.id })
            .single()

        if (error) {
            console.error('Error reserving lifetime slot:', error)
            
            // Check if it's because slots are exhausted
            if (error.message?.includes('No lifetime slots remaining') || 
                error.message?.includes('Lifetime subscriber limit reached')) {
                return NextResponse.json(
                    { 
                        success: false, 
                        error: 'SLOTS_EXHAUSTED',
                        message: 'All lifetime subscription slots have been taken' 
                    },
                    { status: 400 }
                )
            }

            // Check if user already has a lifetime subscription
            if (error.message?.includes('User already has a lifetime subscription')) {
                return NextResponse.json(
                    { 
                        success: false, 
                        error: 'ALREADY_SUBSCRIBED',
                        message: 'User already has a lifetime subscription' 
                    },
                    { status: 400 }
                )
            }

            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Failed to reserve lifetime slot' 
                },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            data: {
                subscriber_number: subscriberNumber,
                message: `Successfully reserved lifetime subscription slot #${subscriberNumber}`
            }
        })

    } catch (error) {
        console.error('Unexpected error in lifetime slot reservation:', error)
        return NextResponse.json(
            { 
                success: false, 
                error: 'Internal server error' 
            },
            { status: 500 }
        )
    }
}
