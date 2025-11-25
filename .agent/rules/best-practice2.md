---
trigger: model_decision
description: when updating source code not test code, wherever this source code is or as long as it is web or js or ts code
---

## Testing (Vitest)

### Test Structure

✅ **DO**:
- Follow AAA pattern (Arrange, Act, Assert)
- Use descriptive test names
- Test one thing per test
- Use `describe` blocks for grouping
- Mock external dependencies
- Clean up after tests

❌ **DON'T**:
- Write tests that depend on each other
- Test implementation details
- Skip edge cases
- Leave tests commented out

### 2. React Component Testing

✅ **DO**:
- Use React Testing Library
- Test user behavior, not implementation
- Use `screen` queries
- Use `userEvent` for interactions
- Test accessibility
- Mock API calls with MSW

❌ **DON'T**:
- Test component internals
- Test implementation details

```typescript
// ✅ Good - User-centric test
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dashboard } from './Dashboard';

describe('Dashboard', () => {
  it('should display user name and allow logout', async () => {
    // Arrange
    const user = { id: '1', name: 'John Doe', email: 'john@example.com' };
    const onLogout = vi.fn();
    
    render(<Dashboard user={user} onLogout={onLogout} />);

    // Assert - User name visible
    expect(screen.getByText('John Doe')).toBeInTheDocument();

    // Act - Click logout
    await userEvent.click(screen.getByRole('button', { name: /logout/i }));

    // Assert - Logout called
    expect(onLogout).toHaveBeenCalledOnce();
  });
});

// ❌ Bad - Implementation-focused
it('should set state correctly', () => {
  const { container } = render(<Dashboard />);
  const button = container.querySelector('.logout-btn');
  // Testing internals, not behavior
});
```

### 3. MSW (Mock Service Worker)

✅ **DO**:
- Define handlers in centralized file (`mocks/api/handlers.ts`)
- Use realistic response delays
- Test both success and error scenarios
- Reset handlers between tests
- Use JSON fixtures for static responses

❌ **DON'T**:
- Define handlers inline in tests
- Use instant responses (unrealistic)
- Only test happy paths
- Let handlers leak between tests

---

## API Design

### 1. REST Principles

✅ **DO**:
- Use appropriate HTTP methods (GET, POST, PUT, DELETE)
- Use proper status codes (200, 201, 400, 401, 403, 404, 500)
- Version APIs if breaking changes expected
- Use consistent response format
- Implement pagination for list endpoints

### 2. Input Validation

✅ **DO**:
- Validate ALL inputs with Zod schemas
- Use `safeParse()` for graceful error handling
- Provide clear validation error messages
- Validate on both client and server
- Sanitize user input

❌ **DON'T**:
- Trust client-side validation alone
- Skip validation on server
- Use generic error messages
- Process unvalidated input

```typescript
// ✅ Good - Zod validation
import { z } from 'zod';

const EnhanceRequestSchema = z.object({
  text: z.string().min(1).max(5000),
  mode: z.enum(['enhance', 'rephrase', 'simplify']).optional(),
  language: z.enum(['en', 'ar', 'fr', 'auto']).optional(),
  tone: z.enum(['professional', 'casual', 'formal']).optional(),
});

export async function POST(request: Request) {
  // Validate input
  ...

  // Use validated.data (type-safe)
  return Response.json({ success: true, data: result });
}
```

### 3. Error Responses

✅ **DO**:
- Use appropriate HTTP status codes
- Provide actionable error messages
- Include error codes for client handling
- Log errors server-side
- Never expose sensitive information in errors

❌ **DON'T**:
- Return 200 for errors
- Expose stack traces to clients
- Use generic "Something went wrong" messages
- Include sensitive data in error responses

```typescript
// ✅ Good - Proper error handling
export class ApiError extends Error { ... }
```

---

## Security

### 1. Authentication & Authorization

✅ **DO**:
- Verify authentication on EVERY API request
- Check authorization before data access
- Use secure session management
- Implement token refresh logic
- Hash API keys before storage
- Use HTTPS only

❌ **DON'T**:
- Rely on client-side auth checks alone
- Store passwords in plain text
- Use weak session tokens
- Skip authorization checks
- Trust user input

### 2. Input Sanitization

✅ **DO**:
- Validate and sanitize ALL user input
- Use parameterized queries (Supabase handles this)
- Escape HTML when rendering user content
- Validate file uploads
- Limit input sizes

❌ **DON'T**:
- Use `dangerouslySetInnerHTML` with user content
- Concatenate user input into SQL queries
- Trust file upload MIME types
- Allow unlimited input sizes

### 3. Secrets Management

✅ **DO**:
- Store secrets in `.env.local` (never commit)
- Use environment variables for all secrets
- Rotate secrets regularly
- Use different secrets for dev/staging/prod
- Document required environment variables

❌ **DON'T**:
- Hard-code secrets in code
- Commit `.env` files
- Share secrets via insecure channels
- Use same secrets across environments

