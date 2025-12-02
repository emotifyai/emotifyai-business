# Product Overview

Verba is an AI-powered text enhancement platform that helps users rewrite, rephrase, and improve text quality across the web.

## Core Components

**Browser Extension**: Cross-browser extension (Chrome, Edge, Firefox) that integrates into the user's workflow via context menu (right-click) and keyboard shortcuts. Provides instant AI-powered text enhancement without leaving the current page.

**Web Application**: Full-featured Next.js platform handling authentication, subscription management, user dashboard, and centralized API layer for all AI requests.

**Backend Services**: Supabase for database and auth, Lemon Squeezy for billing, Claude 3.5 Sonnet for AI text generation.

## Language Support

Primary languages with high-quality output:
- English
- Arabic  
- French

Other languages: System attempts generation but returns "not supported" message if quality is low.

## Subscription Model

- **Trial**: ~10 enhancement actions for new users
- **Monthly**: Recurring subscription with unlimited access
- **Lifetime**: One-time payment for permanent access

All billing managed through Lemon Squeezy.

## Security Architecture

- No API keys or sensitive logic on client side
- All extension requests route through backend APIs
- Authentication, authorization, and usage validation happen server-side
- Token-based authentication with JWT
- Row-level security in database

## Distribution

- Browser extension via Chrome Web Store, Edge Add-ons, Firefox Add-ons
- Shopify App distribution (planned)
- Web app hosted on Vercel (recommended)
