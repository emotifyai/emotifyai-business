# EmotifyAI Implementation Requirements & Issues Analysis

## Executive Summary

This document provides a comprehensive analysis of all outstanding issues, requirements, and implementation tasks for the EmotifyAI platform (formerly Verba). It covers the complete rebranding, subscription model updates, architectural improvements, and production readiness requirements across the monorepo.

---

## 1. BRANDING & REBRANDING (HIGH PRIORITY)

### 1.1 Project Name Change: Verba → EmotifyAI

**Scope**: Complete rebranding across all packages, documentation, and code

**Files Requiring Updates**:

#### Root Level
- `package.json` - Update name, author, repository URL
- `README.md` - Replace all "Verba" references with "EmotifyAI"
- `CONTRIBUTING.md` - Update email addresses and project references
- `.kiro/steering/product.md` - Update product name in overview
- `netlify.toml` - Update deployment configuration comments

#### Documentation (`docs/`)
- `docs/INDEX.md` - Update all references, URLs, email addresses
- `docs/CHROME_STORE_SUBMISSION.md` - Update extension name, description, privacy policy URL
- `docs/FIREFOX_ADDONS_SUBMISSION.md` - Update add-on name, description, URLs
- `docs/FEATURE_ROADMAP.md` - Update title and references
- `docs/ENVIRONMENT_VARIABLES.md` - Update all example URLs and descriptions
- `docs/environment-configuration.md` - Update guide title and examples
- `docs/DEPLOYMENT_CHECKLIST.md` - Update health check URLs
- `docs/api-setup-guide.md` - Update product names in Lemon Squeezy setup

#### Web App (`apps/web/`)
- `apps/web/app/(auth)/login/page.tsx` - Update metadata title
- `apps/web/app/pricing/page.tsx` - Update metadata title
- `apps/web/app/terms/page.tsx` - Update email addresses
- `apps/web/app/privacy/page.tsx` - Update email addresses
- `apps/web/components/layout/footer.tsx` - Update support email
- `apps/web/lib/mock-data/index.ts` - Update mock email domain
- `apps/web/.env.example` - Update all URL examples and email addresses
- `apps/web/.env.production.example` - Update production URLs

#### Extension (`apps/extension/`)
- `apps/extension/entrypoints/popup/components/AuthView.tsx` - Update welcome text
- `apps/extension/entrypoints/popup/components/Dashboard.tsx` - Update WEB_APP_URL default
- `apps/extension/mocks/api/data.ts` - Update mock email domain
- `apps/extension/wxt.config.ts` - Update host_permissions
- `apps/extension/README.md` - Update all references and URLs
- `apps/extension/.env.example` - Update all URL examples
- `apps/extension/.env.production.example` - Update production URLs

#### Packages (`packages/`)
- `packages/ui/package.json` - Update package name from `@verba/ui` to `@emotifyai/ui`
- `packages/ui/src/theme.ts` - Update theme documentation comments

#### Agent Rules (`.agent/rules/`)
- `.agent/rules/best-practice.md` - Update host_permissions examples
- `.agent/rules/overview2.md` - Update all URL examples

**URL Patterns to Update**:
- `https://verba.app` → `https://emotifyai.com`
- `https://api.verba.app` → `https://emotifyai.com/api`
- `https://*.verba.app/*` → `https://emotifyai.com/*`
- `https://docs.verba.app` → `https://emotifyai.com/docs`

**NOTE**: Single domain architecture - `https://emotifyai.com` with API at `/api` route

---

## 2. DOMAIN & ENVIRONMENT CONFIGURATION (HIGH PRIORITY)

### 2.1 Domain Migration: verba.app → emotifyai.com

**Environment Files to Update**:

#### Root Level
- Create/update `.env.example` with global configuration (not mixed with package-specific vars)

