# Requirements Document

READ #IMPLEMENTATION_REQUIREMENTS.MD file

## Introduction

This document outlines the comprehensive requirements for transforming the Verba platform into EmotifyAI, including complete rebranding, subscription model overhaul, user experience improvements, and production readiness enhancements. The transformation encompasses a browser extension, web application, and supporting infrastructure across a monorepo architecture.

## Glossary

- **EmotifyAI**: The new brand name for the AI-powered text enhancement platform (formerly Verba)
- **Extension**: Browser extension component that integrates with web pages for text enhancement
- **Web_App**: Next.js web application providing dashboard, authentication, and subscription management
- **Credit_System**: New usage-based billing model where users consume credits for text enhancements
- **Lifetime_Offer**: Limited-time subscription tier with 500 subscriber limit and monthly credit renewal
- **Single_Domain_Architecture**: Unified domain structure using emotifyai.com for both web app and API endpoints
- **Container_Component**: React component responsible for data fetching and state management
- **Presentation_Component**: Pure UI component that receives data via props for rendering
- **Auth_Sync**: Process of synchronizing authentication tokens between extension and web application
- **Usage_Hook**: React hook for fetching and managing user usage statistics and history data

## Requirements

### Requirement 1

**User Story:** As a platform administrator, I want to rebrand the entire platform from Verba to EmotifyAI, so that the new brand identity is consistently applied across all touchpoints.

#### Acceptance Criteria

1. WHEN the system displays any user-facing content THEN it SHALL use "EmotifyAI" instead of "Verba" in all text, titles, and descriptions
2. WHEN the system references URLs THEN it SHALL use "emotifyai.com" instead of "verba.app" in all configurations and documentation
3. WHEN the system displays package names THEN it SHALL use "@emotifyai/ui" instead of "@verba/ui" for the shared UI package
4. WHEN the system sends emails THEN it SHALL use EmotifyAI email addresses instead of Verba email addresses
5. WHEN the system displays metadata THEN it SHALL show EmotifyAI branding in page titles, descriptions, and social media tags

### Requirement 2

**User Story:** As a platform administrator, I want to migrate from multiple subdomains to a single domain architecture, so that the platform has a unified web presence and simplified configuration.

#### Acceptance Criteria

1. WHEN the system serves the web application THEN it SHALL use "https://emotifyai.com" as the primary domain
2. WHEN the system provides API endpoints THEN it SHALL serve them at "https://emotifyai.com/api" routes
3. WHEN the extension communicates with the backend THEN it SHALL use "https://emotifyai.com/api" as the base URL
4. WHEN external services redirect users THEN they SHALL use "https://emotifyai.com" callback URLs
5. WHEN the system configures CORS policies THEN it SHALL allow requests from the emotifyai.com domain

### Requirement 3

**User Story:** As a business stakeholder, I want to implement a new credit-based subscription model with multiple tiers, so that we can offer flexible pricing options and track usage accurately.

#### Acceptance Criteria

1. WHEN a new user signs up THEN the system SHALL provide a Free Plan with 50 generation credits valid for 10 days
2. WHEN a user subscribes to the Lifetime Launch Offer THEN the system SHALL provide 500 credits per month for a one-time payment of $97 USD
3. WHEN a user subscribes to Basic Monthly THEN the system SHALL provide 350 credits per month for $17 USD monthly
4. WHEN a user subscribes to Pro Monthly THEN the system SHALL provide 700 credits per month for $37 USD monthly
5. WHEN a user subscribes to Business Monthly THEN the system SHALL provide 1500 credits per month for $57 USD monthly
6. WHEN a user subscribes to annual plans THEN the system SHALL provide 25% discount on monthly pricing
7. WHEN the Lifetime Launch Offer is active THEN the system SHALL limit it to the first 500 subscribers only
8. WHEN a user consumes credits THEN the system SHALL track usage and prevent exceeding the plan limit

### Requirement 4

**User Story:** As a user, I want to see real-time information about the Lifetime Launch Offer availability, so that I can make an informed decision about purchasing before it sells out.

#### Acceptance Criteria

1. WHEN the pricing page displays the Lifetime Launch Offer THEN it SHALL show the current number of subscribers out of 500
2. WHEN the pricing page displays the Lifetime Launch Offer THEN it SHALL show the remaining number of available spots
3. WHEN fewer than 50 lifetime spots remain THEN the system SHALL display urgency messaging
4. WHEN the lifetime counter updates THEN it SHALL refresh every 30 seconds or on page load
5. WHEN 500 lifetime subscribers are reached THEN the system SHALL hide the Lifetime Launch Offer from the pricing page

### Requirement 5

**User Story:** As an authenticated user, I want to see a personalized navigation experience with my account information, so that I can easily access my dashboard and account settings.

#### Acceptance Criteria

