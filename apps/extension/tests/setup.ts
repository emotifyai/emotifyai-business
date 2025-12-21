import '@testing-library/jest-dom/vitest';
import { vi, beforeEach } from 'vitest';


/**
 * Test Setup for EmotifAI Extension
 * 
 * Configures:
 * - Browser API mocks (chrome.storage, chrome.contextMenus, etc.)
 * - WXT storage module mock
 * - MSW for API mocking
 * - Global test utilities
 */

// Note: No longer mocking wxt/storage as it's not used in the codebase

// Extend global type to include browser
declare global {
    // var browser: any;
    var chrome: any;
    var __mockStorage__: any;
}

// Mock browser APIs
(global as any).browser = {
    storage: {
        local: {
            get: vi.fn(async (keys) => {
                const storage = global.__mockStorage__ || {};
                if (typeof keys === 'string') {
                    return { [keys]: storage[keys] };
                }
                if (Array.isArray(keys)) {
                    const result: any = {};
                    keys.forEach((key) => {
                        result[key] = storage[key];
                    });
                    return result;
                }
                return storage;
            }),
            set: vi.fn(async (items) => {
                global.__mockStorage__ = {
                    ...global.__mockStorage__,
                    ...items,
                };
            }),
            remove: vi.fn(async (keys) => {
                const storage = global.__mockStorage__ || {};
                if (typeof keys === 'string') {
                    delete storage[keys];
                } else if (Array.isArray(keys)) {
                    keys.forEach((key) => delete storage[key]);
                }
                global.__mockStorage__ = storage;
            }),
            clear: vi.fn(async () => {
                global.__mockStorage__ = {};
            }),
        },
        sync: {
            get: vi.fn(),
            set: vi.fn(),
            remove: vi.fn(),
            clear: vi.fn(),
        },
    },
    contextMenus: {
        create: vi.fn(),
        update: vi.fn(),
        remove: vi.fn(),
        removeAll: vi.fn(),
        getAll: vi.fn(async () => [
            {
                id: 'enhance-text',
                title: 'Enhance with EmotifyAI',
                contexts: ['selection'],
                enabled: false,
            },
        ]),
        onClicked: {
            addListener: vi.fn(),
            removeListener: vi.fn(),
        },
    },
    runtime: {
        sendMessage: vi.fn(),
        onMessage: {
            addListener: vi.fn(),
            removeListener: vi.fn(),
        },
        onInstalled: {
            addListener: vi.fn(),
            removeListener: vi.fn(),
        },
        getURL: vi.fn((path) => `chrome-extension://mock-id/${path}`),
        id: 'mock-extension-id',
    },
    tabs: {
        sendMessage: vi.fn(),
        query: vi.fn(),
    },
};

// Also set chrome for compatibility
(global as any).chrome = (global as any).browser;

// Mock import.meta.env
vi.stubGlobal('import.meta', {
    env: {
        VITE_API_BASE_URL: 'http://localhost:3000/api',
        VITE_MOCK_API_ENABLED: 'true',
        VITE_EXTENSION_ID: 'mock-extension-id',
        VITE_LOG_LEVEL: 'error', // Reduce noise in tests
        DEV: true,
    },
});

// Reset mocks before each test
beforeEach(() => {
    global.__mockStorage__ = {};
    vi.clearAllMocks();
});
