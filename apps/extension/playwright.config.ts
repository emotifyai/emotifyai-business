import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Playwright configuration for Verba Extension E2E tests
 * 
 * Tests the extension in a real browser environment with MSW mocking
 */
export default defineConfig({
    testDir: './e2e',

    // Maximum time one test can run
    timeout: 30 * 1000,

    // Test execution settings
    fullyParallel: false, // Extensions share state, run sequentially
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1, // Single worker for extension tests

    // Reporter configuration
    reporter: [
        ['html', { outputFolder: 'test-results/html' }],
        ['list'],
        ['json', { outputFile: 'test-results/results.json' }],
    ],

    // Shared settings for all projects
    use: {
        // Base URL for test pages
        baseURL: 'http://localhost:5173',

        // Collect trace on failure
        trace: 'on-first-retry',

        // Screenshot on failure
        screenshot: 'only-on-failure',

        // Video on failure
        video: 'retain-on-failure',

        // Timeout for each action
        actionTimeout: 10 * 1000,
    },

    // Configure projects for different browsers
    projects: [
        {
            name: 'chromium-extension',
            use: {
                ...devices['Desktop Chrome'],
                // Extension will be loaded via fixtures
            },
        },

        // Firefox extension testing (optional, can enable later)
        // {
        //   name: 'firefox-extension',
        //   use: {
        //     ...devices['Desktop Firefox'],
        //   },
        // },
    ],

    // Run dev server before tests (for test pages)
    webServer: {
        command: 'bun run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },
});