1. WHEN a user is authenticated THEN the navbar SHALL display an avatar dropdown instead of login/signup buttons
2. WHEN a user clicks the avatar dropdown THEN it SHALL show user email, current plan, Dashboard link, and Logout option
3. WHEN a user hovers over interactive elements THEN the system SHALL apply cursor-pointer styling
4. WHEN the dropdown opens or closes THEN it SHALL use smooth animation transitions
5. WHEN a user is not authenticated THEN the navbar SHALL display login and signup buttons

### Requirement 6

**User Story:** As an authenticated user, I want to see personalized content on the landing page, so that the experience is relevant to my current status.

#### Acceptance Criteria

1. WHEN an authenticated user visits the landing page THEN it SHALL display "Go to Dashboard" instead of "Get Started"
2. WHEN an authenticated user views the hero section THEN it SHALL show personalized messaging based on their subscription status
3. WHEN the system loads user authentication state THEN it SHALL handle loading states appropriately
4. WHEN an unauthenticated user visits the landing page THEN it SHALL display the standard "Get Started" call-to-action
5. WHEN the system determines authentication status THEN it SHALL render the appropriate content without flickering

### Requirement 7

**User Story:** As a user completing payment flows, I want clear confirmation and guidance pages, so that I understand the status of my transaction and know what to do next.

#### Acceptance Criteria

1. WHEN a user completes a successful payment THEN the system SHALL display a payment success page with order confirmation
2. WHEN a user cancels a payment THEN the system SHALL display a payment cancel page with retry options
3. WHEN a user successfully connects the extension to the backend THEN the system SHALL display a success connection page
4. WHEN the success connection page loads THEN it SHALL include instructions to close the page
5. WHEN payment status changes THEN the system SHALL update the user's subscription data accordingly

### Requirement 8

**User Story:** As a user interacting with forms and buttons, I want to see loading states during processing, so that I know the system is working and don't accidentally submit multiple times.

#### Acceptance Criteria

1. WHEN a user submits a login form THEN the login button SHALL show a loading state and be disabled during processing
2. WHEN a user submits a signup form THEN the signup button SHALL show a loading state and be disabled during processing
3. WHEN a user clicks OAuth buttons THEN they SHALL show loading states and prevent multiple clicks
4. WHEN a user performs dashboard actions THEN action buttons SHALL show loading states during API calls
5. WHEN loading states are active THEN the system SHALL display spinners or loading text appropriately

### Requirement 9

**User Story:** As a user, I want the extension authentication to guide me to account creation, so that I can easily set up my account when needed.

#### Acceptance Criteria

1. WHEN a user is not signed in to the extension THEN it SHALL display a "Create Account" button
2. WHEN a user clicks "Create Account" THEN it SHALL open the web app signup page in a new tab
3. WHEN the extension opens the web app THEN it SHALL include source=extension parameter for tracking
4. WHEN a user completes account creation THEN the auth token SHALL sync back to the extension
5. WHEN Google OAuth flow detects a new user THEN it SHALL redirect to the signup page

### Requirement 10

**User Story:** As a user, I want to access my usage statistics and history, so that I can monitor my credit consumption and enhancement activity.

#### Acceptance Criteria

1. WHEN a user requests usage statistics THEN the system SHALL provide total enhancements, credits used, credits remaining, and reset date
2. WHEN a user requests usage statistics THEN the system SHALL provide daily, weekly, and monthly usage breakdowns
3. WHEN a user requests usage history THEN the system SHALL provide a list of recent enhancement activities with details
4. WHEN usage data updates THEN the system SHALL refresh the information every 30 seconds
5. WHEN a user is not authenticated THEN usage requests SHALL return appropriate error responses

### Requirement 11

**User Story:** As a developer, I want dashboard pages to follow proper architectural patterns, so that the codebase is maintainable and follows separation of concerns.

#### Acceptance Criteria

1. WHEN dashboard pages are implemented THEN they SHALL separate container components from presentation components
2. WHEN container components are created THEN they SHALL handle data fetching and state management only
3. WHEN presentation components are created THEN they SHALL receive data via props and handle UI rendering only
4. WHEN components handle loading states THEN they SHALL display appropriate loading skeletons or indicators
5. WHEN components handle errors THEN they SHALL display user-friendly error messages with retry options

### Requirement 12

**User Story:** As a platform administrator, I want a complete database schema with proper migrations, so that the new subscription model and features are properly supported.

#### Acceptance Criteria

1. WHEN the database schema is updated THEN it SHALL include new subscription tier columns and credit tracking fields
2. WHEN the lifetime subscriber tracking is implemented THEN it SHALL include a dedicated table with subscriber count functions
3. WHEN database migrations are created THEN they SHALL be reversible and include proper constraints
4. WHEN the schema is documented THEN it SHALL include a complete SQL reference file with relationships and indexes
5. WHEN seed data is provided THEN it SHALL include examples for all subscription tiers and test scenarios

### Requirement 13