#### Web App
- `apps/web/.env.example` - Update NEXT_PUBLIC_APP_URL examples
- `apps/web/.env.production.example` - Update production URLs
- `apps/web/middleware.ts` (if exists) - Update domain references
- `apps/web/next.config.ts` - Update domain configurations

#### Extension
- `apps/extension/.env.example` - Update VITE_API_BASE_URL and VITE_WEB_APP_URL
- `apps/extension/.env.production.example` - Update production URLs
- `apps/extension/wxt.config.ts` - Update host_permissions array

**Middleware Updates Required**:
- Update auth middleware to use emotifyai.com domain
- Update CORS configuration for API endpoints
- Update cookie domain settings
- Update OAuth redirect URLs

**External Service Configuration**:
- **Supabase**: Update Site URL and Redirect URLs in Authentication settings
- **Google OAuth**: Update authorized redirect URIs in Google Console
- **Lemon Squeezy**: Update webhook endpoint URL to `https://emotifyai.com/api/webhooks/lemonsqueezy`
- **DNS**: Configure emotifyai.com with proper A/CNAME records
- **SSL**: Ensure SSL certificates for emotifyai.com

### 2.2 Global Environment Configuration

**Create Root `.env.example`**:
```env
# EmotifyAI Monorepo Configuration
# This file contains global configuration shared across packages

# Domain Configuration (Single Domain Architecture)
DOMAIN=emotifyai.com
WEB_URL=https://emotifyai.com
API_URL=https://emotifyai.com/api

# Environment
NODE_ENV=development

# Shared Configuration
LOG_LEVEL=info
ENABLE_ANALYTICS=false
```

**Separation of Concerns**:
- Root `.env.example` - Global, shared configuration
- `apps/web/.env.example` - Web-specific variables only
- `apps/extension/.env.example` - Extension-specific variables only
- No duplication between files

---

## 3. SUBSCRIPTION MODEL OVERHAUL (CRITICAL PRIORITY)

### 3.1 New Subscription Plans

**Current State** (from status.md and product.md):
- Trial: 10 enhancements
- Monthly: 1000 enhancements/month
- Lifetime: Unlimited

**Required New Model** (from base_idea.md):

#### Free Plan
- **Credits**: 50 generation credits
- **Validity**: 10-day validity period
- **Purpose**: Testing and trial
- **Reset**: No reset, one-time only
- **Price**: $0

#### Lifetime Launch Offer (PRIMARY PLAN)
- **Credits**: 500 generation credits/month (renewed monthly)
- **Price**: $97 USD (one-time payment)
- **Limit**: First 500 subscribers only
- **Features**:
  - Real-time counter showing total subscribers
  - Real-time counter showing remaining lifetime offers (500 - current_count)
  - Monthly credit renewal
  - Lifetime access
- **Implementation**: Requires database tracking of lifetime subscriber count

#### Basic Monthly
- **Credits**: 350 generation credits/month
- **Price**: $17 USD/month
- **Reset**: Monthly on subscription anniversary

#### Pro Monthly
- **Credits**: 700 generation credits/month
- **Price**: $37 USD/month
- **Reset**: Monthly on subscription anniversary

#### Business Monthly
- **Credits**: 1500 generation credits/month
- **Price**: $57 USD/month
- **Reset**: Monthly on subscription anniversary

#### Annual Plans (25% Discount)
- **Basic Annual**: $153 USD/year (350 credits/month)
- **Pro Annual**: $333 USD/year (700 credits/month)
- **Business Annual**: $513 USD/year (1500 credits/month)

### 3.2 Implementation Requirements

