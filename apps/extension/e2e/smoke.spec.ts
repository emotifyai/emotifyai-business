import { test, expect } from './fixtures/extension';
import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('smoke test: extension loads', async ({ page, extensionId }) => {
    console.log('Extension ID:', extensionId);
    expect(extensionId).toBeTruthy();

    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    const title = await page.title();
    console.log('Popup title:', title);
    expect(title).toBeTruthy();
});
