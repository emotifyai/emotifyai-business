# EmotifyAI - AI-Powered Text Enhancement Platform

EmotifyAI is a comprehensive AI-powered text enhancement platform consisting of a cross-browser extension and a full-featured web application. The system delivers intelligent text rewriting, rephrasing, and enhancement powered by Claude 3.5 Sonnet, with support for English, Arabic, and French languages.

## 🏗️ Architecture

This is a **monorepo** managed with **Bun workspaces**, containing two main applications:

```
emotifyai-monorepo/
├── apps/
│   ├── extension/          # Browser extension (WXT + React + TypeScript)
│   └── web/                # Web application (Next.js 16 + React)
├── packages/               # Shared packages (future)
├── assets/                 # Shared assets
└── docs/                   # Documentation
```

## 📦 Applications

### Browser Extension (`apps/extension`)
A cross-browser extension built with WXT, React, and TypeScript that provides:
- **Context Menu Integration**: Right-click to enhance selected text
- **Keyboard Shortcuts**: Quick enhancement with Ctrl+Shift+E
- **Popup Interface**: User dashboard and settings
- **Multi-language Support**: English, Arabic, French
- **Secure Architecture**: No API keys in client code
- **Mock API**: Full development without backend dependency

**Tech Stack**: WXT, React 19, TypeScript, Tailwind CSS v4, Vitest, MSW

[📖 Extension Documentation](./apps/extension/README.md)

### Web Application (`apps/web`)
A Next.js 16 web platform that provides:
- **OAuth Authentication**: Secure user authentication via Supabase
- **Subscription Management**: Trial, Monthly, and Lifetime plans via Lemon Squeezy
- **User Dashboard**: Usage analytics and subscription management
- **API Layer**: Centralized API for extension and web requests
- **AI Integration**: Claude 3.5 Sonnet for text enhancement

**Tech Stack**: Next.js 16, React 19, Supabase, Lemon Squeezy, Anthropic Claude, Tailwind CSS v4

[📖 Web App Documentation](./apps/web/README.md)

## 🚀 Quick Start

### Prerequisites

- **Bun** v1.2.21 or later ([Install Bun](https://bun.sh))
- **Node.js** 20+ (for compatibility)

### Development

#### Run Both Applications Concurrently

```bash
# Start both extension and web app in development mode
# Web App: http://localhost:3000
# Extension: http://localhost:4250
bun dev

# Build both applications
bun build
```

#### Run Individual Applications

```bash
# Extension only (Chrome)
bun dev:extension

# Extension only (Firefox)
bun dev:extension:firefox

# Web app only
bun dev:web

# Build extension only
bun build:extension

# Build web app only
bun build:web
```

### Testing

```bash
# Run tests for all packages
bun test

# Run tests for extension only
bun test:extension

# Run tests for web app only
bun test:web

# Run tests with coverage
bun test:coverage
```

## 🎯 Product Features

### Core Functionality
- **AI Text Enhancement**: Intelligent rewriting and rephrasing
- **Multi-language Support**: English, Arabic, French (with quality validation)
- **Context-Aware**: Preserves meaning while improving clarity
- **Real-time Processing**: Fast AI-powered transformations

### Subscription Tiers
1. **Trial**: ~10 enhancement actions for new users
2. **Monthly**: Recurring subscription with unlimited access
3. **Lifetime**: One-time payment for permanent access

### Security & Privacy
- **No Client-Side Secrets**: All API keys stored securely on backend
- **Token-Based Authentication**: JWT tokens for secure sessions
- **Row Level Security**: Database-level access control
- **Webhook Verification**: Secure payment processing

## 🛠️ Development Workflow

### Monorepo Structure

This project uses **Bun workspaces** for efficient dependency management:

```json
{
  "workspaces": ["apps/*", "packages/*"]
}
```

Benefits:
- **Shared Dependencies**: Common packages hoisted to root
- **Fast Installs**: Bun's speed optimizes monorepo workflows
- **Consistent Versions**: Centralized dependency management
- **Easy Cross-Package Development**: Link local packages seamlessly

### Scripts Overview

| Command | Description |
|---------|-------------|
| `bun install` | Install all dependencies |
| `bun dev` | Run both apps concurrently |
| `bun dev:extension` | Run extension only (Chrome) |
| `bun dev:extension:firefox` | Run extension only (Firefox) |
| `bun dev:web` | Run web app only |
| `bun build` | Build both apps |
| `bun build:extension` | Build extension only |
| `bun build:web` | Build web app only |
| `bun test` | Run all tests |
| `bun test:extension` | Test extension only |
| `bun test:web` | Test web app only |
| `bun lint` | Lint all packages |
| `bun typecheck` | Type check all packages |

## 📚 Documentation

- **[Project Overview](./docs/overview.md)**: Comprehensive project documentation
- **[Best Practices](./docs/rules.md)**: Development guidelines and standards
- **[Extension README](./apps/extension/README.md)**: Extension-specific documentation
- **[Web App README](./apps/web/README.md)**: Web app-specific documentation
- **[Web App Progress](./apps/web/PROGRESS.md)**: Current implementation status

## 🏗️ Technology Stack

### Frontend
- **React 19**: Latest React with concurrent features
- **TypeScript 5**: Type-safe development
- **Tailwind CSS v4**: Modern utility-first styling
- **TanStack Query**: Powerful data fetching and caching

### Extension Framework
- **WXT**: Modern web extension framework
- **Manifest V3**: Latest extension standard (Chrome/Edge)
- **Manifest V2**: Firefox compatibility

### Backend & Services
- **Next.js 16**: Full-stack React framework with App Router
- **Supabase**: PostgreSQL database with authentication
- **Lemon Squeezy**: Payment and subscription management
- **Anthropic Claude 3.5 Sonnet**: AI text enhancement

### Development Tools
- **Bun**: Fast JavaScript runtime and package manager
- **Vitest**: Lightning-fast unit testing
- **MSW**: API mocking for development and testing
- **ESLint**: Code linting
- **Prettier**: Code formatting

## 🔒 Environment Variables

### Extension (`.env`)
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_MOCK_API_ENABLED=true
VITE_OAUTH_CLIENT_ID=your_client_id
VITE_WEB_APP_URL=http://localhost:3000
VITE_EXTENSION_ID=your_extension_id
VITE_LOG_LEVEL=debug
```

### Web App (`.env.local`)
See `apps/web/.env.local.example` for complete configuration.

## 🚢 Deployment

### Extension
```bash
# Build for Chrome
cd apps/extension
bun run build
bun run zip

# Build for Firefox
bun run build:firefox
bun run zip:firefox
```

Distribution files will be in `.output/` directory.

### Web Application
```bash
# Build for production
cd apps/web
bun run build

# Start production server
bun start
```

**Recommended Platform**: Vercel (automatic deployment with GitHub integration)

### Development Guidelines

- Follow the [Best Practices](./docs/rules.md)
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR
- Follow the existing code style

## 📄 License

Proprietary - All rights reserved

---

**Built with ❤️ by the EmotifyAI team**
