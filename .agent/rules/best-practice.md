---
trigger: model_decision
description: when updating source code not test code, wherever this source code is or as long as it is web or js or ts code
---

# Best Practices & Guidelines

### 1. Type Safety First
✅ **DO**:
- Use TypeScript for all code (no `.js` files)
- Define explicit types for function parameters and return values
- Use `z.infer<typeof Schema>` to derive types from Zod schemas
- Enable `strict` mode in `tsconfig.json`
- Avoid `any` type; use `unknown` if type is truly unknown

❌ **DON'T**:
- Use `any` type
- Disable TypeScript checks with `@ts-ignore` without explanation
- Use type assertions (`as`) unless absolutely necessary
- Leave implicit `any` types

### 2. Error Handling
✅ **DO**:
- Use custom error classes for domain-specific errors
- Catch and handle errors at appropriate levels
- Provide user-friendly error messages
- Log errors with context
- Use `try-catch` for async operations

❌ **DON'T**:
- Swallow errors silently
- Use generic error messages
- Throw strings instead of Error objects
- Leave unhandled promise rejections

```typescript
// ✅ Good
try {
  const result = await enhanceText(text);
  return result;
} catch (error) {
  if (error instanceof SubscriptionError) {
    logger.error('Subscription limit reached', { userId, error });
    throw new Error('Please upgrade your plan to continue');
  }
  throw error;
}

// ❌ Bad
try {
  const result = await enhanceText(text);
  return result;
} catch (error) {
  console.log('error');
  return null;
}
```

### 3. Code Organization
✅ **DO**:
- Keep files focused and single-purpose
- Use barrel exports (`index.ts`) for clean imports
- Group related files in directories
- Follow established folder structure
- Limit file size to ~300 lines

❌ **DON'T**:
- Create monolithic files
- Mix concerns in single file
- Use deep nesting (max 3-4 levels)

---

## WXT Browser Extension

### 1. Extension Architecture

✅ **DO**:
- Use file-based entrypoints (`background.ts`, `content.ts`, `popup/index.html`)
- Leverage WXT's automatic manifest generation
- Use TypeScript for all extension code
- Implement proper message passing between scripts
- Use chrome.storage API through type-safe wrappers

```typescript
// ✅ Good - Type-safe storage wrapper
export async function getAuthToken(): Promise<string | null> {
  return storage.getItem('local:authToken');
}

// ❌ Bad - Direct chrome.storage usage
chrome.storage.local.get('authToken', (result) => {
  const token = result.authToken;
});
```

### 2. Permissions & Security

✅ **DO**:
- Request **minimum necessary permissions**
- Use `host_permissions` instead of broad `permissions`
- Validate all messages from untrusted sources
- Use CSP headers
- Store sensitive data in `chrome.storage.local` (encrypted by browser)

❌ **DON'T**:
- Request `<all_urls>` permission unless necessary
- Store API keys or secrets in extension code
- Trust data from web pages without validation
- Use `eval()` or `innerHTML` with user data

```typescript
// wxt.config.ts
// ✅ Good - Specific permissions
permissions: [
  'contextMenus',
  'storage',
  'activeTab',
  'scripting',
],
host_permissions: [
  'http://localhost/*',
  'https://*.verba.app/*',
],

// ❌ Bad - Overly broad
permissions: [
  'tabs',
  '<all_urls>',
  'webRequest',
  'webRequestBlocking',
],
```

### 3. Cross-Browser Compatibility

✅ **DO**:
- Test on Chrome, Firefox, and Edge
- Use WXT's browser polyfills
- Handle browser-specific quirks
- Use feature detection

❌ **DON'T**:
- Use Chrome-only APIs without polyfills
- Assume all browsers behave identically
- Hard-code browser-specific values

### 1. Server vs Client Components

✅ **DO**:
- Use **Server Components by default**
- Add `'use client'` only when necessary (state, effects, browser APIs)
- Keep client components small and at leaf nodes
- Fetch data in Server Components
- Use Server Actions for mutations

❌ **DON'T**:
- Make everything a client component
- Fetch data in client components when avoidable
- Pass sensitive data to client components
- Use `useEffect` for data fetching

```typescript
// ✅ Good - Server Component (default)
// app/dashboard/page.tsx
async function DashboardPage() {
  const user = await getUser(); // Server-side data fetching
  return <Dashboard user={user} />;
}

// ✅ Good - Client Component (when needed)
// components/Counter.tsx
'use client';
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// ❌ Bad - Unnecessary client component
'use client';
import { useEffect, useState } from 'react';

export function UserProfile() {
  
  return <div>{user?.name}</div>;
}
```

