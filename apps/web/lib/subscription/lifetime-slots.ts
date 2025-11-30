/**
 * Lifetime Subscription Slot Management
 * 
 * Manages the limited lifetime subscription slots (first 500 subscribers)
 */

import { createClient } from '@/lib/supabase/server';
import type { LifetimeSlotInfo } from './types';

/**
 * Get current lifetime slot information
 */
export async function getLifetimeSlotInfo(): Promise<LifetimeSlotInfo> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .rpc('get_lifetime_slot_info')
        .single();

    if (error) {
        console.error('[Lifetime Slots] Error fetching slot info:', error);
        throw new Error('Failed to fetch lifetime slot information');
    }

    return {
        total: data.total,
        used: data.used,
        remaining: data.remaining,
        percentage: data.percentage,
        available: data.remaining > 0
    };
}

/**
 * Reserve a lifetime subscription slot
 * Returns true if slot was successfully reserved, false if sold out
 */
export async function reserveLifetimeSlot(): Promise<boolean> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .rpc('reserve_lifetime_slot');

    if (error) {
        console.error('[Lifetime Slots] Error reserving slot:', error);
        throw new Error('Failed to reserve lifetime slot');
    }

    return data === true;
}

/**
 * Check if lifetime slots are available
 */
export async function areLifetimeSlotsAvailable(): Promise<boolean> {
    const info = await getLifetimeSlotInfo();
    return info.available;
}

/**
 * Get urgency message based on remaining slots
 */
export function getSlotUrgencyMessage(slotInfo: LifetimeSlotInfo): string | null {
    const { remaining, total } = slotInfo;
    const percentageRemaining = (remaining / total) * 100;

    if (remaining === 0) {
        return 'Sold Out! Lifetime offer is no longer available.';
    }

    if (remaining <= 10) {
        return `Only ${remaining} lifetime subscriptions left!`;
    }

    if (percentageRemaining <= 10) {
        return `Less than ${Math.ceil(percentageRemaining)}% of lifetime subscriptions remaining!`;
    }

    if (percentageRemaining <= 25) {
        return `Limited time offer - ${remaining} lifetime subscriptions available`;
    }

    return null;
}

/**
 * Get slot progress color based on availability
 */
export function getSlotProgressColor(slotInfo: LifetimeSlotInfo): string {
    const percentageUsed = slotInfo.percentage;

    if (percentageUsed >= 90) return 'red';
    if (percentageUsed >= 75) return 'orange';
    if (percentageUsed >= 50) return 'yellow';
    return 'green';
}

/**
 * Format slot count for display
 */
export function formatSlotCount(count: number): string {
    return count.toLocaleString();
}
