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

## Common Commands

### Development
```bash
# Run both apps concurrently
bun dev

# Run extension only (Chrome)
bun dev:ext

# Run extension only (Firefox)  
bun dev:ext:firefox

# Run web app only
bun dev:web
```

### Building
```bash
# Build both apps
bun build

# Build extension only
bun build:ext

# Build extension for Firefox
bun build:ext:firefox

# Build web app only
bun build:web
```

### Testing
```bash
# Run all tests
bun test

# Run extension tests
bun test:ext

# Run web tests
bun test:web

# Run with coverage
bun test:coverage

# Extension E2E tests
cd apps/extension && bun test:e2e
```

### Extension Packaging
```bash
# Create Chrome/Edge zip
bun zip:ext

# Create Firefox zip
bun zip:ext:firefox
```

### Type Checking
```bash
# Extension type check
cd apps/extension && bun compile

# Web app type check (via Next.js build)
cd apps/web && bun build
```

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
- React 19
- TypeScript 5
- Tailwind CSS v4
- TanStack Query
- Zod
- Vitest

**Extension-specific**:
- WXT
- ky
- MSW
- Playwright

**Web-specific**:
- Next.js 16
- Supabase
- Lemon Squeezy SDK
- Anthropic SDK
- Radix UI
- Recharts
