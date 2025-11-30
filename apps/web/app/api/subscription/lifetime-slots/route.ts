import { NextResponse } from 'next/server';
import { getLifetimeSlotInfo } from '@/lib/subscription/lifetime-slots';

/**
 * GET /api/subscription/lifetime-slots
 * 
 * Returns current lifetime subscription slot availability
 * Public endpoint - no authentication required
 */
export async function GET() {
    try {
        const slotInfo = await getLifetimeSlotInfo();

        return NextResponse.json(slotInfo, {
            headers: {
                'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30'
            }
        });
    } catch (error) {
        console.error('[API] Error fetching lifetime slots:', error);

        return NextResponse.json(
            { error: 'Failed to fetch lifetime slot information' },
            { status: 500 }
        );
    }
}
