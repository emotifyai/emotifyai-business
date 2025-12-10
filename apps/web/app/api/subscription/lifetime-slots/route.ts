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

        // Use the database function to get lifetime offer status
        const { data, error } = await supabase
            .rpc('get_lifetime_offer_status')
            .single()

        if (error) {
            console.error('Error fetching lifetime offer status:', error)
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Failed to fetch lifetime offer status' 
                },
                { status: 500 }
            )
        }

        // Return the lifetime offer status
        return NextResponse.json({
            success: true,
            data: {
                total_slots: data.total_slots,
                used_slots: data.used_slots,
                remaining_slots: data.remaining_slots,
                is_available: data.is_available,
                show_urgency: data.show_urgency,
                percentage_taken: data.used_slots > 0 ? 
                    Math.round((data.used_slots / data.total_slots) * 100) : 0
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
        const { data: subscriberNumber, error } = await supabase
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