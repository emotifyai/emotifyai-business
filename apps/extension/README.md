# Verba Browser Extension

AI-powered text enhancement and rewriting browser extension built with WXT, React, and TypeScript.

## Features

- 🎯 **Context Menu Integration** - Right-click selected text to enhance with AI
- ⌨️ **Keyboard Shortcuts** - Quick enhancement with Ctrl+Shift+E
- 🌍 **Multi-language Support** - English, Arabic, and French
- 📊 **Usage Tracking** - Monitor your enhancement usage and limits
- 🎨 **Modern UI** - Premium, responsive popup interface
- 🔒 **Secure** - No API keys in client code, all requests proxied through backend
- 🧪 **Mock API** - Full development without backend dependency

## Tech Stack

- **Framework**: [WXT](https://wxt.dev/) - Modern web extension framework
- **UI**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **HTTP Client**: [ky](https://github.com/sindresorhus/ky) - Lightweight fetch wrapper
- **Validation**: Zod for runtime type checking
- **State Management**: React hooks + TanStack Query
- **Testing**: Vitest + Testing Library
- **Mocking**: MSW (Mock Service Worker)

## Project Structure

```
apps/extension/
├── entrypoints/
│   ├── background.ts          # Service worker with context menu
│   ├── content.ts              # Content script for text replacement
│   └── popup/                  # Popup UI
│       ├── App.tsx
│       ├── components/         # React components
│       └── hooks/              # Custom React hooks
├── services/
│   └── api/                    # API client services
│       ├── client.ts           # Ky HTTP client
│       ├── auth.ts             # Authentication
│       ├── ai.ts               # AI enhancement
│       └── subscription.ts     # Subscription & usage
├── mocks/
│   ├── api/
│   │   ├── handlers.ts         # MSW request handlers
│   │   └── data.ts             # Mock data fixtures
│   └── browser.ts              # MSW setup
├── utils/
│   ├── storage.ts              # Type-safe storage utilities
│   ├── logger.ts               # Centralized logging
│   ├── errors.ts               # Custom error classes
│   └── language-detector.ts    # Language detection
├── types/                      # TypeScript type definitions
└── schemas/                    # Zod validation schemas
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0
- Node.js >= 18 (for compatibility)

### Installation

```bash
# Install dependencies
bun install

# Start development mode (Chrome)
bun run dev

# Start development mode (Firefox)
bun run dev:firefox
```

### Environment Setup

Create a `.env` file in the extension directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_MOCK_API_ENABLED=true
VITE_OAUTH_CLIENT_ID=your_client_id
VITE_WEB_APP_URL=http://localhost:3001
VITE_EXTENSION_ID=your_extension_id
VITE_LOG_LEVEL=debug
```

### Loading the Extension

#### Chrome
1. Run `bun run dev`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `.output/chrome-mv3` directory

#### Firefox
1. Run `bun run dev:firefox`
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Select any file in the `.output/firefox-mv2` directory

## Development

### Mock API

The extension includes a comprehensive mock API layer using MSW. This allows full development without a backend:

- **Automatic activation**: Mock API starts automatically in development mode
- **Realistic delays**: Simulates network latency
- **Error scenarios**: Test error handling
- **Multiple user tiers**: Trial, Monthly, Lifetime subscriptions

To toggle mock mode, set `VITE_MOCK_API_ENABLED=false` in your `.env` file.

### Available Scripts

```bash
# Development
bun run dev                  # Start dev server (Chrome)
bun run dev:firefox          # Start dev server (Firefox)

# Building
bun run build                # Build for Chrome
bun run build:firefox        # Build for Firefox
bun run zip                  # Create Chrome distribution zip
bun run zip:firefox          # Create Firefox distribution zip

# Testing
bun run test                 # Run unit tests
bun run test:ui              # Run tests with UI
bun run test:coverage        # Generate coverage report

# Type Checking
bun run compile              # TypeScript type checking
```

## Usage

### Context Menu
1. Select text on any webpage
2. Right-click to open context menu
3. Click "Enhance with Verba"
4. Enhanced text replaces selection

### Keyboard Shortcut
1. Select text on any webpage
2. Press `Ctrl+Shift+E` (or `Cmd+Shift+E` on Mac)
3. Enhanced text replaces selection

### Undo
- Click the "Undo" button in the notification
- Or use browser's native undo (Ctrl+Z)

## Architecture

### Security
- **No client-side secrets**: All API keys stored on backend
- **Token-based auth**: JWT tokens stored in chrome.storage.local
- **Backend proxy**: All AI requests go through backend API
- **Extension ID verification**: Backend validates extension origin

### Data Flow
1. User selects text and triggers enhancement
2. Content script sends message to background script
3. Background script checks auth & usage limits
4. Background script calls backend API
5. Backend processes with AI model
6. Enhanced text returned to content script
7. Content script replaces selected text

### Storage
- **Auth token**: `local:authToken`
- **User profile**: `local:user`
- **Subscription**: `local:subscription`
- **Usage stats**: `local:usageStats`
- **Settings**: `local:settings`

## Testing

### Unit Tests
```bash
bun run test
```

Tests cover:
- Storage utilities
- API client error handling
- Language detection
- Custom error classes

### Manual Testing
1. Load extension in browser
2. Open popup - verify UI renders
3. Click login - verify mock authentication
4. Select text on webpage
5. Right-click → "Enhance with Verba"
6. Verify enhanced text appears
7. Click undo - verify text reverts

## Building for Production

```bash
# Build for Chrome
bun run build
bun run zip

# Build for Firefox
bun run build:firefox
bun run zip:firefox
```

Output files:
- Chrome: `.output/chrome-mv3.zip`
- Firefox: `.output/firefox-mv2.zip`

## Browser Compatibility

- ✅ Chrome/Edge (Manifest V3)
- ✅ Firefox (Manifest V2)
- ⏳ Safari (future support)

## Troubleshooting

### Extension Not Loading

**Problem**: Extension doesn't appear in browser after installation

**Solutions**:
1. Check if extension is enabled in browser settings
   - Chrome: `chrome://extensions`
   - Firefox: `about:addons`
2. Reload the extension
3. Check browser console for errors (F12)
4. Verify manifest.json is valid

### Context Menu Not Appearing

**Problem**: Right-click menu doesn't show "Enhance with Verba"

**Solutions**:
1. Ensure you're logged in (click extension icon)
2. Select text before right-clicking
3. Check extension permissions in browser settings
4. Reload the page and try again
5. Verify extension is enabled

### Text Not Enhancing

**Problem**: Selected text doesn't get enhanced

**Solutions**:
1. **Check Authentication**
   - Click extension icon
   - Verify you're logged in
   - Re-login if needed

2. **Check Usage Limits**
   - Open extension popup
   - Check remaining enhancements
   - Upgrade if limit reached

3. **Check Network**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Try enhancement again
   - Look for failed API requests
   - Check error messages

4. **Check Language Support**
   - Verba supports: English, Arabic, French
   - Other languages may not work well

### Login Issues

**Problem**: Can't log in to extension

**Solutions**:
1. Clear browser cache and cookies
2. Disable other extensions temporarily
3. Check if popup blocker is blocking OAuth window
4. Try incognito/private mode
5. Verify internet connection

### Performance Issues

**Problem**: Extension is slow or freezing

**Solutions**:
1. **Check Text Length**
   - Very long text (>5000 words) may be slow
   - Try smaller selections

2. **Check Network Speed**
   - AI processing requires good internet
   - Test on different network

3. **Clear Extension Data**
   ```javascript
   // In browser console
   chrome.storage.local.clear()
   ```

4. **Disable Other Extensions**
   - Conflicts with other extensions possible
   - Test with only Verba enabled

### Keyboard Shortcut Not Working

**Problem**: Ctrl+Shift+E doesn't trigger enhancement

**Solutions**:
1. Check if shortcut conflicts with other extensions
   - Chrome: `chrome://extensions/shortcuts`
2. Verify text is selected
3. Try right-click menu instead
4. Reassign shortcut if needed

### Extension Crashes

**Problem**: Extension stops working or crashes browser

**Solutions**:
1. **Update Browser**
   - Ensure latest version installed

2. **Reinstall Extension**
   - Remove extension
   - Clear browser cache
   - Reinstall from store

3. **Check Console Errors**
   - Open DevTools (F12)
   - Check Console tab
   - Look for error messages
   - Report errors to support

4. **Disable Conflicting Extensions**
   - Other extensions may interfere
   - Test with minimal extensions

### API Errors

**Problem**: Getting error messages from API

**Common Errors**:

| Error | Cause | Solution |
|-------|-------|----------|
| `AUTHENTICATION_ERROR` | Not logged in | Log in via extension popup |
| `SUBSCRIPTION_ERROR` | Usage limit reached | Upgrade subscription |
| `LANGUAGE_NOT_SUPPORTED` | Unsupported language | Use EN/AR/FR only |
| `NETWORK_ERROR` | No internet | Check connection |
| `RATE_LIMIT_ERROR` | Too many requests | Wait a few minutes |

### Data Not Syncing

**Problem**: Settings/usage not syncing across devices

**Note**: Currently, data is stored locally per browser. Cross-device sync coming soon.

**Workaround**:
- Log in on each device
- Settings are per-device

### Firefox-Specific Issues

**Problem**: Extension works on Chrome but not Firefox

**Solutions**:
1. Ensure using Firefox version (not Chrome version)
2. Check Firefox version (requires 109+)
3. Enable extension in `about:addons`
4. Check Firefox console for errors

### Still Having Issues?

If none of the above solutions work:

1. **Collect Information**
   - Browser version
   - Extension version
   - Error messages
   - Steps to reproduce

2. **Report Issue**
   - Email: support@verba.app
   - Include collected information
   - Attach screenshots if helpful

3. **Temporary Workarounds**
   - Use web app directly: https://verba.app
   - Try different browser
   - Use incognito mode

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `bun run test`
5. Build: `bun run build`
6. Submit a pull request

## License

[Your License Here]

## Support

For issues and questions:
- GitHub Issues: [Your Repo]
- Email: support@verba.app
- Documentation: https://verba.app/docs
