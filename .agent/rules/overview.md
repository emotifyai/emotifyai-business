---
trigger: always_on
---

# Verba Platform - Complete Project Overview

Verba is an **AI-powered text enhancement platform** that seamlessly integrates into users' workflows through a browser extension and web application. The platform enables instant rewriting, rephrasing, and text enhancement powered by Claude 3.5 Sonnet AI, with a focus on delivering high-quality results for English, Arabic, and French languages.

### Core Value Proposition
- **Seamless Integration**: Right-click context menu for instant text enhancement
- **Premium AI**: Claude 3.5 Sonnet for intelligent, context-aware rewriting
- **Multi-language**: Specialized support for English, Arabic, and French
- **Flexible Pricing**: Trial, monthly subscription, and lifetime license options
- **Security First**: No sensitive data or API keys stored client-side

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER LAYER                            │
│  ┌──────────────────┐              ┌──────────────────┐     │
│  │ Browser Extension│              │  Web Application │     │
│  │  (WXT + React)   │              │   (Next.js 16)   │     │
│  └────────┬─────────┘              └────────┬─────────┘     │
└───────────┼──────────────────────────────────┼──────────────┘
            │                                  │
            │         HTTPS (Authenticated)    │
            │                                  │
┌───────────┼──────────────────────────────────┼──────────────┐
│           │         BACKEND LAYER            │              │
│           └──────────────┬───────────────────┘              │
│                          │                                  │
│              ┌───────────▼───────────┐                      │
│              │   Next.js API Routes  │                      │
│              │  (Auth, Validation,   │                      │
│              │   Usage Enforcement)  │                      │
│              └───────────┬───────────┘                      │
│                          │                                  │
│         ┌────────────────┼────────────────┐                │
│         │                │                │                │
│    ┌────▼─────┐   ┌─────▼──────┐  ┌─────▼──────┐          │
│    │ Supabase │   │   Claude    │  │   Lemon    │          │
│    │   Auth   │   │ 3.5 Sonnet  │  │  Squeezy   │          │
│    │    DB    │   │     AI      │  │  Billing   │          │
│    └──────────┘   └─────────────┘  └────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### Monorepo Structure

```
emotifyai-monorepo/
├── apps/
│   ├── extension/              # Browser Extension (WXT)
│   │   ├── entrypoints/        # Extension entry points
│   │   │   └── popup/          # Popup UI (React app)
│   │   ├── services/           # API client services
│   │   │   └── api/            # HTTP client, auth, AI, subscription
│   │   ├── mocks/              # MSW mock API for development
│   │   ├── utils/              # Utilities (storage, logger, errors)
│   │   ├── types/              # TypeScript types
│   │   ├── schemas/            # Zod validation schemas
│   │   └── tests/              # Test files
│   │
│   └── web/                    # Web Application (Next.js 16)
│       ├── app/                # Next.js App Router
│       │   ├── (auth)/         # Auth pages (login, signup)
│       │   ├── (dashboard)/    # Protected dashboard pages
│       │   ├── api/            # API routes
│       │   │   ├── enhance/    # Text enhancement endpoint
│       │   │   └── webhooks/   # Lemon Squeezy webhooks
│       │   ├── layout.tsx      # Root layout
│       │   └── page.tsx        # Landing page
│       ├── components/         # React components
│       ├── lib/                # Utility libraries
│       │   ├── supabase/       # Supabase clients
│       │   ├── lemonsqueezy/   # Billing integration
│       │   ├── ai/             # AI service layer
│       │   └── subscription/   # Subscription logic
│       ├── types/              # TypeScript types
│       ├── supabase/           # Database migrations
│       └── __tests__/          # Test files
│
├── packages/                   # Shared packages (future)
│   └── (shared utilities, types, etc.)
│
├── assets/                     # Shared assets (logos, icons)
├── docs/                       # Documentation
│   ├── overview.md             # This file
│   └── rules.md                # Best practices
│
├── package.json                # Root package.json (workspaces)
├── tsconfig.json               # Root TypeScript config
└── bun.toml                    # Bun configuration
```

---

## Technology Stack

### Browser Extension

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | WXT 0.20.6 | Modern web extension framework |
| **UI Library** | React 19 | Component-based UI |
| **Language** | TypeScript 5 | Type-safe development |
| **Styling** | Tailwind CSS v4 | Utility-first CSS |
| **HTTP Client** | ky 1.7.3 | Lightweight fetch wrapper |
| **Validation** | Zod 3.24.1 | Runtime type checking |
| **State Management** | TanStack Query 5 | Data fetching & caching |
| **Testing** | Vitest 2.1.8 | Unit testing |
| **Mocking** | MSW 2.7.0 | API mocking |
| **Package Manager** | Bun 1.2.21+ | Fast runtime & package manager |

### Web Application

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | Next.js 16 | Full-stack React framework |
| **UI Library** | React 19 | Component-based UI |
| **Language** | TypeScript 5 | Type-safe development |
| **Styling** | Tailwind CSS v4 | Utility-first CSS |
| **Authentication** | Supabase Auth | OAuth & session management |
| **Database** | PostgreSQL (Supabase) | Relational database |
| **Billing** | Lemon Squeezy | Payment & subscriptions |
| **AI** | Claude 3.5 Sonnet | Text enhancement |
| **Data Fetching** | TanStack Query 5 | Server state management |
| **Validation** | Zod 3.23.8 | Schema validation |
| **Testing** | Vitest 2.1.8 | Unit testing |
| **Package Manager** | Bun 1.2.21+ | Fast runtime & package manager |

