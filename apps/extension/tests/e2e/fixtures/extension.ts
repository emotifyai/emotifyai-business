import { test as base, chromium, type BrowserContext } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


/**
 * Extension fixture for Playwright tests
 * 
 * Loads the EmotifyAI extension into a browser context for testing
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
            headless: false, // Hack: set to false but use --headless=new arg
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
        let [background] = context.serviceWorkers();
        if (!background) {
            console.log('No service worker found initially, waiting...');
            try {
                background = await context.waitForEvent('serviceworker', { timeout: 5000 });
                console.log('Service worker found via event');
            } catch (e) {
                console.log('Timeout waiting for serviceworker event');
            }
        }

        let extensionId = background?.url().split('/')[2];

        if (!extensionId) {
            console.log('Could not determine extension ID from service worker, trying fallback...');
            // Fallback: Open chrome://extensions to find the ID
            // Note: This might be flaky if the extension didn't load at all
            try {
                const page = await context.newPage();
                await page.goto('chrome://extensions');
                // Wait for the extensions manager to load
                await page.waitForTimeout(1000);

                // Execute script to get extension ID
                // We look for the development extension
                extensionId = await page.evaluate(() => {
                    // @ts-ignore
                    const items = document.querySelector('extensions-manager')?.shadowRoot
                        ?.querySelector('extensions-item-list')?.shadowRoot
                        ?.querySelectorAll('extensions-item');

                    if (items) {
                        for (const item of items) {
                            // @ts-ignore
                            if (item.data && item.data.location === 'UNPACKED') {
                                // @ts-ignore
                                return item.data.id;
                            }
                        }
                    }
                    return null;
                });
                await page.close();
            } catch (err) {
                console.error('Fallback failed:', err);
            }
        }

        if (!extensionId) {
            throw new Error('Could not find extension ID. Extension might not have loaded.');
        }

        console.log(`Found Extension ID: ${extensionId}`);
        await use(extensionId);
    },
});

export { expect } from '@playwright/test';