### 2. Security Best Practices

✅ **DO**:
- **Never pass sensitive data to client components**
- Store secrets in `.env.local` without `NEXT_PUBLIC_` prefix
- Validate all inputs on the server
- Use Server Actions for mutations
- Implement CSRF protection
- Use `HttpOnly`, `Secure`, `SameSite` cookies
- Verify authentication at every data access point
- Implement rate limiting

```typescript
// ✅ Good - Server-side validation
// app/api/enhance/route.ts
export async function POST(request: Request) {
  // 1. Authenticate
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Validate input
  // Validation Code ...

  // 3. Check authorization
  // Authorization Code ...

  // 4. Process request
  // Request Processing Code ...
}

// ❌ Bad - No validation or auth
export async function POST(request: Request) {
  const body = await request.json();
  const result = await enhanceText(body.text);
  return Response.json(result);
}


// ✅ Good - Lazy loading
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Spinner />,
  ssr: false,
});

// ❌ Bad - Unoptimized
export function Hero() {
  return <img src="/hero.jpg" alt="Hero" />;
}
```

### 4. Data Fetching

✅ **DO**:
- Fetch data in Server Components
- Use TanStack Query for client-side data
- Implement proper error boundaries
- Use `revalidatePath()` or `revalidateTag()` for cache invalidation
- Handle loading and error states

❌ **DON'T**:
- Use `useEffect` for initial data fetching
- Fetch data in client components when avoidable
- Skip error handling
- Ignore loading states

```typescript
// ✅ Good - Server Component data fetching
async function UserDashboard({ userId }: { userId: string }) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    notFound();
  }

  return <Dashboard user={user} />;
}

// ✅ Good - Client-side with TanStack Query
'use client';
import { useQuery } from '@tanstack/react-query';

export function UsageStats() {
  const { data, isLoading, error } = useQuery({ ... });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <Stats data={data} />;
}
```

### 1. Component Design

✅ **DO**:
- Use functional components with hooks
- Keep components focused (single responsibility)
- Extract reusable logic into custom hooks
- Use proper TypeScript types for props
- Implement proper error boundaries
- Use `React.memo()` for expensive components

❌ **DON'T**:
- Use class components (unless required)
- Create god components (> 300 lines)
- Inline complex logic in JSX
- Use prop drilling (use context or state management)

```typescript
// ✅ Good - Focused component with types
interface DashboardProps {
  user: User;
  subscription: Subscription;
  onLogout: () => void;
}

export function Dashboard({ user, subscription, onLogout }: DashboardProps) {
  return (
    <div>
      <Header user={user} onLogout={onLogout} />
      <SubscriptionCard subscription={subscription} />
      <UsageStats userId={user.id} />
    </div>
  );
}
```

### 2. Hooks Best Practices

✅ **DO**:
- Follow Rules of Hooks (top level, consistent order)
- Extract complex logic into custom hooks
- Use `useCallback` for functions passed as props
- Use `useMemo` for expensive computations
- Clean up effects (return cleanup function)

### 3. State Management

✅ **DO**:
- Use local state for component-specific data
- Use TanStack Query for server state
- Use Context for shared UI state (theme, locale)
- Lift state only when necessary
- Use reducers for complex state logic

❌ **DON'T**:
- Use global state for everything
- Prop drill through many levels
- Store server data in local state
- Create unnecessary re-renders

---

## Bun Monorepo

## Supabase & Database

### 1. Row Level Security (RLS)

✅ **DO**:
- **Enable RLS on ALL user-facing tables**
- Create specific policies for SELECT, INSERT, UPDATE, DELETE
- Use `auth.uid()` to identify current user
- Test policies thoroughly before production
- Document complex policies
- Add indexes to columns used in RLS policies

❌ **DON'T**:
- Disable RLS on production tables
- Use overly broad policies
- Hard-code user IDs in policies
- Skip policy testing

```sql
-- ✅ Good - Specific RLS policy
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ❌ Bad - No RLS or overly broad
CREATE POLICY "Anyone can do anything"
  ON profiles
  FOR ALL
  USING (true);
```

### 3. Supabase Client Usage

✅ **DO**:
- Use `createServerClient` for Server Components/Actions
- Use `createBrowserClient` for Client Components
- Handle errors from Supabase operations
- Use TypeScript types generated from schema
- Implement proper session management

❌ **DON'T**:
- Use server client in client components
- Ignore error responses
- Skip session refresh logic
- Hard-code table/column names
