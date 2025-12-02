# Development Conventions & Best Practices

## Code Style

**TypeScript**:
- Strict mode enabled in all tsconfig.json files
- No implicit any
- Explicit return types for exported functions
- Use type inference for local variables
- Prefer interfaces for object shapes, types for unions/intersections

**React**:
- React 19 with JSX transform (no React import needed)
- Functional components only
- Custom hooks for reusable logic (prefix with `use`)
- Lazy loading for heavy components (`React.lazy`)
- Suspense boundaries for loading states

**Naming Conventions**:
- Components: PascalCase (e.g., `UserProfile.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useAuth.ts`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- Types/Interfaces: PascalCase (e.g., `User`, `ApiResponse`)
- Files: kebab-case for utilities, PascalCase for components

## Architecture Patterns

**Extension Architecture**:
- **Class-based managers** in content script for maintainability
- **Message passing** between content, background, and popup
- **Storage utilities** with type-safe wrappers around `browser.storage`
- **Service layer** for API calls (auth, AI, subscription)
- **Error classes** for specific error types (AuthenticationError, SubscriptionError, etc.)

**Web App Architecture**:
- **Server Components** by default (App Router)
- **Client Components** only when needed ('use client' directive)
- **Server Actions** for mutations and form submissions
- **API Routes** for extension and external API calls
- **Middleware** for auth protection and session management
- **Type-safe env vars** using @t3-oss/env-nextjs

## Error Handling

**Extension**:
```typescript
// Custom error classes in utils/errors.ts
throw new AuthenticationError('Please log in')
throw new SubscriptionError('Usage limit exceeded', limit, used)
throw new LanguageNotSupportedError('es', 'Spanish not supported')
throw new APIError('API_ERROR', 'Request failed', 500)
```

**Web App**:
```typescript
// Structured error responses
return NextResponse.json({
  success: false,
  error: {
    code: ApiErrorCode.UNAUTHORIZED,
    message: 'Authentication required'
  }
}, { status: 401 })
```

**Logging**:
- Use centralized logger utility (`utils/logger.ts`)
- Log levels: debug, info, warn, error
- Configurable via `VITE_LOG_LEVEL` (extension) or `DEBUG` (web)
- Performance tracking with `performanceMonitor` utility

## API Communication

**Extension → Backend**:
```typescript
// Use typed API client
import { apiPost, apiGet } from '@/services/api/client'

const result = await apiPost<RewriteResponse>('ai/enhance', {
  text,
  options
})
```

**Request Headers**:
- `Authorization: Bearer <jwt-token>` (auto-added by client)
- `X-Extension-ID: <extension-id>` (for backend verification)

**Response Format**:
```typescript
// Success
{ success: true, data: { ... } }

// Error
{ success: false, error: { code: string, message: string } }
```

## State Management

**Extension**:
- `browser.storage.local` for persistent data (auth, user, subscription, usage, settings)
- React hooks for component state
- TanStack Query for server state (popup)
- Storage watchers for reactive updates

**Web App**:
- TanStack Query for server state
- React hooks for component state
- URL state for filters/pagination
- Supabase real-time subscriptions (future)

## Validation

**Runtime Validation**:
- Zod schemas for all API requests/responses
- Validate at boundaries (API entry points, storage operations)
- Schemas in `schemas/validation.ts` (extension) or `types/api.ts` (web)

**Example**:
```typescript
import { RewriteResponseSchema } from '@/schemas/validation'

const validated = RewriteResponseSchema.parse(response)
```
