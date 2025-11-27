import { test as base, chromium, type BrowserContext } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


/**
 * Extension fixture for Playwright tests
 * 
 * Loads the Verba extension into a browser context for testing
 */

export type ExtensionFixtures = {
    context: BrowserContext;
    extensionId: string;
};

export const test = base.extend<ExtensionFixtures>({
    // Override context to load extension
    context: async ({ }, use) => {
        const pathToExtension = path.join(__dirname, '../../.output/chrome-mv3');

        const context = await chromium.launchPersistentContext('', {
            headless: true, // Use new headless mode which supports extensions
            args: [
                `--disable-extensions-except=${pathToExtension}`,
                `--load-extension=${pathToExtension}`,
                '--no-sandbox',
                '--headless=new', // Explicitly use new headless mode
            ],
        });

        await use(context);
        await context.close();
    },

    // Get extension ID for accessing extension pages
    extensionId: async ({ context }, use) => {
        // Wait for extension to load


        // Get extension ID from background page
        let [background] = context.serviceWorkers();
        if (!background) {
            background = await context.waitForEvent('serviceworker');
        }

        const extensionId = background.url().split('/')[2];
        await use(extensionId);
    },
});

export { expect } from '@playwright/test';
