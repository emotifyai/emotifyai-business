# Implementation Plan

- [x] 1. Branding and Domain Migration





- [x] 1.1 Complete Rebranding: Verba → EmotifyAI


  - Update all "Verba" references to "EmotifyAI" across codebase
  - Update package.json name, author, repository URL in root and packages
  - Update README.md, CONTRIBUTING.md, and all documentation files
  - Update email addresses from verba.app to emotifyai.com domain
  - Update metadata titles in web app pages
  - Update extension popup welcome text and branding
  - Update mock data email domains
  - _Requirements: 1.1, 1.3, 1.4, 1.5_



- [x] 1.2 Domain Migration: verba.app → emotifyai.com
  - Update all environment variable examples and production configs
  - Update host_permissions in extension wxt.config.ts
  - Update API base URLs and web app URLs
  - Update OAuth redirect URIs and webhook endpoints
  - Update documentation with new domain structure
  - Update footer contact emails and privacy/terms page emails


  - _Requirements: 1.2, 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 1.3 Update Shared UI Package Branding
  - Update package name from @verba/ui to @emotifyai/ui
  - Update imports in web and extension to use @emotifyai/ui
  - Ensure consistent theming across packages
  - Document component APIs
  - _Requirements: 16.1, 16.2, 16.3, 16.5_

- [x] 2. Subscription Model and Database





- [x] 2.1 Database Schema Updates for New Subscription Model


  - Create migration to add new subscription tier columns (tier, credits_limit, credits_used, credits_reset_date, validity_days)
  - Create lifetime_subscribers tracking table with subscriber_number and functions
  - Add get_lifetime_subscriber_count() and get_remaining_lifetime_slots() database functions
  - Update subscription validation logic for credit-based system
  - _Requirements: 3.1, 3.2, 3.7, 12.1, 12.2, 12.3_

- [x] 2.2 Update Subscription Types and Configuration


  - Update subscription types to match new credit-based model
  - Add Free Plan (50 credits, 10-day validity)
  - Update Lifetime Launch Offer (500 credits/month, $97, limited to 500 subscribers)
  - Add Basic Monthly (350 credits, $17), Pro Monthly (700 credits, $37), Business Monthly (1500 credits, $57)
  - Add Annual plans with 25% discount
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 2.3 Implement Lifetime Counter API and Component


  - Create /api/subscription/lifetime-slots endpoint
  - Implement real-time lifetime subscriber counter
  - Add LifetimeSlotCounter component with 30-second refresh
  - Show urgency messaging when < 50 spots remain
  - Hide offer when 500 subscribers reached
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_



- [ ] 2.4 Redesign Pricing Page with New Subscription Model
  - Implement new pricing page layout with 6 tiers
  - Add lifetime counter display with real-time updates
  - Handle ?from=new_user parameter for "Continue with Free Plan" button
  - Add conditional button text and navigation logic
  - Show annual savings and popular badges


  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 13.1, 13.2, 13.3, 13.4, 13.5_

- [-] 2.5 Create Complete Database Schema Documentation

  - Create apps/web/supabase/schema.sql with complete schema
  - Document all tables, indexes, RLS policies, and functions


  - Create seed data file with examples for all subscription tiers
  - Include migration history and relationship documentation
  - _Requirements: 12.4, 12.5_

- [ ] 3. User Experience and Navigation


- [ ] 3.1 Implement Navbar Avatar Dropdown for Authenticated Users
  - Create NavbarUserMenu component with avatar dropdown
  - Show user email and current subscription plan in dropdown
  - Add Dashboard link and Logout option
  - Add cursor-pointer styling and smooth animations
  - Update header.tsx to conditionally render for authenticated users
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 3.2 Landing Page Conditional Content
  - Update landing page to show "Go to Dashboard" for authenticated users
  - Add personalized hero section messaging based on subscription status
  - Handle loading states without flickering
  - Maintain standard "Get Started" for unauthenticated users
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 3.3 Add Loading States to All Forms and Buttons
  - Add loading states to login form submit button
  - Add loading states to signup form submit button
  - Add loading states to OAuth buttons (Google, GitHub)
  - Add loading states to dashboard action buttons
  - Show loading states during API calls in dashboard components
  - Disable forms during submission to prevent multiple clicks
  - Show appropriate spinners and loading text
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 3.4 Create Payment and Connection Flow Pages
  - Create payment success page with order confirmation
  - Create payment cancel page with retry options
  - Create success connection page for extension-backend linking
  - Handle Lemon Squeezy redirects and update subscription data
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 3.5 Extension Authentication Flow Improvements
  - Add "Create Account" button for unauthenticated extension users
  - Implement navigation to web app signup with source=extension parameter
  - Update Google OAuth flow to redirect new users to signup page
  - Ensure auth token sync after account creation
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