```bash
# ✅ Good - .env.local (gitignored)
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
LEMONSQUEEZY_WEBHOOK_SECRET=whsec_...

# ✅ Good - .env.local.example (committed)
ANTHROPIC_API_KEY=your_anthropic_api_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret_here
```

### 4. Webhook Security

✅ **DO**:
- **Always verify webhook signatures**
- Use timing-safe comparison for signatures
- Return 200 quickly, process asynchronously
- Log all webhook events
- Handle duplicate events (idempotency)

❌ **DON'T**:
- Skip signature verification
- Process webhooks synchronously
- Assume webhooks arrive once
- Trust webhook data without validation

```typescript
// ✅ Good - Webhook verification
import crypto from 'crypto';

export async function POST(request: Request) {
  const signature = request.headers.get('X-Signature');

  // Verify signature
  ...

  // Parse and process
  const event = JSON.parse(body);
  
  // Return 200 immediately
  processWebhookAsync(event); // Background processing
  
  return Response.json({ received: true });
}
```

---

### 4. Comments & Documentation

✅ **DO**:
- Write JSDoc comments for public APIs
- Explain WHY, not WHAT
- Document complex algorithms
- Add TODO comments with context
- Keep comments up to date

❌ **DON'T**:
- Write obvious comments
- Leave commented-out code
- Use comments to explain bad code (refactor instead)

```typescript
// ✅ Good - Explains WHY
/**
 * Checks if user has reached their usage limit.
 * 
 * Trial users are limited to 10 enhancements.
 * Paid users have unlimited access but are soft-monitored for abuse.
 * 
 * @throws {SubscriptionError} If limit is exceeded
 */
export async function checkLimit(): Promise<void> {
  // Implementation...
}

// ❌ Bad - Explains WHAT (obvious from code)
// This function gets the user
function getUser() {
  // Get the user from the database
  return db.query.users.findFirst();
}
```

---

## Zod Schema Validation

### Schema Definition

✅ **DO**:
- Define schemas close to where they're used
- Use `z.infer<typeof Schema>` for types
- Add custom error messages
- Use `.strict()` to prevent extra fields
- Compose complex schemas from simple ones

❌ **DON'T**:
- Duplicate schema definitions
- Use TypeScript interfaces when Zod schema exists
- Skip error messages
- Allow arbitrary fields

```typescript
// ✅ Good - Well-defined schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100),
  avatar: z.string().url().optional(),
}).strict();

export type User = z.infer<typeof UserSchema>;

// ✅ Good - Composed schema
export const CreateUserSchema = UserSchema.omit({ id: true });
export const UpdateUserSchema = UserSchema.partial().required({ id: true });

// ❌ Bad - Loose schema
const UserSchema = z.object({
  email: z.string(),
  name: z.string(),
});
```

---

## TanStack Query

### Query Configuration

✅ **DO**:
- Use descriptive query keys
- Implement proper stale time
- Handle loading and error states
- Use query invalidation for updates
- Implement optimistic updates for mutations

❌ **DON'T**:
- Use generic query keys
- Set stale time too low (causes excessive requests)
- Ignore error states
- Refetch unnecessarily

---

## Lemon Squeezy Integration

### Webhook Handling

✅ **DO**:
- **Always verify webhook signatures**
- Return 200 status immediately
- Process webhooks asynchronously
- Handle duplicate events (idempotency)
- Log all webhook events
- Test with Lemon Squeezy test mode

❌ **DON'T**:
- Skip signature verification
- Process synchronously (may timeout)
- Assume events arrive once
- Skip logging

### 2. Subscription Management

✅ **DO**:
- Sync subscription status to database
- Handle all subscription lifecycle events
- Implement grace periods
- Provide customer portal access
- Test subscription flows thoroughly

❌ **DON'T**:
- Store payment details (Lemon Squeezy handles this)
- Skip webhook events
- Hard-code subscription logic

---

## Logging

### 1. Log Levels

```typescript
// ✅ Good - Structured logging
logger.info('User authenticated', {
  userId: user.id,
  email: user.email,
  timestamp: new Date().toISOString(),
});

logger.error('API request failed', {
  endpoint: '/api/enhance',
  statusCode: 500,
  error: error.message,
  stack: error.stack,
});

// ❌ Bad
console.log('user logged in');
console.log(error);
```

### 2. Log Levels by Environment

```typescript
// Development
VITE_LOG_LEVEL=debug  // All logs 
VITE_LOG_LEVEL=info   // Info and above
// Production
VITE_LOG_LEVEL=error  // Errors only
```

---

### README Structure

Every package should have a README with:
- Description
- Installation instructions
- Usage examples
- API reference
- Testing instructions
- Contributing guidelines

---

## Accessibility

### Web Accessibility (WCAG 2.1)

✅ **DO**:
- Use semantic HTML
- Add ARIA labels where needed
- Ensure keyboard navigation works
- Provide text alternatives for images
- Use sufficient color contrast (4.5:1 minimum)
- Test with screen readers