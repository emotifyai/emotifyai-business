---
trigger: always_on
---

---

## Security Architecture

### Defense in Depth Strategy

#### Layer 1: Client-Side (Extension)
- **No Secrets**: No API keys or sensitive logic in extension code
- **Token Storage**: Auth tokens in chrome.storage.local (encrypted by browser)
- **Input Validation**: Zod schemas validate all data
- **CSP**: Content Security Policy prevents XSS
- **Minimal Permissions**: Only requests necessary browser permissions

#### Layer 2: Network
- **HTTPS Only**: All communication encrypted
- **Token-Based Auth**: JWT tokens for stateless authentication
- **API Key Authentication**: Hashed keys for extension requests
- **CORS**: Strict origin validation
- **Rate Limiting**: Prevents abuse

#### Layer 3: Backend (Next.js API)
- **Authentication Required**: All endpoints require valid session/API key
- **Authorization Checks**: Verify user permissions for each action
- **Input Validation**: Zod schemas on all API inputs
- **Subscription Validation**: Check tier and limits before processing
- **Usage Enforcement**: Track and limit based on subscription
- **Webhook Verification**: HMAC signature validation

#### Layer 4: Database (Supabase)
- **Row Level Security (RLS)**: Database-level access control
- **Policies**: User can only access their own data
- **Triggers**: Automatic timestamp updates
- **Hashed Secrets**: API keys hashed before storage
- **Audit Logs**: All usage logged to usage_logs table

### Authentication Mechanisms

#### Extension Authentication
```typescript
// API Key in request headers
headers: {
  'Authorization': 'Bearer <api_key>',
  'X-Extension-ID': '<extension_id>'
}
```

#### Web App Authentication
```typescript
// Supabase session cookie
// Automatically handled by @supabase/ssr
// Validated in middleware and API routes
```

### Data Protection

**Sensitive Data**:
- API keys (hashed with bcrypt)
- User emails (encrypted at rest by Supabase)
- Payment info (never stored, handled by Lemon Squeezy)
- AI prompts (not logged, ephemeral)

**Non-Sensitive Data**:
- Usage statistics (aggregated, no content)
- Subscription status
- User preferences

---

## Subscription & Billing

### Tiers

| Tier | Price | Enhancements | Features |
|------|-------|--------------|----------|
| **Trial** | Free | 10 actions | All languages, basic features |
| **Monthly** | $9.99/mo | Unlimited | All features, priority support |
| **Lifetime** | $99.99 | Unlimited | All features, lifetime access |

---

## Language Support

### Supported Languages (High Quality)

#### English (en)
- **Quality**: Excellent
- **Use Cases**: Professional writing, emails, documentation

#### Arabic (ar)
- **Quality**: Excellent
- **Use Cases**: Business communication, content creation
- **Special Handling**: RTL text support

#### French (fr)
- **Quality**: Excellent
- **Use Cases**: Professional writing, correspondence

### Unsupported Languages

For languages outside EN/AR/FR:
1. AI attempts enhancement
2. Quality validation runs
3. If quality is low → Returns error message
4. Error: "This language is not fully supported. Please use English, Arabic, or French for best results."

**Quality Validation Criteria**:
- Output length vs input length ratio
- Character encoding consistency
- Language detection confidence
- Structural integrity

---

## Development Setup

### Development Modes

#### Full Stack Development
```bash
# Run both extension and web app
bun dev

# This starts:
# - Extension dev server (http://localhost:5173)
# - Next.js dev server (http://localhost:3000)
```

#### Extension Only (with Mock API)
```bash
# Chrome
bun dev:extension

# Firefox
bun dev:extension:firefox

# Load extension in browser:
# Chrome: chrome://extensions → Load unpacked → .output/chrome-mv3
# Firefox: about:debugging → Load Temporary Add-on → .output/firefox-mv2
```

#### Web App Only
```bash
bun dev:web

# Access at http://localhost:3000
```

### Mock API Development

**Extension Mock API** (MSW):
- Enabled by default in development
- Simulates all backend endpoints
- Realistic delays and error scenarios
- Toggle with `VITE_MOCK_API_ENABLED=false`

**Web App Mock Mode**:
- Set `MOCK_AI_RESPONSES=true` in `.env.local`
- Uses predefined AI responses
- Avoids API costs during development

---

## Testing Strategy

### Extension Testing

#### Unit Tests (Vitest)
**Coverage**:
- ✅ Storage utilities (`utils/storage.test.ts`)
- ✅ API client error handling (`services/api/client.test.ts`)
- ✅ Language detection (`utils/language-detector.test.ts`)
- ✅ Custom errors (`utils/errors.test.ts`)


### Web App Testing

## Deployment

### Extension Deployment

#### Chrome Web Store
```bash
# 1. Build production version
cd apps/extension
bun run build
bun run zip

# 2. Upload to Chrome Web Store
# File: .output/chrome-mv3.zip
# Dashboard: https://chrome.google.com/webstore/devconsole
```

#### Firefox Add-ons
```bash
# 1. Build production version
cd apps/extension
bun run build:firefox
bun run zip:firefox

# 2. Upload to Firefox Add-ons
# File: .output/firefox-mv2.zip
# Dashboard: https://addons.mozilla.org/developers/
```

