import { test, expect } from './fixtures/extension.ts';
import { PopupPage, ContentPage, simulateLogin, clearExtensionStorage } from './helpers/page-objects.ts';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * E2E Tests: Subscription & Usage Limits
 * 
 * Tests subscription tiers, usage tracking, and limit enforcement
 */

test.describe('Subscription & Usage Limits', () => {
    test.beforeEach(async ({ page, extensionId }) => {
        await clearExtensionStorage(page);
    });

    test('trial user should see correct subscription badge', async ({ page, extensionId }) => {
        // Arrange & Act
        await simulateLogin(page, extensionId);
        const popup = new PopupPage(page);
        await popup.open(extensionId);

        // Assert
        const tier = await popup.getSubscriptionTier();
        expect(tier).toBe('trial');

        const usage = await popup.getUsageCount();
        expect(usage.limit).toBe(10);
    });

    test('trial user should see usage increment after enhancement', async ({ page, extensionId }) => {
        // Arrange
        await simulateLogin(page, extensionId);
        const popup = new PopupPage(page);
        await popup.open(extensionId);

        const initialUsage = await popup.getUsageCount();
        expect(initialUsage.used).toBe(0);

        // Act: Enhance text
        const testPagePath = path.join(__dirname, '../fixtures/test-pages/simple.html');
        const contentPage = new ContentPage(await page.context().newPage());
        await contentPage.goto(`file://${testPagePath}`);
        await contentPage.selectText('#sample-text-1');
        await contentPage.enhanceWithKeyboard();

        const originalText = await contentPage.getTextContent('#sample-text-1');
        await contentPage.waitForTextChange('#sample-text-1', originalText);

        // Assert
        await popup.open(extensionId);
        const newUsage = await popup.getUsageCount();
        expect(newUsage.used).toBe(1);
    });

    test('trial user should see warning at 80% usage', async ({ page, extensionId }) => {
        // Arrange: Mock user with 8/10 usage
        await page.evaluate(() => {
            chrome.storage.local.set({
                authToken: 'mock-token',
                usageStats: { used: 8, limit: 10, lastUsed: new Date().toISOString() }
            });
        });

        // Act
        const popup = new PopupPage(page);
        await popup.open(extensionId);

        // Assert: Warning should be visible
        const warning = page.locator('.dashboard__usage-warning');
        await expect(warning).toBeVisible();
        await expect(warning).toContainText('running low');
    });

    test('trial user at limit should see upgrade prompt', async ({ page, extensionId }) => {
        // Arrange: Mock user with 10/10 usage
        await page.evaluate(() => {
            chrome.storage.local.set({
                authToken: 'mock-token',
                usageStats: { used: 10, limit: 10, lastUsed: new Date().toISOString() }
            });
        });

        // Act
        const popup = new PopupPage(page);
        await popup.open(extensionId);

        // Assert: Upgrade CTA should be visible
        await expect(popup.upgradeCTA).toBeVisible();
        const usage = await popup.getUsageCount();
        expect(usage.used).toBe(10);
        expect(usage.limit).toBe(10);
    });

    test('trial user at limit cannot enhance', async ({ page, extensionId }) => {
        // Arrange: Mock user with 10/10 usage
        await page.evaluate(() => {
            chrome.storage.local.set({
                authToken: 'mock-token',
                usageStats: { used: 10, limit: 10, lastUsed: new Date().toISOString() }
            });
        });

        // Act: Try to enhance
        const testPagePath = path.join(__dirname, '../fixtures/test-pages/simple.html');
        const contentPage = new ContentPage(page);
        await contentPage.goto(`file://${testPagePath}`);

        const originalText = await contentPage.getTextContent('#sample-text-1');
        await contentPage.selectText('#sample-text-1');
        await contentPage.enhanceWithKeyboard();

        // Wait a bit to see if anything happens
        await page.waitForTimeout(2000);

        // Assert: Text should NOT change
        const currentText = await contentPage.getTextContent('#sample-text-1');
        expect(currentText).toBe(originalText);

        // Error toast should appear
        const errorToast = page.locator('.toast--error');
        await expect(errorToast).toBeVisible();
        await expect(errorToast).toContainText('limit');
    });

    test('upgrade CTA should link to pricing page', async ({ page, extensionId }) => {
        // Arrange
        await page.evaluate(() => {
            chrome.storage.local.set({
                authToken: 'mock-token',
                usageStats: { used: 10, limit: 10, lastUsed: new Date().toISOString() }
            });
        });

        const popup = new PopupPage(page);
        await popup.open(extensionId);

        // Act: Click upgrade button
        const [newPage] = await Promise.all([
            page.context().waitForEvent('page'),
            popup.upgradeCTA.click()
        ]);

        // Assert: Should open pricing page
        await newPage.waitForLoadState();
        expect(newPage.url()).toContain('/pricing');
    });

    test('paid user should see unlimited usage', async ({ page, extensionId }) => {
        // Arrange: Mock monthly subscriber
        await page.evaluate(() => {
            chrome.storage.local.set({
                authToken: 'mock-token',
                subscription: { tier: 'monthly', status: 'active' },
                usageStats: { used: 50, limit: -1, lastUsed: new Date().toISOString() }
            });
        });

        // Act
        const popup = new PopupPage(page);
        await popup.open(extensionId);

        // Assert
        const tier = await popup.getSubscriptionTier();
        expect(tier).toBe('monthly');

        const usage = await popup.getUsageCount();
        expect(usage.limit).toBe(-1); // Unlimited
        expect(usage.used).toBeGreaterThan(0);

        // No upgrade CTA for paid users
        await expect(popup.upgradeCTA).not.toBeVisible();
    });

    test('paid user should not see usage warnings', async ({ page, extensionId }) => {
        // Arrange: Mock monthly subscriber with high usage
        await page.evaluate(() => {
            chrome.storage.local.set({
                authToken: 'mock-token',
                subscription: { tier: 'monthly', status: 'active' },
                usageStats: { used: 1000, limit: -1, lastUsed: new Date().toISOString() }
            });
        });

        // Act
        const popup = new PopupPage(page);
        await popup.open(extensionId);

        // Assert: No warnings
        const warning = page.locator('.dashboard__usage-warning');
        await expect(warning).not.toBeVisible();
    });

    test('paid user can enhance unlimited times', async ({ page, extensionId }) => {
        // Arrange
        await page.evaluate(() => {
            chrome.storage.local.set({
                authToken: 'mock-token',
                subscription: { tier: 'lifetime', status: 'active' },
                usageStats: { used: 100, limit: -1, lastUsed: new Date().toISOString() }
            });
        });

        const testPagePath = path.join(__dirname, '../fixtures/test-pages/simple.html');
        const contentPage = new ContentPage(page);
        await contentPage.goto(`file://${testPagePath}`);

        // Act: Enhance multiple times
        for (let i = 0; i < 3; i++) {
            const selector = `#sample-text-${i === 0 ? 1 : 2}`;
            const originalText = await contentPage.getTextContent(selector);

            await contentPage.selectText(selector);
            await contentPage.enhanceWithKeyboard();
            await contentPage.waitForTextChange(selector, originalText);

            const enhancedText = await contentPage.getTextContent(selector);
            expect(enhancedText).not.toBe(originalText);
        }

        // Assert: All enhancements should succeed
        // No errors should appear
        const errorToast = page.locator('.toast--error');
        await expect(errorToast).not.toBeVisible();
    });

    test('lifetime user should see correct badge', async ({ page, extensionId }) => {
        // Arrange
        await page.evaluate(() => {
            chrome.storage.local.set({
                authToken: 'mock-token',
                subscription: { tier: 'lifetime', status: 'active' },
                usageStats: { used: 500, limit: -1, lastUsed: new Date().toISOString() }
            });
        });

        // Act
        const popup = new PopupPage(page);
        await popup.open(extensionId);

        // Assert
        const tier = await popup.getSubscriptionTier();
        expect(tier).toBe('lifetime');

        const badge = await popup.subscriptionBadge.textContent();
        expect(badge).toContain('💎'); // Diamond emoji for lifetime
    });
});
