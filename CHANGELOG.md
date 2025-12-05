# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Shared UI package (`@verba/ui`) with theme tokens and Toast component
- ESLint configuration for extension
- Comprehensive documentation (deployment, environment variables, submission guides)
- Enhanced middleware with rate limiting, logging, and security headers
- Feature roadmap documentation
- Security policy
- Contributing guidelines

### Changed
- **BREAKING**: Unified subscription system from 3-tier to 8-tier credit-based model
  - Old tiers: `trial`, `monthly`, `lifetime`
  - New tiers: `trial`, `lifetime_launch`, `basic_monthly`, `pro_monthly`, `business_monthly`, `basic_annual`, `pro_annual`, `business_annual`
- **BREAKING**: Simplified enhancement modes to single `enhance` mode only
  - Removed: `rephrase`, `simplify`, `expand` modes
- Rewrote `/api/enhance` route for better maintainability
- Updated database enums to match new tier system

### Fixed
- TypeScript errors in Vite config files (suppressed known conflicts)
- Type mismatches in subscription and enhancement types
- Mock API data to use new tier structure

### Removed
- Old 3-tier subscription enum
- Multiple enhancement mode support
- Unused enhancement mode logic from AI service

## [0.1.0] - 2024-12-05

### Added
- Initial project setup
- Browser extension (Chrome & Firefox support)
- Web application with Next.js 16
- Supabase authentication
- Claude 3.5 Sonnet AI integration
- Lemon Squeezy payment integration
- Context menu text enhancement
- Multi-language support (English, Arabic, French)
- Trial, monthly, and lifetime subscription tiers
- Usage tracking and limits
- Mock API for development
- Comprehensive test suite
- Documentation and guides

### Security
- Row Level Security (RLS) on all database tables
- API key hashing
- HTTPS-only communication
- CORS protection
- Rate limiting
- Input validation with Zod

---

## Migration Guides

### Migrating from 0.0.x to 0.1.0

#### Subscription Tiers
If you have existing subscriptions, you'll need to migrate them:

**Old → New Mapping**:
- `trial` → `trial` (no change)
- `monthly` → `basic_monthly` (or `pro_monthly` based on features)
- `lifetime` → `lifetime_launch`

**Database Migration**:
```sql
-- Update subscription tiers
UPDATE subscriptions 
SET tier = 'basic_monthly' 
WHERE tier = 'monthly';

UPDATE subscriptions 
SET tier = 'lifetime_launch' 
WHERE tier = 'lifetime';
```

#### Enhancement Modes
All enhancement requests now use the single `enhance` mode:

**Before**:
```typescript
await enhanceText({ text, mode: 'rephrase', language: 'en' })
```

**After**:
```typescript
await enhanceText({ text, language: 'en' })
```

#### API Changes
The `/api/enhance` endpoint no longer accepts `mode` parameter:

**Before**:
```json
{
  "text": "...",
  "mode": "enhance",
  "language": "en"
}
```

**After**:
```json
{
  "text": "...",
  "language": "en"
}
```

---

[Unreleased]: https://github.com/yourusername/verba/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/yourusername/verba/releases/tag/v0.1.0
