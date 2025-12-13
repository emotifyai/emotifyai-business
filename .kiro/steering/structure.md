# Project Structure

## Monorepo Layout

```
emotifyai/
├── apps/
│   ├── extension/          # Browser extension (WXT + React)
│   └── web/                # Web application (Next.js)
├── packages/               # Shared packages (future)
├── assets/                 # Shared assets (logo, theme)
├── docs/                   # Project documentation
├── .kiro/                  # Kiro AI assistant configuration
├── package.json            # Root workspace configuration
├── bun.toml                # Bun workspace definition
└── tsconfig.json           # Root TypeScript config
```

## Extension Structure (`apps/extension/`)

```
extension/
├── entrypoints/            # Extension entry points
│   ├── background.ts       # Service worker (Manifest V3)
│   ├── content.tsx         # Content script injected into pages
│   └── popup/              # Extension popup UI
│       ├── App.tsx
│       ├── main.tsx
│       └── components/
├── lib/                    # Core libraries
│   └── env.ts              # Environment variable validation
├── services/               # Business logic
│   ├── api/                # API client and endpoints
│   └── sync.ts             # Storage sync utilities
├── utils/                  # Utility functions
│   ├── errors.ts           # Error handling
│   ├── language-detector.ts
│   ├── logger.ts
│   ├── performance.ts
│   └── storage.ts
├── types/                  # TypeScript type definitions
├── schemas/                # Zod validation schemas
├── mocks/                  # MSW API mocks for development
│   ├── browser.ts
│   └── api/
├── tests/                  # Test files
│   ├── setup.ts
│   ├── critical-paths.test.ts
│   └── e2e/                # Playwright E2E tests
├── public/                 # Static assets
│   ├── icon/               # Extension icons (16-128px)
│   ├── promo/              # Promotional images
│   └── store/              # Store listing assets
├── scripts/                # Build and utility scripts
├── .output/                # Build output (gitignored)
│   ├── chrome-mv3/
│   ├── chrome-mv3-dev/
│   └── firefox/
├── wxt.config.ts           # WXT configuration
├── vitest.config.ts        # Vitest configuration
├── playwright.config.ts    # Playwright configuration
└── package.json
```

### Extension Key Patterns

- **Entrypoints**: WXT automatically discovers files in `entrypoints/` directory
- **Content Scripts**: React components can be used in content scripts
- **Background**: Service worker for context menus and background tasks
- **Popup**: Full React app with routing and state management
- **Mock API**: MSW handlers enable development without backend

## Web App Structure (`apps/web/`)

```
web/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth route group (login, signup)
│   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── dashboard/
│   │   ├── settings/
│   │   └── layout.tsx      # Dashboard layout with nav
│   ├── api/                # API routes
│   │   ├── auth/
│   │   ├── enhance/        # AI enhancement endpoint
│   │   ├── subscription/
│   │   └── webhooks/
│   ├── about/
│   ├── pricing/
│   ├── privacy/
│   ├── terms/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   ├── auth/               # Auth-related components
│   ├── dashboard/          # Dashboard components
│   └── layout/             # Layout components (header, footer)
├── lib/                    # Core libraries
│   ├── supabase/           # Supabase client utilities
│   │   ├── client.ts       # Browser client
│   │   ├── server.ts       # Server client
│   │   └── middleware.ts   # Middleware helpers
│   ├── lemonsqueezy/       # Payment integration
│   │   ├── client.ts
│   │   ├── webhooks.ts
│   │   └── plans.ts
│   ├── ai/                 # AI service integration
│   │   └── claude.ts
│   ├── subscription/       # Subscription logic
│   ├── utils/              # Utility functions
│   ├── hooks/              # Custom React hooks
│   ├── mocks/              # Mock data for development
│   ├── env.ts              # Environment validation
│   └── query-provider.tsx  # TanStack Query setup
├── types/                  # TypeScript types
│   ├── api.ts
│   ├── database.ts
│   └── subscription.ts
├── supabase/               # Supabase configuration
│   └── migrations/         # Database migrations
├── public/                 # Static assets
│   ├── logo.svg
│   ├── og-image.png
│   └── [various favicons]
├── scripts/                # Build scripts
├── middleware.ts           # Next.js middleware (auth)
├── next.config.ts          # Next.js configuration
├── vitest.config.ts        # Vitest configuration
└── package.json
```

### Web App Key Patterns

- **Route Groups**: `(auth)` and `(dashboard)` for layout organization
- **API Routes**: Server-side endpoints in `app/api/`
- **Server Components**: Default in App Router, use 'use client' when needed
- **Server Actions**: For form submissions and mutations
- **Middleware**: Protects routes and handles auth redirects
- **shadcn/ui**: Component library pattern with customization

## Shared Assets (`assets/`)

```
assets/
└── theme.css               # Shared theme variables
```


## Configuration Files

- **Root**: Workspace-level configs (package.json, tsconfig.json, bun.toml)
- **Extension**: WXT, Vitest, Playwright configs
- **Web**: Next.js, ESLint, PostCSS configs
- **Environment**: `.env` (extension), `.env.local` (web)

## Build Outputs

- **Extension**: `.output/` directory with browser-specific builds
- **Web**: `.next/` directory (gitignored)
- **Node Modules**: Hoisted to root when possible, app-specific when needed

## Key Conventions

- TypeScript strict mode enabled
- React 19 with JSX transform (no React import needed)
- Tailwind CSS v4 for styling
- Zod for runtime validation
- TanStack Query for data fetching
- Consistent error handling patterns
- Logger utilities for debugging
