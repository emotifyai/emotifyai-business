/**
 * Lemon Squeezy Product Management
 * 
 * Handles automatic disabling of the lifetime product when sold out
 */

import { LEMONSQUEEZY_CONFIG } from './config'

/**
 * Archive (disable) a product variant in Lemon Squeezy
 */
export async function archiveProductVariant(variantId: string): Promise<boolean> {
    try {
        const response = await fetch(
            `https://api.lemonsqueezy.com/v1/variants/${variantId}`,
            {
                method: 'PATCH',
                headers: {
                    'Accept': 'application/vnd.api+json',
                    'Content-Type': 'application/vnd.api+json',
                    'Authorization': `Bearer ${LEMONSQUEEZY_CONFIG.apiKey}`,
                },
                body: JSON.stringify({
                    data: {
                        type: 'variants',
                        id: variantId,
                        attributes: {
                            status: 'draft', // Set to draft to disable purchasing
                        },
                    },
                }),
            }
        )

        if (!response.ok) {
            const errorData = await response.json()
            console.error('[Lemon Squeezy] Failed to archive variant:', errorData)
            return false
        }

        console.log(`[Lemon Squeezy] Successfully archived variant ${variantId}`)
        return true
    } catch (error) {
        console.error('[Lemon Squeezy] Error archiving variant:', error)
        return false
    }
}

/**
 * Disable the lifetime launch offer product
 */
export async function disableLifetimeProduct(): Promise<boolean> {
    const variantId = process.env.LEMONSQUEEZY_LIFETIME_LAUNCH_VARIANT_ID

    if (!variantId) {
        console.error('[Lemon Squeezy] Lifetime variant ID not configured')
        return false
    }

    console.log('[Lemon Squeezy] Disabling lifetime product - sold out!')
    return await archiveProductVariant(variantId)
}

/**
 * Check if a variant is currently active (published)
 */
export async function isVariantActive(variantId: string): Promise<boolean> {
    try {
        const response = await fetch(
            `https://api.lemonsqueezy.com/v1/variants/${variantId}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/vnd.api+json',
                    'Authorization': `Bearer ${LEMONSQUEEZY_CONFIG.apiKey}`,
                },
            }
        )

        if (!response.ok) {
            console.error('[Lemon Squeezy] Failed to fetch variant status')
            return false
        }

        const data = await response.json()
        return data.data.attributes.status === 'published'
    } catch (error) {
        console.error('[Lemon Squeezy] Error checking variant status:', error)
        return false
    }
}
