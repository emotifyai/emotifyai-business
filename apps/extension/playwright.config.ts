import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for EmotifyAI Extension E2E tests
 * 
 * Tests the extension in a real browser environment
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
        ['html', { outputFolder: 'playwright-report' }],
        ['list'],
        ['json', { outputFile: 'test-results/results.json' }],
    ],

    // Shared settings for all projects
    use: {
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
            },
        },
    ],
});