**Database Schema Updates** (`apps/web/supabase/migrations/`):
```sql
-- Add new subscription tiers
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS tier VARCHAR(50);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS credits_limit INTEGER;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS credits_used INTEGER DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS credits_reset_date TIMESTAMP;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS validity_days INTEGER;

-- Create lifetime_subscribers tracking table
CREATE TABLE IF NOT EXISTS lifetime_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscribed_at TIMESTAMP DEFAULT NOW(),
  subscriber_number INTEGER UNIQUE,
  CONSTRAINT unique_lifetime_subscriber UNIQUE(user_id)
);

-- Create function to get lifetime subscriber count
CREATE OR REPLACE FUNCTION get_lifetime_subscriber_count()
RETURNS INTEGER AS $$
  SELECT COUNT(*) FROM lifetime_subscribers;
$$ LANGUAGE SQL STABLE;

-- Create function to get remaining lifetime slots
CREATE OR REPLACE FUNCTION get_remaining_lifetime_slots()
RETURNS INTEGER AS $$
  SELECT 500 - COUNT(*) FROM lifetime_subscribers;
$$ LANGUAGE SQL STABLE;
```

**Files Requiring Updates**:

#### Subscription Configuration
- `apps/web/lib/lemonsqueezy/config.ts` - Add new plan variant IDs
- `apps/web/lib/subscription/types.ts` - Update SubscriptionTier enum
- `apps/web/lib/subscription/validation.ts` - Update validation logic for new tiers
- `apps/web/lib/subscription/lifetime-slots.ts` - Implement lifetime counter logic

#### API Endpoints
- `apps/web/app/api/subscription/route.ts` - Update to handle new tiers
- `apps/web/app/api/subscription/lifetime-count/route.ts` - NEW: Endpoint for lifetime counter
- `apps/web/app/api/enhance/route.ts` - Update credit validation logic

#### UI Components
- `apps/web/app/pricing/page.tsx` - Complete redesign with new plans
- `apps/web/components/dashboard/subscription-card.tsx` - Update to show credits
- `apps/web/components/pricing/lifetime-counter.tsx` - NEW: Real-time counter component

#### Extension Updates
- `apps/extension/services/subscription.ts` - Update tier types
- `apps/extension/types/subscription.ts` - Update subscription interface

### 3.3 Pricing Page Enhancements

**Query Parameter Support**:
- Add `?from=new_user` parameter handling
- When `from=new_user`, update Free Plan button text to "Continue with Free Plan"
- When user clicks "Continue with Free Plan", navigate to dashboard
- Implement URL parameter parsing and conditional rendering

**Implementation**:
```typescript
// apps/web/app/pricing/page.tsx
export default function PricingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Check if user came from new_user flow
  // Handle free plan button click with conditional navigation
  // Return pricing component with conditional button text
}
```

**Lifetime Counter Implementation**:
- Real-time WebSocket or polling for subscriber count
- Display: "X of 500 lifetime offers claimed"
- Display: "Only Y spots remaining!"
- Update every 30 seconds or on page load
- Add urgency messaging when < 50 spots remain

---

## 4. NAVIGATION & USER EXPERIENCE (HIGH PRIORITY)

### 4.1 Navbar Avatar Dropdown (Authenticated Users)

**Problem**: When user is signed up, navbar should show avatar dropdown instead of login/signup buttons

**Requirements**:
- Show user avatar (or initials if no avatar)
- Dropdown contains:
  - User email label
  - Current plan label (Free, Basic, Pro, Business, Lifetime)
  - "Dashboard" button
  - "Log out" button
- Add `cursor-pointer` on focus/hover states
- Smooth dropdown animation

**Implementation**:
```typescript
// apps/web/components/layout/navbar-user-menu.tsx - NEW
export function NavbarUserMenu() {
  // Get user data and subscription info
  // Return null if no user
  // Generate user initials from name or email
  // Create dropdown menu with avatar trigger
  // Add cursor-pointer and focus states
  // Show email and plan in dropdown label
  // Include Dashboard link and Logout button
}
```

**Files to Update**:
- `apps/web/components/layout/header.tsx` - Add conditional rendering for authenticated users
- `apps/web/components/layout/navbar-user-menu.tsx` - NEW: User dropdown component

### 4.2 Landing Page Conditional Content

**Problem**: Landing page should show different content for authenticated users

