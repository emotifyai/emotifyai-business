import { setupWorker } from 'msw/browser';
import { handlers } from './api/handlers';

export const worker = setupWorker(...handlers);

// Start the worker only if mock mode is enabled
export async function startMockAPI(): Promise<void> {
    const mockEnabled = import.meta.env.VITE_MOCK_API_ENABLED === 'true';

    if (mockEnabled) {
        await worker.start({
            onUnhandledRequest: 'bypass',
            serviceWorker: {
                url: '/mockServiceWorker.js',
            },
        });
        console.log('[MSW] Mock API enabled');
    }
}
