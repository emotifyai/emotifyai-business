# Environment Configuration Guide

This guide explains how to configure environment variables for the EmotifyAI monorepo, covering both the browser extension and web application.

## Overview

EmotifyAI uses a **type-safe environment configuration system** with runtime validation to catch configuration errors early. Each package manages its own environment variables independently.

### Architecture

```
emotifyai/
├── .env.example                    # Root template (optional, for reference)
├── apps/
│   ├── extension/
│   │   ├── .env                    # Development (gitignored)
│   │   ├── .env.test               # Testing (gitignored if sensitive)
│   │   ├── .env.example            # Template with documentation
│   │   ├── .env.test.example       # Test template
│   │   ├── .env.production.example # Production template
│   │   └── lib/env.ts              # Type-safe validation (Zod)
│   │
│   └── web/
│       ├── .env.local              # Development (gitignored)
│       ├── .env.test.local         # Testing (gitignored)
│       ├── .env.production.local   # Production (gitignored)
│       ├── .env.local.example      # Template with documentation
│       ├── .env.test.local.example # Test template
│       ├── .env.production.local.example # Production template
│       └── lib/env.ts              # Type-safe validation (@t3-oss/env-nextjs)
```

## Environment File Patterns

### Naming Convention

- **`.env`** → Development environment
- **`.env.test`** → Testing environment (gitignored if contains sensitive data)
- **`.env.production`** → Production environment
- **`.env.*.example`** → Templates with documentation (committed to git)

### Extension Patterns

```bash
.env                    # Development
.env.test               # Testing
.env.example            # Template
.env.test.example       # Test template
.env.production.example # Production template
```

### Web App Patterns (Next.js)

```bash
.env.local                    # Development
.env.test.local               # Testing
.env.production.local         # Production
.env.local.example            # Template
.env.test.local.example       # Test template
.env.production.local.example # Production template
```

## Quick Start

### 1. Extension Setup

```bash
cd apps/extension

# Copy template to create development environment
cp .env.example .env

# Edit .env and fill in your values
# For local development with mock API, defaults are fine
```

### 2. Web App Setup

```bash
cd apps/web

# Copy template to create development environment
cp .env.local.example .env.local

# Edit .env.local and fill in your actual credentials
# You'll need Supabase, Lemon Squeezy, and Anthropic API keys
```

### 3. Verify Configuration

```bash
# Extension: Run dev server (validates env on startup)
cd apps/extension
bun dev

# Web App: Run dev server (validates env on startup)
cd apps/web
bun dev
```

## Type-Safe Environment Variables

### Extension (Zod-based)

The extension uses a custom Zod-based validation system:

```typescript
// apps/extension/lib/env.ts
import { env } from '@/lib/env';

// All environment variables are validated and typed
console.log(env.VITE_API_BASE_URL); // string (validated URL)
console.log(env.VITE_MOCK_API_ENABLED); // boolean
console.log(env.VITE_LOG_LEVEL); // 'debug' | 'info' | 'warn' | 'error'
```

**Features**:
- Runtime validation with Zod
- Automatic type inference
- Helpful error messages
- Boolean transformation (string → boolean)

### Web App (@t3-oss/env-nextjs)

The web app uses `@t3-oss/env-nextjs` for Next.js-specific features:

```typescript
// apps/web/lib/env.ts
import { env } from '@/lib/env';

// Server-side only (never exposed to client)
console.log(env.SUPABASE_SERVICE_ROLE_KEY);
console.log(env.ANTHROPIC_API_KEY);

// Client-side (exposed to browser)
console.log(env.NEXT_PUBLIC_SUPABASE_URL);
console.log(env.NEXT_PUBLIC_APP_URL);
```

**Features**:
- Separates client and server variables
- Runtime validation with Zod
- Automatic type inference
- Next.js integration
- Build-time validation

## Environment Transformation (Dev → Prod)

### Extension

```bash
# Development
cp .env.example .env
# Edit .env with local values

# Testing
cp .env.test.example .env.test
# Edit .env.test with test values

# Production
cp .env.production.example .env.production
# Edit .env.production with production values
# Use in CI/CD or build process
```

### Web App

```bash
# Development
cp .env.local.example .env.local
# Edit .env.local with local/test credentials

# Testing
cp .env.test.local.example .env.test.local
# Edit .env.test.local with test credentials

# Production
cp .env.production.local.example .env.production.local
# Edit .env.production.local with production credentials
# Deploy to hosting platform (Vercel, etc.)
```

## Required Variables

