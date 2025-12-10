import { type Page, type Locator } from '@playwright/test';

/**
 * Page Object Model for Extension Popup
 */
export class PopupPage {
    readonly page: Page;
    readonly loginButton: Locator;
    readonly logoutButton: Locator;
    readonly settingsButton: Locator;
    readonly usageStats: Locator;
    readonly subscriptionBadge: Locator;
    readonly upgradeCTA: Locator;

    constructor(page: Page) {
        this.page = page;
        this.loginButton = page.getByRole('button', { name: /login/i });
        this.logoutButton = page.getByRole('button', { name: /logout/i });
        this.settingsButton = page.getByRole('button', { name: /settings/i });
        this.usageStats = page.locator('.dashboard__usage-stats');
        this.subscriptionBadge = page.locator('.dashboard__subscription-tier');
        this.upgradeCTA = page.getByRole('button', { name: /upgrade/i });
    }

    async open(extensionId: string) {
        await this.page.goto(`chrome-extension://${extensionId}/popup.html`);
        await this.page.waitForLoadState('networkidle');
    }

    async login() {
        await this.loginButton.click();
        // Wait for authentication to complete
        await this.page.waitForSelector('.dashboard', { timeout: 5000 });
    }

    async logout() {
        await this.logoutButton.click();
        await this.page.waitForSelector('.auth-view', { timeout: 5000 });
    }

    async getUsageCount(): Promise<{ used: number; limit: number }> {
        const usedText = await this.page.locator('.dashboard__usage-value').first().textContent();
        const limitText = await this.page.locator('.dashboard__usage-value').last().textContent();

        return {
            used: parseInt(usedText || '0'),
            limit: limitText === '∞' ? -1 : parseInt(limitText || '0'),
        };
    }

    async getSubscriptionTier(): Promise<string> {
        const tierText = await this.subscriptionBadge.textContent();
        return tierText?.toLowerCase().includes('trial') ? 'trial' :
            tierText?.toLowerCase().includes('monthly') ? 'monthly' :
                tierText?.toLowerCase().includes('lifetime') ? 'lifetime' : 'unknown';
    }

    async openSettings() {
        await this.settingsButton.click();
        await this.page.waitForSelector('.settings', { timeout: 5000 });
    }
}

/**
 * Page Object Model for Content Page (test pages)
 */
export class ContentPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async goto(url: string) {
        await this.page.goto(url);
        await this.page.waitForLoadState('networkidle');
    }

    async selectText(selector: string) {
        const element = this.page.locator(selector);
        await element.click({ clickCount: 3 }); // Triple-click to select all text
    }

    async selectTextByContent(text: string) {
        await this.page.evaluate((searchText) => {
            const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                null
            );

            let node;
            while ((node = walker.nextNode())) {
                if (node.textContent?.includes(searchText)) {
                    const range = document.createRange();
                    range.selectNodeContents(node);
                    const selection = window.getSelection();
                    selection?.removeAllRanges();
                    selection?.addRange(range);
                    break;
                }
            }
        }, text);
    }

    async rightClickSelected() {
        // Get the selected text's bounding box
        const selection = await this.page.evaluate(() => {
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) return null;
            const range = sel.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            return {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
            };
        });

        if (selection) {
            await this.page.mouse.click(selection.x, selection.y, { button: 'right' });
        }
    }

    async clickContextMenuItem(text: string) {
        // Context menu is in the browser's UI, not in the page
        // We'll need to use keyboard navigation
        await this.page.keyboard.press('ArrowDown'); // Navigate to first item
        await this.page.keyboard.press('Enter'); // Click it
    }

    async enhanceWithKeyboard() {
        // Use keyboard shortcut Ctrl+Shift+E
        await this.page.keyboard.press('Control+Shift+E');
    }

    async getTextContent(selector: string): Promise<string> {
        return await this.page.locator(selector).textContent() || '';
    }

    async waitForTextChange(selector: string, originalText: string, timeout = 10000) {
        await this.page.waitForFunction(
            ({ selector: sel, original }) => {
                const element = document.querySelector(sel);
                return element?.textContent !== original;
            },
            { selector, original: originalText },
            { timeout }
        );
    }

    async clickUndo() {
        const undoButton = this.page.locator('[data-testid="undo-button"]');
        await undoButton.click();
    }
}

/**
 * Helper to wait for extension to be ready
 */
export async function waitForExtension(page: Page, extensionId: string) {
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Give extension time to initialize
}

/**
 * Helper to simulate authentication
 */
export async function simulateLogin(page: Page, extensionId: string) {
    const popup = new PopupPage(page);
    await popup.open(extensionId);
    await popup.login();
}

/**
 * Helper to clear extension storage
 */
export async function clearExtensionStorage(page: Page) {
    await page.evaluate(() => {
        return new Promise<void>((resolve) => {
            chrome.storage.local.clear(() => resolve());
        });
    });
}
