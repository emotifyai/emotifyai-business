/**
 * Mock Data Configuration
 * 
 * This module provides centralized mock data management following best practices
 * for separating mocking from production code.
 * 
 * Mocks are ONLY loaded in development when MOCK_AI_RESPONSES=true
 */

export const MOCK_ENABLED =
    process.env.NODE_ENV === 'development' &&
    process.env.MOCK_AI_RESPONSES === 'true';

/**
 * Initialize mock handlers
 * Only call this in development mode
 */
export async function initMocks() {
    if (!MOCK_ENABLED) {
        console.log('[Mocks] Skipping mock initialization (production mode or mocks disabled)');
        return;
    }

    console.log('[Mocks] Initializing mock handlers...');

    try {
        const { mockEnhancementService } = await import('./handlers');
        console.log('[Mocks] Mock handlers loaded successfully');
        return mockEnhancementService;
    } catch (error) {
        console.error('[Mocks] Failed to load mock handlers:', error);
        throw error;
    }
}

/**
 * Check if mocks are currently enabled
 */
export function isMockMode(): boolean {
    return MOCK_ENABLED;
}
