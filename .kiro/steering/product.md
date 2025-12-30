# Product Overview

Verba is an AI-powered text enhancement platform that helps users rewrite, rephrase, and improve text quality across the web through a browser extension and web application.

## Core Components

**Browser Extension**: Cross-browser extension (Chrome/Edge with Manifest V3, Firefox with) that integrates into the user's workflow via:
- Context menu (right-click) on selected text
- Keyboard shortcut (Ctrl+Shift+E / Cmd+Shift+E)
- In-page text replacement with undo functionality
- Popup dashboard for account management

**Web Application**: Full-featured Next.js 16 platform with App Router providing:
- OAuth authentication (Google, GitHub) via Supabase
- Subscription management and billing via Lemon Squeezy
- User dashboard with usage analytics
- Centralized API layer (`/api/enhance`) for all AI requests
- Protected routes with middleware-based auth

**Backend Services**: 
- Supabase: PostgreSQL database, authentication, Row Level Security
- Lemon Squeezy: Payment processing, subscription webhooks, license management
- Claude 3.5 Sonnet (Anthropic): AI text generation with quality validation

## Language Support

**Primary languages** with high-quality output guarantee:
- English (en)
- Arabic (ar)
- French (fr)

**Other languages**: System attempts generation but validates output quality. If AI output is detected as low-quality or unreliable, returns error message indicating language is not fully supported. This prevents misleading or incorrect results.

Language detection is automatic by default but can be overridden by user preference.

## Subscription Model

Three-tier system managed through Lemon Squeezy:

- **Trial**: 10 enhancement actions for new users (configurable via `TRIAL_ENHANCEMENT_LIMIT`)
- **Monthly**: Recurring subscription with 1000 enhancements/month (configurable via `MONTHLY_ENHANCEMENT_LIMIT`)
- **Lifetime**: One-time payment for unlimited access (no reset, limit = -1)

Usage tracking:
- Credit consumption tracked in subscription records
- Real-time usage stats synced to extension
- Automatic limit enforcement before AI processing
- Reset dates for monthly subscriptions

## Security Architecture

**Client-Side Security**:
- No API keys or sensitive logic in extension code
- All requests proxied through backend API
- Extension ID verification via `X-Extension-ID` header
- JWT tokens stored in `chrome.storage.local` (encrypted by browser)

**Server-Side Security**:
- Authentication required for all `/api/enhance` requests
- Supabase Row Level Security (RLS) on all tables
- Subscription validation before processing
- Rate limiting (configurable via `RATE_LIMIT_RPM`)
- Webhook signature verification for Lemon Squeezy events
- Service role key never exposed to client

**Data Flow**:
1. User triggers enhancement (context menu or keyboard)
2. Content script sends message to background script
3. Background script checks auth token and usage limits
4. Background script calls backend API with JWT
5. Backend validates auth, subscription, and usage
6. Backend calls Claude API for enhancement
7. Backend validates output quality
8. Backend updates credit consumption and returns result
9. Content script replaces text in-page

## Distribution Channels

**Current**:
- Browser extension via Chrome Web Store (Manifest V3)
- Browser extension via Edge Add-ons (Manifest V3)
- Browser extension via Firefox Add-ons (Manifest V2)
- Web app hosted on Vercel (recommended platform)

**Planned**:
- Shopify App distribution (feature flag: `NEXT_PUBLIC_ENABLE_SHOPIFY_APP`)
- Netlify deployment (config not yet created)

## Non-Functional Requirements

**AI Model Flexibility**: Abstract AI interfaces in `lib/ai/` to allow seamless switching between Claude, OpenAI, Gemini, etc. Current implementation uses Claude 3.5 Sonnet with mock mode for development.

**Branding Flexibility**: Centralized styling in `assets/theme.css` and Tailwind config. Quick brand/color changes across extension and web components.

**Website Compatibility**: Extension functions on most websites including SPAs and dynamically rendered environments. Content script uses class-based architecture for maintainability.

**Extensible Prompt Architecture**: Modular prompt creation to support future options (tone, style, intent, rewriting modes). Currently supports `mode`, `language`, and `tone` parameters.

**Quality Validation**: Output quality validation prevents low-quality AI responses from reaching users. Validates language support and output coherence before returning results.