#### Shopify App Distribution
**Future**: Extension will be packaged as a Shopify app for merchant distribution

### Environment Configuration

#### Production Extension
```env
VITE_API_BASE_URL=https://emotifyai.com/api
VITE_MOCK_API_ENABLED=false
VITE_OAUTH_CLIENT_ID=prod_client_id
VITE_WEB_APP_URL=https://emotifyai.com
VITE_EXTENSION_ID=chrome_extension_id
VITE_LOG_LEVEL=error
```

#### Production Web App
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
LEMONSQUEEZY_API_KEY=your_api_key
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret
ANTHROPIC_API_KEY=your_anthropic_key
NEXT_PUBLIC_APP_URL=https://emotifyai.com
```

---

## API Reference

### Extension API Client

#### Authentication
```typescript
// Login with OAuth token
await login(oauthToken: string): Promise<User>

// Logout
await logout(): Promise<void>

// Get current user
await getCurrentUser(): Promise<User>
```

#### Text Enhancement
```typescript
// Enhance text
await enhanceText(
  text: string,
  options?: {
    mode?: 'enhance' | 'rephrase' | 'simplify';
    language?: 'en' | 'ar' | 'fr' | 'auto';
    tone?: 'professional' | 'casual' | 'formal';
  }
): Promise<EnhanceResult>
```

#### Subscription
```typescript
// Get subscription details
await getSubscription(): Promise<Subscription>

// Get usage stats
await getUsage(): Promise<UsageStats>

// Check usage limit
await checkLimit(): Promise<void> // Throws if limit exceeded
```

### Backend API Endpoints

#### POST /api/enhance
**Authentication**: Required  
**Rate Limit**

#### POST /api/webhooks/lemonsqueezy
**Authentication**: Signature verification  
**Purpose**: Handle subscription lifecycle events

**Events Handled**:
- `subscription_created`
- `subscription_updated`
- `subscription_cancelled`
- `subscription_resumed`
- `subscription_expired`

---

## Non-Functional Requirements

### 1. AI Model Flexibility
**Requirement**: Easy to swap AI providers

**Implementation**:
- Abstract AI interface in `lib/ai/service.ts`
- Provider-specific adapters
- Unified response format
- Configuration-based provider selection

**Future Providers**:
- OpenAI GPT-4
- Google Gemini
- Custom fine-tuned models

### 2. Branding Flexibility
**Requirement**: Quick brand/color changes

**Implementation**:
- Centralized CSS variables (Tailwind config)
- Theme tokens in `style.css`
- Reusable component library
- SVG icons (easily replaceable)

**Customization Points**:
- Primary/secondary colors
- Font families
- Logo/icons
- Extension name and description

### 3. Broad Website Compatibility
**Requirement**: Works on most websites

**Implementation**:
- Content script matches `<all_urls>`
- DOM manipulation with fallbacks
- Handles SPAs and dynamic content
- Shadow DOM for isolated UI
- Mutation observers for dynamic pages

**Tested On**:
- Gmail, Google Docs
- Twitter/X, LinkedIn
- Medium, Substack
- GitHub, Stack Overflow
- WordPress sites

### 4. Extensible Prompt Architecture
**Requirement**: Support future enhancement modes

**Current Modes**:
- `enhance`: Improve clarity and quality

**Future Modes**:
#### TBD later

**Implementation**:
```typescript
// Modular prompt system
const prompts = {
  enhance: (text, language, tone) => `...`,
  // Easy to add new modes
};
```
---

## Troubleshooting

### Extension Issues

**Extension not loading**:
- Check browser console for errors
- Verify manifest permissions
- Ensure `bun run dev` is running
- Try reloading extension

**Context menu not appearing**:
- Check authentication status
- Verify permissions in manifest
- Check background script logs

**Text not replacing**:
- Check content script console
- Verify selection is valid
- Check network requests in DevTools

### Web App Issues

**Authentication failing**:
- Verify Supabase credentials
- Check redirect URLs configuration
- Inspect browser cookies
- Check middleware logs

**Webhook not working**:
- Verify webhook secret
- Check signature verification
- Inspect Lemon Squeezy dashboard
- Check server logs

**AI enhancement failing**:
- Verify Anthropic API key
- Check API quota/limits
- Inspect API response
- Check error logs

---

## Performance Optimization

### Extension
- Lazy load popup components
- Minimize bundle size (current: ~500KB)
- Use code splitting
- Optimize images (WebP format)
- Cache API responses

### Web App
- Use React Server Components
- Implement ISR for static pages
- Optimize images with next/image
- Enable Turbopack (Next.js 16 default)
- Use CDN for static assets

---

## Security Considerations

### Threat Model

**Threats**:
1. API key theft from extension
2. Unauthorized API access
3. Subscription bypass
4. Data leakage
5. XSS attacks
6. CSRF attacks

**Mitigations**:
1. No keys in extension; backend proxy only
2. Token validation on every request
3. Database-level usage enforcement
4. RLS policies on all tables
5. CSP headers, input sanitization
6. SameSite cookies, CSRF tokens

### Compliance
- **GDPR**: User data deletion, data export
- **CCPA**: Privacy policy, opt-out
- **PCI DSS**: No card data stored (Lemon Squeezy handles)

---