**Requirements**:
- If user is signed in, replace "Get Started" button with "Go to Dashboard"
- Update hero section messaging for authenticated users
- Show personalized content based on subscription status

**Implementation**:
```typescript
// apps/web/app/page.tsx
export default function LandingPage() {
  // Get user authentication state
  // Show personalized message for authenticated users
  // Conditional button: "Go to Dashboard" vs "Get Started"
  // Handle loading state appropriately
}
```

### 4.3 Success Connection Page

**Problem**: Need success page for extension-backend connection

**Requirements**:
- Show when extension successfully links with backend
- Simple page with success message
- "You can close this page now" instruction
- Auto-close after 3 seconds (optional)

**Implementation**:
```typescript
// apps/web/app/success-connection/page.tsx - NEW
export default function SuccessConnectionPage() {
  // Create centered success layout
  // Show success icon and confirmation message
  // Include "close this page" instruction
  // Optional: Auto-close after 3 seconds
}
```

### 4.4 Payment State Pages

**Problem**: Need success and cancel pages for payment flows

**Requirements**:
- Payment success page with confirmation
- Payment cancel page with retry option
- Handle Lemon Squeezy redirects
- Update subscription status after successful payment

**Implementation**:

#### Payment Success Page
```typescript
// apps/web/app/payment/success/page.tsx - NEW
export default function PaymentSuccessPage() {
  // Get order ID from search params
  // Refresh subscription data on mount
  // Show success message with order confirmation
  // Include "Go to Dashboard" button
}
```

#### Payment Cancel Page
```typescript
// apps/web/app/payment/cancel/page.tsx - NEW
export default function PaymentCancelPage() {
  // Show cancellation message with reassurance
  // Include "Try Again" button to pricing page
  // Include "Back to Dashboard" button
  // Use appropriate warning/info styling
}
```

---

## 5. UI/UX IMPROVEMENTS (HIGH PRIORITY)

### 5.1 Loading States for Async Operations

**Problem**: Buttons don't show loading states during I/O operations

**Files Requiring Updates**:

#### Authentication Forms
- `apps/web/components/auth/login-form.tsx`
  - Add loading state to login button
  - Disable form during submission
  - Show spinner or loading text
  
- `apps/web/components/auth/signup-form.tsx`
  - Add loading state to signup button
  - Disable form during submission
  - Show spinner or loading text

- `apps/web/components/auth/oauth-buttons.tsx`
  - Add loading state to Google/GitHub OAuth buttons
  - Prevent multiple clicks during OAuth flow

#### Dashboard Actions
- `apps/web/app/(dashboard)/settings/page.tsx`
  - Add loading states to save/update buttons
  - Show feedback on successful updates

- `apps/web/components/dashboard/subscription-card.tsx`
  - Add loading state to upgrade/cancel buttons

#### Extension Popup
- `apps/extension/entrypoints/popup/components/AuthView.tsx`
  - Already has loading state, verify implementation
  - Ensure consistent loading UI

**Implementation Pattern**:
```typescript
// Standard loading state pattern for async operations
const handleSubmit = async (e: FormEvent) => {
  // Set loading state to true
  // Perform async operation with try/catch
  // Reset loading state in finally block
  // Show loading text/spinner while processing
}
```

### 5.2 Extension Auth Flow Navigation

**Problem**: Extension auth button should navigate to account creation page

**Current State**: `apps/extension/entrypoints/popup/components/AuthView.tsx` has Google OAuth ONLY button

**Required Changes**:
- Add "Create Account" button that opens web app signup page [IF THE USER IS NOT SIGNED IN]
- Update Google OAuth flow to redirect to signup if user doesn't exist
- Ensure proper deep linking from extension to web app
- Handle auth token sync after account creation

**Implementation**:
```typescript
// Extension auth navigation
const handleCreateAccount = () => {
  // Open new tab to web app signup page
  // Include source=extension parameter for tracking
}
```

### 5.3 Layout & Styling Overhaul

