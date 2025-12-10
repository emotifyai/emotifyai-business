import { test, expect } from './fixtures/extension.ts';
import { PopupPage, ContentPage, simulateLogin, clearExtensionStorage } from './helpers/page-objects.ts';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * E2E Tests: Core Enhancement Flow
 * 
 * Tests the primary user flow of selecting and enhancing text
 */

test.describe('Core Enhancement Flow', () => {
    test.beforeEach(async ({ page, extensionId }) => {
        // Clear storage before each test
        await clearExtensionStorage(page);

        // Login to extension
        await simulateLogin(page, extensionId);
    });

    test('should enhance text using context menu', async ({ page, extensionId }) => {
        // Arrange: Open test page
        const testPagePath = path.join(__dirname, '../fixtures/test-pages/simple.html');
        const contentPage = new ContentPage(page);
        await contentPage.goto(`file://${testPagePath}`);

        // Get original text
        const originalText = await contentPage.getTextContent('#sample-text-1');
        expect(originalText).toContain('grammer');
        expect(originalText).toContain('erors');

        // Act: Select text and enhance
        await contentPage.selectText('#sample-text-1');
        await contentPage.rightClickSelected();
        await contentPage.clickContextMenuItem('Enhance with EmotifyAI');

        // Assert: Text should be enhanced
        await contentPage.waitForTextChange('#sample-text-1', originalText);
        const enhancedText = await contentPage.getTextContent('#sample-text-1');

        expect(enhancedText).not.toBe(originalText);
        expect(enhancedText.length).toBeGreaterThan(0);
        // Enhanced text should not have obvious errors
        expect(enhancedText).not.toContain('grammer');
        expect(enhancedText).not.toContain('erors');
    });

    test('should enhance text using keyboard shortcut', async ({ page, extensionId }) => {
        // Arrange
        const testPagePath = path.join(__dirname, '../fixtures/test-pages/simple.html');
        const contentPage = new ContentPage(page);
        await contentPage.goto(`file://${testPagePath}`);

        const originalText = await contentPage.getTextContent('#sample-text-2');

        // Act: Select and use keyboard shortcut
        await contentPage.selectText('#sample-text-2');
        await contentPage.enhanceWithKeyboard();

        // Assert
        await contentPage.waitForTextChange('#sample-text-2', originalText);
        const enhancedText = await contentPage.getTextContent('#sample-text-2');

        expect(enhancedText).not.toBe(originalText);
        expect(enhancedText).not.toContain('dont');
        expect(enhancedText).not.toContain('chose');
    });

    test('should update usage count after enhancement', async ({ page, extensionId }) => {
        // Arrange
        const popup = new PopupPage(page);
        await popup.open(extensionId);
        const initialUsage = await popup.getUsageCount();

        // Act: Enhance text
        const testPagePath = path.join(__dirname, '../fixtures/test-pages/simple.html');
        const contentPage = new ContentPage(await page.context().newPage());
        await contentPage.goto(`file://${testPagePath}`);
        await contentPage.selectText('#sample-text-1');
        await contentPage.enhanceWithKeyboard();
        await contentPage.waitForTextChange('#sample-text-1', await contentPage.getTextContent('#sample-text-1'));

        // Assert: Usage should increment
        await popup.open(extensionId);
        const newUsage = await popup.getUsageCount();
        expect(newUsage.used).toBe(initialUsage.used + 1);
    });

    test('should allow undo after enhancement', async ({ page, extensionId }) => {
        // Arrange
        const testPagePath = path.join(__dirname, '../fixtures/test-pages/simple.html');
        const contentPage = new ContentPage(page);
        await contentPage.goto(`file://${testPagePath}`);

        const originalText = await contentPage.getTextContent('#sample-text-1');

        // Act: Enhance then undo
        await contentPage.selectText('#sample-text-1');
        await contentPage.enhanceWithKeyboard();
        await contentPage.waitForTextChange('#sample-text-1', originalText);

        const enhancedText = await contentPage.getTextContent('#sample-text-1');
        expect(enhancedText).not.toBe(originalText);

        await contentPage.clickUndo();

        // Assert: Text should revert to original
        const revertedText = await contentPage.getTextContent('#sample-text-1');
        expect(revertedText).toBe(originalText);
    });

    test('should enhance long text', async ({ page, extensionId }) => {
        // Arrange
        const testPagePath = path.join(__dirname, '../fixtures/test-pages/simple.html');
        const contentPage = new ContentPage(page);
        await contentPage.goto(`file://${testPagePath}`);

        const originalText = await contentPage.getTextContent('#long-text');
        expect(originalText.length).toBeGreaterThan(200);

        // Act
        await contentPage.selectText('#long-text');
        await contentPage.enhanceWithKeyboard();

        // Assert: Should handle long text
        await contentPage.waitForTextChange('#long-text', originalText, 15000); // Longer timeout
        const enhancedText = await contentPage.getTextContent('#long-text');

        expect(enhancedText).not.toBe(originalText);
        expect(enhancedText.length).toBeGreaterThan(100);
    });

    test('should enhance editable content', async ({ page, extensionId }) => {
        // Arrange
        const testPagePath = path.join(__dirname, '../fixtures/test-pages/simple.html');
        const contentPage = new ContentPage(page);
        await contentPage.goto(`file://${testPagePath}`);

        // Type text into editable area
        const editableArea = page.locator('#editable-area');
        await editableArea.click();
        await editableArea.clear();
        const testText = 'This text has many erors and bad grammer.';
        await editableArea.fill(testText);

        // Act: Select and enhance
        await contentPage.selectText('#editable-area');
        await contentPage.enhanceWithKeyboard();

        // Assert
        await contentPage.waitForTextChange('#editable-area', testText);
        const enhancedText = await contentPage.getTextContent('#editable-area');

        expect(enhancedText).not.toBe(testText);
        expect(enhancedText).not.toContain('erors');
    });

    test('should work on dynamically added content', async ({ page, extensionId }) => {
        // Arrange
        const testPagePath = path.join(__dirname, '../fixtures/test-pages/dynamic.html');
        const contentPage = new ContentPage(page);
        await contentPage.goto(`file://${testPagePath}`);

        // Add dynamic content
        await page.click('button:has-text("Add Content")');
        await page.waitForSelector('#dynamic-item-1');

        const originalText = await contentPage.getTextContent('#dynamic-item-1');

        // Act: Enhance dynamic content
        await contentPage.selectText('#dynamic-item-1');
        await contentPage.enhanceWithKeyboard();

        // Assert
        await contentPage.waitForTextChange('#dynamic-item-1', originalText);
        const enhancedText = await contentPage.getTextContent('#dynamic-item-1');

        expect(enhancedText).not.toBe(originalText);
    });
});