### Extension (Minimum)

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_MOCK_API_ENABLED=true
VITE_OAUTH_CLIENT_ID=dev_client_id
VITE_WEB_APP_URL=http://localhost:3000
VITE_LOG_LEVEL=debug
```

### Web App (Minimum)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Lemon Squeezy
LEMONSQUEEZY_API_KEY=your-api-key
LEMONSQUEEZY_STORE_ID=your-store-id
LEMONSQUEEZY_WEBHOOK_SECRET=your-webhook-secret
LEMONSQUEEZY_MONTHLY_VARIANT_ID=your-monthly-variant
LEMONSQUEEZY_LIFETIME_VARIANT_ID=your-lifetime-variant

# Anthropic (or enable MOCK_AI_RESPONSES=true)
ANTHROPIC_API_KEY=your-api-key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Validation Errors

### Extension

If validation fails, you'll see a detailed error:

```
❌ Invalid environment variables:
  - VITE_API_BASE_URL: Invalid URL
  - VITE_OAUTH_CLIENT_ID: Required

Please check your .env file and ensure all required variables are set correctly.
See .env.example for reference.
```

### Web App

If validation fails during build or runtime:

```
❌ Invalid environment variables:
  - NEXT_PUBLIC_SUPABASE_URL: Invalid URL
  - ANTHROPIC_API_KEY: Required

Fix the issues above and restart the server.
```

## Best Practices

### 1. Never Commit Secrets

```bash
# ✅ Good - committed
.env.example
.env.local.example

# ❌ Bad - gitignored
.env
.env.local
.env.production.local
```

### 2. Use Mock Mode for Development

```env
# Extension
VITE_MOCK_API_ENABLED=true

# Web App
MOCK_AI_RESPONSES=true
```

### 3. Document All Variables

Always add comments in `.example` files:

```env
# API Base URL
# Development: http://localhost:3000/api
# Production: https://emotifyai.com/api
VITE_API_BASE_URL=http://localhost:3000/api
```

### 4. Validate Early

Both packages validate environment variables on startup, catching errors before they cause issues.

### 5. Use Type-Safe Access

```typescript
// ✅ Good - type-safe
import { env } from '@/lib/env';
console.log(env.VITE_API_BASE_URL);

// ❌ Bad - no type safety
console.log(import.meta.env.VITE_API_BASE_URL);
```

## Troubleshooting

### Issue: "Invalid environment variables" error

**Solution**: Check the error message for specific validation failures. Ensure all required variables are set and valid.

### Issue: Extension not connecting to API

**Solution**: Verify `VITE_API_BASE_URL` is correct and the web app is running.

### Issue: Web app build failing

**Solution**: Ensure all required environment variables are set. Check `.env.local.example` for reference.

### Issue: OAuth not working

**Solution**: Verify `VITE_OAUTH_CLIENT_ID` (extension) and Supabase OAuth settings (web app) are correct.

### Issue: AI enhancement not working

**Solution**: Either set `ANTHROPIC_API_KEY` or enable `MOCK_AI_RESPONSES=true` for testing.

## CI/CD Configuration

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
env:
  # Extension
  VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
  VITE_OAUTH_CLIENT_ID: ${{ secrets.VITE_OAUTH_CLIENT_ID }}
  
  # Web App
  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
  # ... other secrets
```

### Vercel Configuration

Add environment variables in Vercel dashboard:
- Project Settings → Environment Variables
- Add all variables from `.env.production.local.example`
- Set appropriate environment (Production, Preview, Development)

## Migration Guide

### From Old Configuration

If you have existing `.env` files without type-safe validation:

1. **Install dependencies**:
   ```bash
   # Web app only
   cd apps/web
   bun add @t3-oss/env-nextjs
   ```

2. **Update imports**:
   ```typescript
   // Before
   const apiUrl = process.env.NEXT_PUBLIC_API_URL;
   
   // After
   import { env } from '@/lib/env';
   const apiUrl = env.NEXT_PUBLIC_API_URL;
   ```

3. **Verify all variables**:
   ```bash
   # Extension
   cd apps/extension
   bun dev  # Will validate and show errors
   
   # Web App
   cd apps/web
   bun dev  # Will validate and show errors
   ```

## Additional Resources

- [Extension Environment Variables](./../apps/extension/.env.example)
- [Web App Environment Variables](./../apps/web/.env.local.example)
- [Zod Documentation](https://zod.dev)
- [@t3-oss/env-nextjs Documentation](https://env.t3.gg)