**Problem**: Layout issues, inconsistent styling, brand needs update

**Scope**:
- Complete design system review
- Update color palette for EmotifyAI brand
- Fix layout issues in dashboard
- Ensure consistent spacing and typography
- Update Tailwind configuration

**Files to Review**:
- `apps/web/app/globals.css` - Update TAILWIND V4 styles
- All component files for consistent styling

**Key Areas**:
- Dashboard layout responsiveness [phone | tablet | desktop]
- Pricing page card alignment
- Header/footer consistency
- Form styling standardization
- Button variant consistency

---

## 6. AUTHENTICATION & AUTHORIZATION (HIGH PRIORITY)

### 6.1 Auth Sync Fallback Page

**Problem**: Need fallback page when auth doesn't sync between backend and frontend

**Requirements**:
- Create emergency auth generation page
- Only accessible when auth sync fails
- Generate temporary auth token
- Allow user to continue using service
- Log sync failures for debugging

**Implementation**:
- `apps/web/app/auth/fallback/page.tsx` - NEW: Fallback auth page
- `apps/web/app/api/auth/generate-fallback/route.ts` - NEW: Emergency token generation
- Add error boundary to catch auth sync failures
- Implement retry logic before showing fallback

### 6.2 Token Caching in Browser

**Problem**: Need to cache auth tokens in user browsers

**Current State**: Extension uses `browser.storage.local` for token storage

**Web App Requirements**:
- Implement token caching in localStorage/sessionStorage
- Add token refresh logic
- Handle token expiration gracefully
- Sync tokens across tabs
- Clear tokens on logout

**Files to Update**:
- `apps/web/lib/supabase/client.ts` - Add token caching logic
- `apps/web/lib/hooks/use-auth.ts` - Implement token refresh
- `apps/web/middleware.ts` - Check cached tokens

---

## 7. DATA LAYER & HOOKS (CRITICAL PRIORITY)

### 7.1 Missing Usage Hooks Implementation

**Problem**: `useUsageStats` and `useUsageHistory` are not implemented

**Current State**: `apps/web/lib/hooks/use-usage.ts` has placeholder implementation

**Required Implementation**:

```typescript
// apps/web/lib/hooks/use-usage.ts
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface UsageStats {
  total_enhancements: number
  credits_used: number
  credits_remaining: number
  reset_date: string | null
  daily_usage: number
  weekly_usage: number
  monthly_usage: number
}

export interface UsageHistoryItem {
  id: string
  created_at: string
  text_length: number
  language: string
  mode: string
  credits_used: number
}

export function useUsageStats() {
  return useQuery({
    queryKey: ['usage', 'stats'],
    queryFn: async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Not authenticated')
      
      // Fetch subscription info
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      // Fetch usage logs
      const { data: logs } = await supabase
        .from('usage_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      // Calculate stats
      const now = new Date()
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      
      return {
        total_enhancements: logs?.length || 0,
        credits_used: subscription?.credits_used || 0,
        credits_remaining: (subscription?.credits_limit || 0) - (subscription?.credits_used || 0),
        reset_date: subscription?.credits_reset_date,
        daily_usage: logs?.filter(l => new Date(l.created_at) > dayAgo).length || 0,
        weekly_usage: logs?.filter(l => new Date(l.created_at) > weekAgo).length || 0,
        monthly_usage: logs?.filter(l => new Date(l.created_at) > monthAgo).length || 0,
      } as UsageStats
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

export function useUsageHistory(limit = 50) {
  return useQuery({
    queryKey: ['usage', 'history', limit],
    queryFn: async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Not authenticated')
      
      const { data, error } = await supabase
        .from('usage_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      
      return data as UsageHistoryItem[]
    },
  })
}
```

**Files Using These Hooks**:
- `apps/web/app/(dashboard)/dashboard/page.tsx` - Uses `useUsageStats`
- `apps/web/app/(dashboard)/dashboard/usage/page.tsx` - Uses both hooks