**User Story:** As a user navigating the pricing page with specific parameters, I want contextual button text and behavior, so that the flow matches my entry point.

#### Acceptance Criteria

1. WHEN a user visits the pricing page with "from=new_user" parameter THEN the Free Plan button SHALL display "Continue with Free Plan"
2. WHEN a user clicks "Continue with Free Plan" THEN the system SHALL navigate to the dashboard
3. WHEN a user visits the pricing page without parameters THEN buttons SHALL display standard text
4. WHEN URL parameters are parsed THEN the system SHALL handle them without errors
5. WHEN conditional rendering occurs THEN it SHALL not cause layout shifts or flickering

### Requirement 14

**User Story:** As a platform administrator, I want proper authentication fallback mechanisms, so that users can continue using the service even when auth sync fails.

#### Acceptance Criteria

1. WHEN auth sync fails between backend and frontend THEN the system SHALL provide a fallback auth generation page
2. WHEN the fallback page is accessed THEN it SHALL generate temporary auth tokens for continued service access
3. WHEN auth sync failures occur THEN the system SHALL log them for debugging purposes
4. WHEN fallback auth is used THEN it SHALL implement retry logic before showing the fallback option
5. WHEN emergency tokens are generated THEN they SHALL have appropriate expiration and security measures

### Requirement 15

**User Story:** As a user, I want auth tokens cached in my browser, so that I don't have to re-authenticate frequently and have a smooth experience across tabs.

#### Acceptance Criteria

1. WHEN a user authenticates THEN the web app SHALL cache tokens in localStorage or sessionStorage
2. WHEN tokens are cached THEN the system SHALL implement automatic token refresh logic
3. WHEN tokens expire THEN the system SHALL handle expiration gracefully with re-authentication prompts
4. WHEN multiple tabs are open THEN tokens SHALL sync across all tabs
5. WHEN a user logs out THEN all cached tokens SHALL be cleared from browser storage

### Requirement 16

**User Story:** As a developer, I want a centralized UI component library, so that design consistency is maintained and code duplication is reduced.

#### Acceptance Criteria

1. WHEN shared components are needed THEN they SHALL be centralized in the @emotifyai/ui package
2. WHEN web and extension apps use UI components THEN they SHALL import from the shared package
3. WHEN theming is applied THEN it SHALL be consistent across all packages using the shared components
4. WHEN component APIs are defined THEN they SHALL be documented for consistent usage
5. WHEN components are updated THEN changes SHALL propagate to all consuming applications

### Requirement 17

**User Story:** As a developer, I want comprehensive test coverage, so that the platform is reliable and regressions are caught early.

#### Acceptance Criteria

1. WHEN new hooks are implemented THEN they SHALL have corresponding unit tests with proper mocking
2. WHEN API endpoints are created or updated THEN they SHALL have integration tests covering success and error scenarios
3. WHEN subscription validation logic is implemented THEN it SHALL have comprehensive test coverage
4. WHEN authentication flows are implemented THEN they SHALL have end-to-end tests
5. WHEN tests are run THEN they SHALL pass consistently and provide meaningful coverage reports

### Requirement 18

**User Story:** As a developer, I want the codebase to be free of TypeScript errors, so that type safety is maintained and development experience is optimal.

#### Acceptance Criteria

1. WHEN TypeScript compilation runs THEN it SHALL complete without errors across all packages
2. WHEN strict type checking is enabled THEN all code SHALL comply with strict mode requirements
3. WHEN any types are used THEN they SHALL be replaced with proper type definitions
4. WHEN imports and exports are used THEN they SHALL have correct type annotations
5. WHEN environment variables are accessed THEN they SHALL have proper type validation

### Requirement 19

**User Story:** As a platform administrator, I want OAuth integration properly configured and tested, so that users can authenticate reliably with Google.

#### Acceptance Criteria

1. WHEN Google Console is configured THEN it SHALL include all emotifyai.com redirect URIs
2. WHEN OAuth flow is initiated THEN it SHALL work correctly from both web app and extension
3. WHEN OAuth completes successfully THEN tokens SHALL sync properly between platforms
4. WHEN OAuth encounters errors THEN the system SHALL handle denied permissions and network failures gracefully
5. WHEN users log out THEN the logout SHALL work across both web app and extension platforms

### Requirement 20

**User Story:** As a platform administrator, I want the system ready for production deployment, so that it can serve users reliably at scale.

#### Acceptance Criteria

1. WHEN production environment variables are configured THEN they SHALL use correct emotifyai.com URLs and valid API keys
2. WHEN external services are configured THEN Supabase, Lemon Squeezy, and Google OAuth SHALL use production settings
3. WHEN DNS and SSL are configured THEN emotifyai.com SHALL resolve correctly with valid certificates
4. WHEN monitoring is implemented THEN error tracking and performance monitoring SHALL be active
5. WHEN deployment occurs THEN both web app and browser extensions SHALL be published to their respective platforms