# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 1. **DO NOT** create a public GitHub issue

### 2. Email us at security@verba.app

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### 3. Wait for acknowledgment

We will:
- Acknowledge receipt within 24 hours
- Provide an initial assessment within 72 hours
- Keep you updated on progress

### 4. Coordinated disclosure

- We'll work with you to understand and fix the issue
- We'll credit you in the security advisory (unless you prefer to remain anonymous)
- We'll coordinate the public disclosure timing

## Security Measures

### Data Protection
- All API keys encrypted at rest
- No sensitive data stored client-side
- HTTPS only for all communications
- Row Level Security (RLS) on all database tables

### Authentication
- Supabase Auth with OAuth providers
- Session-based authentication
- Automatic session refresh
- Secure cookie handling

### API Security
- Rate limiting on all endpoints
- Input validation with Zod schemas
- CORS restrictions
- Webhook signature verification

### Infrastructure
- Netlify hosting with DDoS protection
- Supabase with built-in security
- Regular security updates
- Automated dependency scanning

## Best Practices for Users

✅ **DO**:
- Use strong, unique passwords
- Enable 2FA if available
- Keep your browser updated
- Review extension permissions

❌ **DON'T**:
- Share your API keys
- Use the same password across services
- Install from unofficial sources
- Ignore security warnings

## Security Updates

We will:
- Patch critical vulnerabilities within 24 hours
- Patch high-severity issues within 7 days
- Release security updates as needed
- Notify users of critical updates

## Compliance

- GDPR compliant
- CCPA compliant
- SOC 2 Type II (planned)
- Regular security audits

## Contact

- Security issues: security@verba.app
- General support: support@verba.app
- Privacy concerns: privacy@verba.app