### 7.2 Dashboard Pages Refactoring

**Problem**: Dashboard pages need separation between presentation and container components, and need real data

**Current Architecture Issue**: Mixing data fetching with presentation logic

**Required Pattern** (from docs/fetching-practice.md):
- **Container Components**: Handle data fetching, state management
- **Presentation Components**: Pure UI rendering, receive data via props

**Files Requiring Refactoring**:

#### Dashboard Home
- `apps/web/app/(dashboard)/dashboard/page.tsx` - Container
- `apps/web/components/dashboard/dashboard-view.tsx` - NEW: Presentation component

#### Usage Page
- `apps/web/app/(dashboard)/dashboard/usage/page.tsx` - Container
- `apps/web/components/dashboard/usage-view.tsx` - NEW: Presentation component

#### Settings Page
- `apps/web/app/(dashboard)/dashboard/settings/page.tsx` - Container
- `apps/web/components/dashboard/settings-view.tsx` - NEW: Presentation component

**Implementation Example**:
```typescript
// Container (page.tsx)
'use client'
import { useUsageStats } from '@/lib/hooks/use-usage'
import { DashboardView } from '@/components/dashboard/dashboard-view'

export default function DashboardPage() {
  const { data, isLoading, error } = useUsageStats()
  
  return <DashboardView data={data} isLoading={isLoading} error={error} />
}

// Presentation (dashboard-view.tsx)
interface DashboardViewProps {
  data: UsageStats | undefined
  isLoading: boolean
  error: Error | null
}

export function DashboardView({ data, isLoading, error }: DashboardViewProps) {
  if (isLoading) return <LoadingSkeleton />
  if (error) return <ErrorDisplay error={error} />
  if (!data) return <EmptyState />
  
  return (
    <div>
      <StatsCard stats={data} />
      {/* More UI components */}
    </div>
  )
}
```

---

## 8. DATABASE & MIGRATIONS (HIGH PRIORITY)

### 8.1 SQL Reference File Creation

**Problem**: Need complete SQL reference file for database schema

**Requirements**:
- Create `apps/web/supabase/schema.sql` with complete schema
- Include all tables, indexes, RLS policies, functions
- Document relationships and constraints
- Add seed data examples
- Include migration history

**Tables to Document**:
- `profiles` - User profile information
- `subscriptions` - Subscription details and credits
- `usage_logs` - Enhancement usage tracking
- `api_keys` - API key management
- `lifetime_subscribers` - NEW: Lifetime offer tracking

**Additional Requirements**:
- Create seed data file: `apps/web/supabase/seed.sql`
- Document RLS policies for each table
- Include database functions and triggers
- Add indexes for performance optimization

---

## 9. SHARED UI PACKAGE (MEDIUM PRIORITY)

### 9.1 UI Package as Source of Truth

**Problem**: UI package exists but isn't being used consistently

**Current State**: `packages/ui/` exists but components are duplicated in apps

**Requirements**:
- Move shared components to `packages/ui/src/`
- Update imports in web and extension to use `@emotifyai/ui`
- Ensure consistent theming across packages
- Document component API in Storybook or similar

**Components to Centralize**:
- Button variants
- Card components
- Form inputs
- Loading states
- Error displays
- Modal/Dialog components

**Package Structure**:
```
packages/ui/
├── src/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── index.ts
│  lib/
│   └── utils/*
├── package.json (update name to @emotifyai/ui)
└── tsconfig.json
```

---

## 10. TESTING & CODE QUALITY (MEDIUM PRIORITY)

### 10.1 Web Package Test Coverage

**Problem**: Need to ensure tests inside web package are working

**Current State**: Test configuration exists but coverage incomplete

**Requirements**:
- Run existing tests and fix failures
- Add tests for new hooks (useUsageStats, useUsageHistory)
- Test subscription validation logic
- Test API endpoints with new subscription tiers
- Add integration tests for auth flow