---

## Component Breakdown

### 1. Browser Extension

### 2. Web Application

#### Authentication System
**Technology**: Supabase Auth with @supabase/ssr

**Features**:
- OAuth providers (Google, GitHub)
- Cookie-based session management
- Middleware for route protection
- Automatic session refresh
- Row Level Security (RLS)

**Files**:
- `lib/supabase/client.ts`: Browser client
- `lib/supabase/server.ts`: Server-side client
- `middleware.ts`: Route protection

#### API Layer (`app/api/`)

##### `/api/enhance` - Text Enhancement Endpoint
**Method**: POST  
**Authentication**: Required (Supabase session or API key)

**Request Flow**:
1. Validate authentication (session or API key)
2. Check subscription status and usage limits
3. Detect language (if auto)
4. Call Claude 3.5 Sonnet with modular prompts
5. Validate output quality
6. Log usage to database
7. Return enhanced text

##### `/api/webhooks/lemonsqueezy` - Billing Webhooks
**Method**: POST  
**Authentication**: Signature verification

**Handles**:
- `subscription_created`: New subscription
- `subscription_updated`: Plan changes
- `subscription_cancelled`: Cancellations
- `subscription_resumed`: Reactivations
- `subscription_expired`: Expiration

**Actions**:
- Verifies webhook signature
- Updates database (subscriptions table)
- Syncs user subscription status
- Logs all events


**Security Features**:
- Row Level Security (RLS) enabled on all tables
- Policies enforce user-specific access
- Triggers for automatic timestamp updates
- Indexes for performance optimization

#### AI Service Layer (`lib/ai/`)

**Purpose**: Abstracted AI interface for text enhancement

**Features**:
- **Model Flexibility**: Easy to swap AI providers (Claude, OpenAI, Gemini)
- **Modular Prompts**: Extensible prompt architecture
- **Language Detection**: Automatic language identification
- **Quality Validation**: Ensures high-quality outputs
- **Error Handling**: Graceful degradation

**Supported Languages**:
- **English (en)**: Full support, highest quality
- **Arabic (ar)**: Full support, RTL-aware
- **French (fr)**: Full support
- **Others**: Attempted with quality validation; returns error if low quality

#### Subscription Service (`lib/subscription/`)

**Purpose**: Manages subscription logic and usage limits

**Features**:
- Trial period management (10 actions)
- Monthly subscription (unlimited)
- Lifetime license (unlimited)
- Usage tracking and enforcement
- Subscription status checks

**Usage Limits**:
```typescript
{
  trial: 10 actions,
  monthly: unlimited,
  lifetime: unlimited
}
```

---

## Data Flow

### Text Enhancement Flow (Extension → Backend → AI)

```
1. USER INTERACTION
   ├─ User selects text on webpage
   ├─ Right-clicks → "Enhance with Verba"
   └─ Or presses Ctrl+Shift+E

2. CONTENT SCRIPT
   ├─ Captures selected text
   ├─ Sends message to background script
   └─ Shows loading indicator

3. BACKGROUND SCRIPT
   ├─ Receives enhancement request
   ├─ Checks authentication (chrome.storage)
   ├─ Checks usage limits (API call)
   └─ Calls /api/enhance endpoint

4. BACKEND API (/api/enhance)
   ├─ Validates authentication (Supabase session/API key)
   ├─ Checks subscription status (database query)
   ├─ Enforces usage limits (trial: 10, others: unlimited)
   ├─ Detects language (if auto)
   ├─ Calls Claude 3.5 Sonnet API
   ├─ Validates output quality
   ├─ Logs usage to database
   └─ Returns enhanced text

5. BACKGROUND SCRIPT
   ├─ Receives enhanced text
   ├─ Increments local usage counter
   └─ Sends to content script

6. CONTENT SCRIPT
   ├─ Replaces selected text in DOM
   ├─ Saves to undo stack
   ├─ Shows success notification
   └─ Positions cursor after new text

7. USER FEEDBACK
   ├─ Enhanced text appears in page
   ├─ Success notification shown
   └─ Undo button available
```

### Authentication Flow

```
1. EXTENSION POPUP
   ├─ User clicks "Login with Google"
   └─ Opens web app OAuth page in new tab

2. WEB APP OAUTH
   ├─ User authenticates with provider
   ├─ Supabase creates session
   ├─ Generates API key for extension
   └─ Redirects to success page with key

3. EXTENSION
   ├─ Detects successful auth (message listener)
   ├─ Stores API key in chrome.storage.local
   ├─ Fetches user profile
   ├─ Updates popup UI
   └─ Enables context menu

4. SUBSEQUENT REQUESTS
   ├─ Extension includes API key in headers
   ├─ Backend validates key against database
   ├─ Loads user profile and subscription
   └─ Processes request
```

### Subscription Webhook Flow

```
1. USER SUBSCRIBES
   ├─ User clicks "Subscribe" in web app
   ├─ Redirected to Lemon Squeezy checkout
   └─ Completes payment

2. LEMON SQUEEZY
   ├─ Processes payment
   ├─ Creates subscription
   └─ Sends webhook to /api/webhooks/lemonsqueezy

3. WEBHOOK HANDLER
   ├─ Verifies signature (HMAC-SHA256)
   ├─ Parses event data
   ├─ Updates subscriptions table
   ├─ Updates user profile
   └─ Returns 200 OK

4. USER EXPERIENCE
   ├─ Subscription status updated in database
   ├─ Usage limits immediately updated
   ├─ Extension reflects new tier
   └─ Dashboard shows subscription details
```