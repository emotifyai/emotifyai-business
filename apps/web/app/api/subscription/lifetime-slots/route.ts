import { NextResponse } from 'next/server'

/** Lifetime launch offer retired — endpoint kept for backward-compatible clients. */
export async function GET() {
    return NextResponse.json({
        success: true,
        data: {
            retired: true,
            total_slots: 0,
            used_slots: 0,
            remaining_slots: 0,
            is_available: false,
            show_urgency: false,
            percentage_taken: 100,
        },
    })
}

export async function POST() {
    return NextResponse.json(
        {
            success: false,
            error: 'Lifetime offer is no longer available',
        },
        { status: 410 }
    )
}
