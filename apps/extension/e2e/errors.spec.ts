import { test, expect } from './fixtures/extension';
import { PopupPage, ContentPage, clearExtensionStorage } from './helpers/page-objects';
import path from 'path';

/**
 * E2E Tests: Error Scenarios
 * 
 * Tests error handling for network failures, API errors, and edge cases
 */
test.describe('Error Scenarios', () => {
    test.beforeEach(async ({ page, extensionId }) => {
        await clearExtensionStorage(page);
    });

    test('should show error when not authenticated', async ({ page, extensionId }) => {
        // Arrange: No auth token
        const testPagePath = path.join(__dirname, '../fixtures/test-pages/simple.html');
        const contentPage = new ContentPage(page);
        await contentPage.goto(`file://${testPagePath}`);

        // Act: Try to enhance without login
        await contentPage.selectText('#sample-text-1');
        await contentPage.enhanceWithKeyboard();

        // Assert: Should show authentication error
        const errorToast = page.locator('.toast--error');
        await expect(errorToast).toBeVisible({ timeout: 5000 });
        await expect(errorToast).toContainText(/login|authenticate/i);
    });

    test('should handle network errors gracefully', async ({ page, extensionId }) => {
        // Arrange: Login but simulate network failure
        await page.evaluate(() => {
            chrome.storage.local.set({
                authToken: 'mock-token',
                usageStats: { used: 0, limit: 10, lastUsed: null }
            });
        });

        // Mock network failure
        await page.route('**/api/enhance', route => {
            route.abort('failed');
        });

        const testPagePath = path.join(__dirname, '../fixtures/test-pages/simple.html');
        const contentPage = new ContentPage(page);
        await contentPage.goto(`file://${testPagePath}`);

        const originalText = await contentPage.getTextContent('#sample-text-1');

        // Act: Try to enhance
        await contentPage.selectText('#sample-text-1');
        await contentPage.enhanceWithKeyboard();
        await page.waitForTimeout(2000);

        // Assert: Should show network error
        const errorToast = page.locator('.toast--error');
        await expect(errorToast).toBeVisible();
        await expect(errorToast).toContainText(/network|connection|failed/i);

        // Text should not change
        const currentText = await contentPage.getTextContent('#sample-text-1');
        expect(currentText).toBe(originalText);
    });

    test('should handle API errors', async ({ page, extensionId }) => {
        // Arrange
        await page.evaluate(() => {
            chrome.storage.local.set({
                authToken: 'mock-token',
                usageStats: { used: 0, limit: 10, lastUsed: null }
            });
        });

        // Mock API error
        await page.route('**/api/enhance', route => {
            route.fulfill({
                status: 500,
                body: JSON.stringify({ error: 'Internal server error' })
            });
        });

        const testPagePath = path.join(__dirname, '../fixtures/test-pages/simple.html');
        const contentPage = new ContentPage(page);
        await contentPage.goto(`file://${testPagePath}`);

        // Act
        await contentPage.selectText('#sample-text-1');
        await contentPage.enhanceWithKeyboard();
        await page.waitForTimeout(2000);

        // Assert
        const errorToast = page.locator('.toast--error');
        await expect(errorToast).toBeVisible();
    });

    test('should handle unsupported language', async ({ page, extensionId }) => {
        // Arrange
        await page.evaluate(() => {
            chrome.storage.local.set({
                authToken: 'mock-token',
                usageStats: { used: 0, limit: 10, lastUsed: null }
            });
        });

        // Create page with unsupported language (Chinese)
        await page.setContent(`
      <!DOCTYPE html>
      <html lang="zh">
      <body>
        <p id="chinese-text">这是中文文本，不支持的语言。</p>
      </body>
      </html>
    `);

        // Mock language not supported error
        await page.route('**/api/enhance', route => {
            route.fulfill({
                status: 400,
                body: JSON.stringify({
                    error: 'LANGUAGE_NOT_SUPPORTED',
                    message: 'Language not supported. Use EN/AR/FR only.'
                })
            });
        });

        const contentPage = new ContentPage(page);

        // Act
        await contentPage.selectText('#chinese-text');
        await contentPage.enhanceWithKeyboard();
        await page.waitForTimeout(2000);

        // Assert
        const errorToast = page.locator('.toast--error');
        await expect(errorToast).toBeVisible();
        await expect(errorToast).toContainText(/language.*not.*supported/i);
    });

    test('should handle rate limiting', async ({ page, extensionId }) => {
        // Arrange
        await page.evaluate(() => {
            chrome.storage.local.set({
                authToken: 'mock-token',
                usageStats: { used: 0, limit: 10, lastUsed: null }
            });
        });

        // Mock rate limit error
        await page.route('**/api/enhance', route => {
            route.fulfill({
                status: 429,
                body: JSON.stringify({
                    error: 'RATE_LIMIT_ERROR',
                    message: 'Too many requests. Please wait a few minutes.'
                })
            });
        });

        const testPagePath = path.join(__dirname, '../fixtures/test-pages/simple.html');
        const contentPage = new ContentPage(page);
        await contentPage.goto(`file://${testPagePath}`);

        // Act
        await contentPage.selectText('#sample-text-1');
        await contentPage.enhanceWithKeyboard();
        await page.waitForTimeout(2000);

        // Assert
        const errorToast = page.locator('.toast--error');
        await expect(errorToast).toBeVisible();
        await expect(errorToast).toContainText(/too many|rate limit|wait/i);
    });

    test('should handle empty selection', async ({ page, extensionId }) => {
        // Arrange
        await page.evaluate(() => {
            chrome.storage.local.set({
                authToken: 'mock-token',
                usageStats: { used: 0, limit: 10, lastUsed: null }
            });
        });

        const testPagePath = path.join(__dirname, '../fixtures/test-pages/simple.html');
        const contentPage = new ContentPage(page);
        await contentPage.goto(`file://${testPagePath}`);

        // Act: Try to enhance without selecting text
        await contentPage.enhanceWithKeyboard();
        await page.waitForTimeout(1000);

        // Assert: Should show error or do nothing gracefully
        const errorToast = page.locator('.toast--error');
        const isVisible = await errorToast.isVisible().catch(() => false);

        if (isVisible) {
            await expect(errorToast).toContainText(/select|text/i);
        }
        // If no error shown, that's also acceptable (silent failure)
    });

    test('should recover from errors and allow retry', async ({ page, extensionId }) => {
        // Arrange
        await page.evaluate(() => {
            chrome.storage.local.set({
                authToken: 'mock-token',
                usageStats: { used: 0, limit: 10, lastUsed: null }
            });
        });

        let requestCount = 0;
        await page.route('**/api/enhance', route => {
            requestCount++;
            if (requestCount === 1) {
                // First request fails
                route.abort('failed');
            } else {
                // Second request succeeds
                route.fulfill({
                    status: 200,
                    body: JSON.stringify({
                        enhancedText: 'This text has been successfully enhanced.',
                        language: 'en'
                    })
                });
            }
        });

        const testPagePath = path.join(__dirname, '../fixtures/test-pages/simple.html');
        const contentPage = new ContentPage(page);
        await contentPage.goto(`file://${testPagePath}`);

        const originalText = await contentPage.getTextContent('#sample-text-1');

        // Act: First attempt (should fail)
        await contentPage.selectText('#sample-text-1');
        await contentPage.enhanceWithKeyboard();
        await page.waitForTimeout(2000);

        // Error should appear
        let errorToast = page.locator('.toast--error');
        await expect(errorToast).toBeVisible();

        // Retry (should succeed)
        await contentPage.selectText('#sample-text-1');
        await contentPage.enhanceWithKeyboard();

        // Assert: Should succeed on retry
        await contentPage.waitForTextChange('#sample-text-1', originalText);
        const enhancedText = await contentPage.getTextContent('#sample-text-1');
        expect(enhancedText).not.toBe(originalText);
    });

    test('should handle session expiry', async ({ page, extensionId }) => {
        // Arrange: Expired token
        await page.evaluate(() => {
            chrome.storage.local.set({
                authToken: 'expired-token',
                usageStats: { used: 5, limit: 10, lastUsed: new Date().toISOString() }
            });
        });

        // Mock authentication error
        await page.route('**/api/enhance', route => {
            route.fulfill({
                status: 401,
                body: JSON.stringify({
                    error: 'AUTHENTICATION_ERROR',
                    message: 'Session expired. Please log in again.'
                })
            });
        });

        const testPagePath = path.join(__dirname, '../fixtures/test-pages/simple.html');
        const contentPage = new ContentPage(page);
        await contentPage.goto(`file://${testPagePath}`);

        // Act
        await contentPage.selectText('#sample-text-1');
        await contentPage.enhanceWithKeyboard();
        await page.waitForTimeout(2000);

        // Assert: Should show auth error
        const errorToast = page.locator('.toast--error');
        await expect(errorToast).toBeVisible();
        await expect(errorToast).toContainText(/log.*in|session|expired|authenticate/i);
    });
});