**Test Files to Create/Update**:
- `apps/web/lib/hooks/__tests__/use-usage.test.ts` - NEW
- `apps/web/lib/subscription/__tests__/validation.test.ts` - NEW
- `apps/web/app/api/enhance/__tests__/route.test.ts` - Update
- `apps/web/components/dashboard/__tests__/` - Add component tests

**Commands to Run**:
```bash
cd apps/web
bun test
bun test:coverage
```

### 10.2 TypeScript Error Resolution (CRITICAL)

**Problem**: Ensure no TypeScript errors across the entire codebase

**Action Required**: 
- Run TypeScript compilation in all packages and fix errors
- Ensure strict type checking is enabled
- Fix any `any` types or type assertions
- Resolve import/export issues

**Commands to Run**:
```bash
# Check root level
bun run type-check

# Check web app
cd apps/web
bun run type-check

# Check extension
cd apps/extension
bun run type-check

# Check UI package
cd packages/ui
bun run type-check
```

**Common Issues to Fix**:
- Missing type definitions for imports
- Incorrect prop types in React components
- API response type mismatches
- Environment variable type issues
- Hook return type inconsistencies

**Files Likely Needing Updates**:
- `apps/web/lib/hooks/use-usage.ts` - After implementing real hooks
- `apps/web/app/(dashboard)/dashboard/page.tsx` - After refactoring
- `apps/extension/entrypoints/popup/components/AuthView.tsx` - Brand updates
- Any files with "Verba" → "EmotifyAI" changes

---

## 11. SHOPIFY APP INTEGRATION (LOW PRIORITY)

### 11.1 Shopify CLI Setup

**Problem**: Need to add Shopify files to extension package

**Requirements**:
- Install Shopify CLI locally using bun
- Create Shopify app configuration
- Integrate extension with Shopify ecosystem
- Configure app permissions and scopes

**Implementation Steps**:
1. Install Shopify CLI: `bun add -g @shopify/cli @shopify/app`
2. Create `apps/extension/shopify.app.toml` configuration
3. Add Shopify-specific entrypoints
4. Configure OAuth for Shopify merchants
5. Test in Shopify development store

**Files to Create**:
- `apps/extension/shopify.app.toml` - Shopify app configuration
- `apps/extension/extensions/shopify/` - Shopify-specific code
- `docs/SHOPIFY_SETUP.md` - Setup documentation

---

## 12. CODE QUALITY & CLEANUP (ONGOING)

### 12.1 ESLint Configuration

**Action Required**: Add ESLint configuration to extension package

### 12.2 Unused Code Removal

**Files to Review**:
- Remove unused Toast.tsx component
- Clean up unused functions in `apps/web/lib/`
- Remove duplicate utility functions
- Clean up unused imports

---

## 13. PRODUCTION READINESS CHECKLIST

### 13.1 Environment Variables
- [ ] All production URLs updated to emotifyai.com
- [ ] All API keys configured in production
- [ ] Webhook secrets configured
- [ ] OAuth credentials updated

### 13.2 External Services
- [ ] Supabase production configuration verified
- [ ] Lemon Squeezy webhook endpoint updated
- [ ] Google OAuth redirect URIs updated
- [ ] DNS records configured for emotifyai.com
- [ ] SSL certificates installed

### 13.3 Testing
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests for critical paths
- [ ] OAuth flow tested end-to-end
- [ ] Subscription flow tested with real payments

### 13.4 Documentation
- [ ] All documentation updated with new brand
- [ ] API documentation complete
- [ ] Deployment guide updated
- [ ] Troubleshooting guide updated

### 13.5 Deployment
- [ ] Web app deployed to production
- [ ] Extension submitted to Chrome Web Store
- [ ] Extension submitted to Firefox Add-ons
- [ ] Monitoring and error tracking configured

---

## 14. OAUTH GOOGLE TESTING (HIGH PRIORITY)