## 4. Data Management and Architecture

- [ ] 4.1 Implement Real Usage Hooks
  - Replace placeholder useUsageStats hook with real implementation
  - Add useUsageHistory hook for enhancement activity tracking
  - Implement 30-second refresh interval for usage data
  - Add proper error handling and loading states
  - Connect to Supabase usage_logs table
  - Handle unauthenticated usage requests with appropriate errors
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 4.2 Dashboard Pages Refactoring (Container/Presentation Pattern)
  - Refactor dashboard page to separate container and presentation components
  - Create DashboardView presentation component
  - Refactor usage page with UsageView presentation component
  - Refactor settings page with SettingsView presentation component
  - Implement proper loading skeletons and error displays
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 4.3 Implement Browser Token Caching
  - Add token caching in localStorage/sessionStorage for web app
  - Implement automatic token refresh logic
  - Handle token expiration with re-authentication prompts
  - Sync tokens across multiple browser tabs
  - Clear all tokens on logout
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 4.4 Implement Auth Sync Fallback Mechanism
  - Create fallback auth generation page for sync failures
  - Add /api/auth/generate-fallback endpoint for emergency tokens
  - Implement retry logic before showing fallback option
  - Add proper error logging for debugging auth sync issues
  - Implement appropriate token expiration and security measures
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

## 5. Testing and Code Quality

- [ ] 5.1 Fix TypeScript Compilation Errors
  - Fix TypeScript compilation errors across all packages
  - Enable strict type checking compliance
  - Replace any types with proper type definitions
  - Add correct type annotations to imports and exports
  - Add proper type validation for environment variables
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_

- [ ] 5.2 Add Comprehensive Test Coverage
  - Add unit tests for new usage hooks with proper mocking
  - Add integration tests for API endpoints covering success and error scenarios
  - Add comprehensive test coverage for subscription validation logic
  - Add end-to-end tests for authentication flows
  - Ensure tests pass consistently and provide meaningful coverage reports
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

- [ ] 5.3 Code Quality Improvements
  - Add ESLint configuration to extension package
  - Remove unused code (Toast.tsx component, unused functions)
  - Clean up unused imports and functions
  - Ensure consistent code style across packages
  - Document component APIs for shared components
  - _Requirements: 16.4_

- [ ]* 5.4 Write Property Tests for Branding and Domain (Properties 1-7)
  - **Property 1: Consistent EmotifyAI branding**
  - **Property 2: Unified domain usage**
  - **Property 3: Package naming consistency**
  - **Property 4: Email address consistency**
  - **Property 5: Metadata branding consistency**
  - **Property 6: API endpoint consistency**
  - **Property 7: External service callback consistency**
  - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 2.2, 2.4**

- [ ]* 5.5 Write Property Tests for Subscription Model (Properties 8-18)
  - **Property 8: New user credit allocation**
  - **Property 9: Lifetime subscription credit allocation**
  - **Property 10: Basic monthly subscription credit allocation**
  - **Property 11: Pro monthly subscription credit allocation**
  - **Property 12: Business monthly subscription credit allocation**
  - **Property 13: Annual plan discount consistency**
  - **Property 14: Lifetime offer subscriber limit**
  - **Property 15: Credit usage tracking and limits**
  - **Property 16: Lifetime subscriber count display**
  - **Property 17: Remaining lifetime spots display**
  - **Property 18: Lifetime counter refresh behavior**
  - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 4.1, 4.2, 4.4**

- [ ]* 5.6 Write Property Tests for Navigation and User Experience (Properties 19-28)
  - **Property 19: Authenticated user navbar state**
  - **Property 20: Avatar dropdown content**
  - **Property 21: Interactive element styling**
  - **Property 22: Dropdown animation behavior**
  - **Property 23: Unauthenticated user navbar state**
  - **Property 24: Authenticated user landing page content**
  - **Property 25: Personalized hero section messaging**
  - **Property 26: Authentication loading state handling**
  - **Property 27: Unauthenticated user landing page content**
  - **Property 28: Content rendering without flickering**
  - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5**

