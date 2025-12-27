# E2E Testing Guide

## Overview

End-to-end tests for the EmotifyAI extension using Playwright. Tests cover all critical user flows including enhancement, subscription limits, authentication, and error scenarios.

## Test Suites

### 1. Enhancement Tests (`enhancement.spec.ts`)
Tests core text enhancement functionality:
- ✅ Context menu enhancement
- ✅ Keyboard shortcut (Ctrl+Shift+E)
- ✅ Usage count tracking
- ✅ Undo functionality
- ✅ Long text handling
- ✅ Editable content
- ✅ Dynamic content

**Total**: 7 tests

### 2. Subscription Tests (`subscription.spec.ts`)
Tests subscription tiers and usage limits:
- ✅ Trial user badge and limits
- ✅ Usage increment tracking
- ✅ 80% usage warning
- ✅ Limit reached upgrade prompt
- ✅ Limit enforcement
- ✅ Upgrade CTA links
- ✅ Paid user unlimited usage
- ✅ No warnings for paid users
- ✅ Multiple enhancements for paid users
- ✅ Lifetime badge display

**Total**: 11 tests

### 3. Error Tests (`errors.spec.ts`)
Tests error handling and edge cases:
- ✅ Unauthenticated user error
- ✅ Network error handling
- ✅ API error handling
- ✅ Unsupported language error
- ✅ Rate limiting error
- ✅ Empty selection handling
- ✅ Error recovery and retry
- ✅ Session expiry handling

**Total**: 8 tests

**Grand Total**: 26 E2E tests

---

## Running Tests

### Prerequisites

1. **Build Extension**
   ```bash
   bun run build
   ```
   Tests load the built extension from `.output/chrome-mv3/`

2. **Install Playwright Browsers** (first time only)
   ```bash
   bunx playwright install chromium
   ```

### Test Commands

```bash
# Run all E2E tests
bun run test:e2e

# Run with UI mode (interactive)
bun run test:e2e:ui

# Run with debugging
bun run test:e2e:debug

# Run in headed mode (see browser)
bun run test:e2e:headed

# Run specific test file
bun run test:e2e enhancement

# View test report
bun run test:e2e:report
```

---

## Test Structure

```
e2e/
├── fixtures/
│   ├── extension.ts          # Extension loading fixture
│   └── test-pages/
│       ├── simple.html        # Basic test page
│       ├── rtl.html           # Arabic/RTL test page
│       └── dynamic.html       # Dynamic content page
├── helpers/
│   └── page-objects.ts        # Page object models
├── enhancement.spec.ts        # Core enhancement tests
├── subscription.spec.ts       # Subscription/limit tests
└── errors.spec.ts             # Error scenario tests
```

---

## Writing New Tests

### 1. Use Page Objects

```typescript
import { test, expect } from '../fixtures/extension';
import { PopupPage, ContentPage } from '../helpers/page-objects';

test('my test', async ({ page, extensionId }) => {
  const popup = new PopupPage(page);
  await popup.open(extensionId);
  
  // Test logic here
});
```

### 2. Clean State

Always clear storage before tests:

```typescript
test.beforeEach(async ({ page }) => {
  await clearExtensionStorage(page);
});
```

### 3. Mock Data

Set up test data in storage:

```typescript
await page.evaluate(() => {
  chrome.storage.local.set({
    authToken: 'mock-token',
    usageStats: { used: 5, limit: 10 }
  });
});
```

### 4. Wait for Changes

Use proper waits:

```typescript
// Wait for text to change
await contentPage.waitForTextChange('#selector', originalText);

// Wait for element
await page.waitForSelector('.toast--success');

// Wait for timeout (last resort)
await page.waitForTimeout(1000);
```

---

## Test Pages

### Simple Page
Basic HTML with text samples for enhancement.
- Multiple paragraphs
- Editable content
- Long text samples

### RTL Page
Arabic text for right-to-left testing.
- Pure Arabic text
- Mixed Arabic/English
- RTL layout

### Dynamic Page
JavaScript-generated content.
- Add content button
- Async loading
- DOM manipulation

---

## Debugging Tests

### 1. Run in Headed Mode
```bash
bun run test:e2e:headed
```
See the browser and extension in action.

### 2. Use Debug Mode
```bash
bun run test:e2e:debug
```
Step through tests with Playwright Inspector.

### 3. Screenshots on Failure
Automatically captured in `test-results/`

### 4. Console Logs
Check browser console:
```typescript
page.on('console', msg => console.log(msg.text()));
```

### 5. Pause Test
```typescript
await page.pause(); // Opens Playwright Inspector
```

---

## Common Issues

### Extension Not Loading
- **Cause**: Extension not built
- **Fix**: Run `bun run build` first

### Tests Timing Out
- **Cause**: Waiting for element that never appears
- **Fix**: Check selectors, increase timeout

### Flaky Tests
- **Cause**: Race conditions, timing issues
- **Fix**: Use proper waits, avoid `waitForTimeout`

### Context Menu Not Working
- **Cause**: Playwright can't access browser UI
- **Fix**: Use keyboard shortcut instead (Ctrl+Shift+E)

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      
      - name: Install dependencies
        run: bun install
      
      - name: Build extension
        run: bun run build
      
      - name: Install Playwright
        run: bunx playwright install --with-deps chromium
      
      - name: Run E2E tests
        run: bun run test:e2e
      
      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results/
```

---

## Test Coverage

Current coverage by user flow:

| Flow | Coverage |
|------|----------|
| Text Enhancement | ✅ 100% |
| Subscription Limits | ✅ 100% |
| Trial User Journey | ✅ 100% |
| Paid User Journey | ✅ 100% |
| Error Handling | ✅ 100% |
| Authentication | ⏳ Partial |
| Settings | ⏳ TODO |
| Multi-tab | ⏳ TODO |

---

## Next Steps

### TODO Tests
- [ ] Authentication flow (login/logout)
- [ ] Settings configuration
- [ ] Multi-tab operation
- [ ] Cross-website compatibility
- [ ] Visual regression tests

### Improvements
- [ ] Add performance benchmarks
- [ ] Add accessibility tests
- [ ] Add mobile viewport tests
- [ ] Parallelize tests (if possible)

---

## Resources

- [Playwright Docs](https://playwright.dev)
- [Extension Testing Guide](https://playwright.dev/docs/chrome-extensions)
- [Best Practices](https://playwright.dev/docs/best-practices)