### 14.1 OAuth Flow Testing & Configuration

**Problem**: Need to test OAuth Google flow and update callback URLs in Google Console

**Requirements**:
- Update Google Console with emotifyai.com redirect URIs
- Test complete OAuth flow from extension to web app
- Verify token sync between platforms
- Test error scenarios (denied access, network failures)

**Google Console Configuration Updates**:
```
Authorized JavaScript origins:
- https://emotifyai.com
- http://localhost:3000 (for development)

Authorized redirect URIs:
- https://emotifyai.com/auth/callback
- https://emotifyai.com/api/auth/callback/google
- http://localhost:3000/auth/callback (for development)
- http://localhost:3000/api/auth/callback/google (for development)
```

**Testing Checklist**:
- [ ] Web app direct OAuth login
- [ ] Extension OAuth flow (opens web app)
- [ ] Token sync from web app back to extension
- [ ] Error handling for denied permissions
- [ ] Token refresh functionality
- [ ] Logout from both platforms

**Files to Update After OAuth Testing**:
- `apps/web/lib/supabase/client.ts` - OAuth configuration
- `apps/extension/services/auth.ts` - OAuth flow handling
- Environment variables with correct OAuth client IDs

---

## IMPLEMENTATION PRIORITY ORDER

### Phase 1: Critical (Week 1)
1. **TypeScript Error Resolution** (Section 10.2) - Fix all compilation errors across packages
2. **Subscription Model Overhaul** (Section 3) - Implement new credit-based system with database changes
3. **Missing Usage Hooks Implementation** (Section 7.1) - Create real `useUsageStats` & `useUsageHistory` hooks
4. **Database Schema Updates** (Section 8.1) - Add new subscription tiers and lifetime tracking

### Phase 2: High Priority (Week 2)
5. **Complete Rebranding** (Section 1) - Verba → EmotifyAI across all files and documentation
6. **Domain Migration** (Section 2) - Update all URLs to single domain emotifyai.com architecture
7. **OAuth Google Testing** (Section 14) - Update Google Console and test complete auth flow
8. **Navbar Avatar Dropdown** (Section 4.1) - User menu with email/plan display and cursor-pointer
9. **Landing Page Conditional Content** (Section 4.2) - Show "Go to Dashboard" for authenticated users

### Phase 3: Medium Priority (Week 3)
10. **Pricing Page Enhancements** (Section 3.3) - Handle `?from=new_user` parameter and "Continue with Free Plan"
11. **Payment State Pages** (Section 4.4) - Success and cancel pages for Lemon Squeezy flows
12. **Success Connection Page** (Section 4.3) - Extension-backend connection confirmation
13. **Loading States** (Section 5.1) - All signin/signup buttons with proper loading UX
14. **Auth Sync Fallback** (Section 6.1) - Emergency auth generation when sync fails

### Phase 4: Low Priority (Week 4)
15. **Dashboard Refactoring** (Section 7.2) - Container/presentation separation with real data
16. **Extension Auth Navigation** (Section 5.2) - Create Account button navigation to web app
17. **UI Package Consolidation** (Section 9) - Centralized @emotifyai/ui component library
18. **Layout & Styling Overhaul** (Section 5.3) - Complete design system update for EmotifyAI brand
19. **Shopify Integration** (Section 11) - Add Shopify CLI and app configuration

### Phase 5: Ongoing (Throughout)
20. **Test Coverage** (Section 10.1) - Add tests for new hooks and components
21. **Code Cleanup** (Section 12) - Remove unused code, add ESLint to extension
22. **Token Caching** (Section 6.2) - Implement browser token caching for web app
23. **SQL Reference** (Section 8.1) - Create complete schema.sql and seed.sql files

---

## CONCLUSION

This document provides a comprehensive roadmap for completing the EmotifyAI platform. All issues from the TODO file have been analyzed, expanded with context from the codebase, and organized by priority. Each section includes specific file paths, implementation details, and code examples to guide development.