- [ ]* 5.7 Write Property Tests for Loading States and Forms (Properties 29-34)
  - **Property 29: Subscription data synchronization**
  - **Property 30: Login form loading state**
  - **Property 31: Signup form loading state**
  - **Property 32: OAuth button loading state**
  - **Property 33: Dashboard action loading state**
  - **Property 34: Loading UI consistency**
  - **Validates: Requirements 7.5, 8.1, 8.2, 8.3, 8.4, 8.5**

- [ ]* 5.8 Write Property Tests for Extension Authentication (Properties 35-39)
  - **Property 35: Extension unauthenticated state**
  - **Property 36: Extension account creation navigation**
  - **Property 37: Extension tracking parameter**
  - **Property 38: Auth token synchronization**
  - **Property 39: OAuth new user redirect**
  - **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5**

- [ ]* 5.9 Write Property Tests for Usage Statistics and Data (Properties 40-49)
  - **Property 40: Usage statistics completeness**
  - **Property 41: Usage breakdown data**
  - **Property 42: Usage history details**
  - **Property 43: Usage data refresh interval**
  - **Property 44: Unauthenticated usage request handling**
  - **Property 45: Loading state display**
  - **Property 46: Error message display**
  - **Property 47: Database migration reversibility**
  - **Property 48: URL parameter parsing robustness**
  - **Property 49: Conditional rendering stability**
  - **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 11.4, 11.5, 12.3, 13.4, 13.5**

- [ ]* 5.10 Write Property Tests for Authentication and Token Management (Properties 50-57)
  - **Property 50: Auth sync failure logging**
  - **Property 51: Auth sync retry behavior**
  - **Property 52: Emergency token security**
  - **Property 53: Token caching behavior**
  - **Property 54: Automatic token refresh**
  - **Property 55: Token expiration handling**
  - **Property 56: Cross-tab token synchronization**
  - **Property 57: Logout token cleanup**
  - **Validates: Requirements 14.3, 14.4, 14.5, 15.1, 15.2, 15.3, 15.4, 15.5**

- [ ]* 5.11 Write Property Tests for Shared Components and Code Quality (Properties 58-66)
  - **Property 58: Shared component centralization**
  - **Property 59: Shared component import consistency**
  - **Property 60: Theme consistency across packages**
  - **Property 61: Component update propagation**
  - **Property 62: TypeScript compilation success**
  - **Property 63: Strict type checking compliance**
  - **Property 64: Proper type definitions**
  - **Property 65: Import/export type annotations**
  - **Property 66: Environment variable type validation**
  - **Validates: Requirements 16.1, 16.2, 16.3, 16.5, 18.1, 18.2, 18.3, 18.4, 18.5**

- [ ]* 5.12 Write Property Tests for OAuth Integration (Properties 67-70)
  - **Property 67: OAuth cross-platform functionality**
  - **Property 68: OAuth token synchronization**
  - **Property 69: OAuth error handling**
  - **Property 70: Cross-platform logout**
  - **Validates: Requirements 19.2, 19.3, 19.4, 19.5**

## 6. Production Deployment and Configuration

- [ ] 6.1 OAuth Google Configuration and Testing
  - Update Google Console with emotifyai.com redirect URIs
  - Test complete OAuth flow from extension to web app
  - Verify token sync between platforms
  - Test error scenarios (denied permissions, network failures)
  - Ensure cross-platform logout functionality
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_

- [ ] 6.2 Production Environment Configuration
  - Update all production environment variables with emotifyai.com URLs
  - Configure external services (Supabase, Lemon Squeezy, Google OAuth) for production
  - Set up DNS and SSL certificates for emotifyai.com
  - Configure monitoring and error tracking
  - _Requirements: 20.1, 20.2, 20.3, 20.4_

- [ ] 6.3 Final Testing and Deployment
  - Run comprehensive test suite across all packages
  - Test complete user workflows end-to-end
  - Deploy web app to production
  - Submit extension to Chrome Web Store and Firefox Add-ons
  - Verify all external integrations work in production
  - _Requirements: 20.5_

## Checkpoint Tasks

- [ ] 7.1 Mid-Implementation Checkpoint
  - Ensure all tests pass, ask the user if questions arise

- [ ] 7.2 Pre-Production Checkpoint  
  - Ensure all tests pass, ask the user if questions arise

- [ ] 7.3 Final Deployment Checkpoint
  - Ensure all tests pass, ask the user if questions arise