# Verba Platform - Complete Documentation Index

Welcome to the Verba platform documentation! This index helps you find the information you need.

## 📚 Core Documentation

### Getting Started
- [README.md](../README.md) - Project overview and quick start
- [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) - Complete env var guide

### Architecture
- [overview.md](../docs/overview.md) - System architecture and design
- [FEATURE_ROADMAP.md](./FEATURE_ROADMAP.md) - Planned features and timeline

## 🚀 Deployment

### Production Deployment
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Pre-deployment checklist
- [netlify.toml](../netlify.toml) - Netlify configuration

### Extension Publishing
- [CHROME_STORE_SUBMISSION.md](./CHROME_STORE_SUBMISSION.md) - Chrome Web Store guide
- [FIREFOX_ADDONS_SUBMISSION.md](./FIREFOX_ADDONS_SUBMISSION.md) - Firefox Add-ons guide

## 🛠️ Development

### Setup
```bash
# Install dependencies
bun install

# Run development servers
bun dev                    # Both extension and web
bun dev:extension         # Extension only
bun dev:web               # Web app only
```

### Testing
```bash
# Run tests
bun test                  # All tests
bun test:extension        # Extension tests
bun test:web              # Web app tests

# Type checking
bun type-check
```

### Building
```bash
# Build for production
bun build                 # All projects
bun build:extension       # Extension only
bun build:web             # Web app only

# Create extension packages
bun run zip               # Chrome
bun run zip:firefox       # Firefox
```

## 📦 Project Structure

```
verba/
├── apps/
│   ├── extension/        # Browser extension (WXT)
│   └── web/              # Web application (Next.js)
├── packages/
│   └── ui/               # Shared UI components
├── docs/                 # Documentation
└── assets/               # Shared assets
```

## 🔧 Configuration Files

- `wxt.config.ts` - Extension configuration
- `next.config.js` - Next.js configuration
- `netlify.toml` - Netlify deployment
- `tsconfig.json` - TypeScript configuration
- `.env.local` - Environment variables (not committed)

## 🐛 Troubleshooting

### Common Issues

**Extension not loading**
- Check browser console for errors
- Verify manifest permissions
- Reload extension

**API errors**
- Check environment variables
- Verify Supabase connection
- Check API logs

**Build failures**
- Clear `.next` and `.output` directories
- Run `bun install` again
- Check TypeScript errors

## 📞 Support

- **Email**: support@verba.app
- **Issues**: GitHub Issues
- **Docs**: https://verba.app/docs

## 🔐 Security

- Report security issues to: security@verba.app
- See [SECURITY.md](./SECURITY.md) for details

## 📄 License

Proprietary - See LICENSE file

---

**Last Updated**: December 2024  
**Version**: 0.1.0
