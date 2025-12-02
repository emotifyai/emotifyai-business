# Technology Stack

## Build System & Package Manager

**Bun**: Primary runtime and package manager (v1.2.21+)
- Fast installs and script execution
- Workspace management for monorepo
- Node.js 20+ required for compatibility

## Monorepo Structure

Bun workspaces with two main apps:
- `apps/extension`: Browser extension
- `apps/web`: Web application
- `packages/*`: Shared packages (future)

## Extension Stack

**Framework**: WXT (Web Extension Tools) - Modern extension framework with Vite
- Manifest V3 for Chrome/Edge
- Manifest V2 for Firefox
- Hot module reloading in development

**Frontend**: 
- React 19 with TypeScript 5
- Tailwind CSS v4 (via @tailwindcss/vite)
- TanStack Query for data fetching

**Testing**:
- Vitest for unit tests
- Playwright for E2E tests
- MSW (Mock Service Worker) for API mocking
- happy-dom for DOM testing

**HTTP Client**: ky (modern fetch wrapper)

**Validation**: Zod schemas

## Web App Stack

**Framework**: Next.js 16 with App Router
- React 19 with TypeScript 5
- Server Components and Server Actions
- Middleware for auth protection

**Styling**:
- Tailwind CSS v4
- Radix UI for accessible components
- shadcn/ui component patterns
- Lucide React for icons
- next-themes for dark mode

**Data & State**:
- TanStack Query for server state
- Supabase client for database
- @supabase/ssr for SSR support

**Backend Services**:
- Supabase: PostgreSQL database, authentication, RLS
- Lemon Squeezy: Payment processing and subscriptions
- Anthropic Claude 3.5 Sonnet: AI text generation

**Testing**:
- Vitest for unit tests
- Testing Library for component tests
- jsdom for DOM environment

**Validation**: 
- Zod schemas
- @t3-oss/env-nextjs for environment variables


## Environment Variables

**Extension**: Uses `.env` files (not `.env.local`)
- `.env` for development
- `.env.production.example` for production template
- Vite prefix: `VITE_*`

**Web App**: Uses `.env.local` pattern
- `.env.local` for development
- `.env.production.local.example` for production template
- Next.js public prefix: `NEXT_PUBLIC_*`
- Server-only vars validated with @t3-oss/env-nextjs

## Key Dependencies

**Shared**:
- React 19 (with JSX transform, no React import needed)
- TypeScript 5 (strict mode enabled)
- Tailwind CSS v4 (via @tailwindcss/vite for extension, @tailwindcss/postcss for web)
- TanStack Query (data fetching and caching)
- Zod (runtime validation)
- Vitest (unit testing)

**Extension-specific**:
- WXT 0.20+ (extension framework with Vite)
- ky 1.7+ (HTTP client, modern fetch wrapper)
- MSW 2.7+ (Mock Service Worker for API mocking)
- Playwright 1.57+ (E2E testing)
- happy-dom (DOM testing environment)

**Web-specific**:
- Next.js 16 (App Router, Server Components, Server Actions)
- @supabase/ssr 0.5+ (SSR-compatible Supabase client)
- @supabase/supabase-js 2.47+ (Supabase client)
- @lemonsqueezy/lemonsqueezy.js 3.3+ (payment SDK)
- @anthropic-ai/sdk 0.32+ (Claude API)
- @t3-oss/env-nextjs 0.13+ (type-safe env vars)
- Radix UI (accessible component primitives)
- Recharts (usage analytics charts)
- date-fns (date manipulation)
- sonner (toast notifications)
- jsdom (DOM testing environment)
