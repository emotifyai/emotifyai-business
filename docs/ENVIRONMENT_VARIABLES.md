# Environment Variable Configuration Guide

## Overview

This guide explains all environment variables used across the EmotifyAI platform.

## Extension Environment Variables

Location: `apps/extension/.env.local`

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api  # Backend API URL
VITE_WEB_APP_URL=http://localhost:3000       # Web app URL for OAuth

# Extension Configuration
VITE_EXTENSION_ID=your_extension_id          # Chrome extension ID (production only)
VITE_LOG_LEVEL=debug                         # Logging level: debug | info | warn | error

# Feature Flags
VITE_MOCK_API_ENABLED=true                   # Enable mock API for development
```

### Production Values

```bash
VITE_API_BASE_URL=https://emotifyai.com/api
VITE_WEB_APP_URL=https://emotifyai.com
VITE_EXTENSION_ID=actual_chrome_extension_id
VITE_LOG_LEVEL=error
VITE_MOCK_API_ENABLED=false
```

## Web App Environment Variables

Location: `apps/web/.env.local`

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Configuration
ANTHROPIC_API_KEY=sk-ant-your-key
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_MAX_TOKENS=1024

# Payment Configuration
LEMONSQUEEZY_API_KEY=your_api_key
LEMONSQUEEZY_STORE_ID=your_store_id
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret

# Product IDs (from Lemon Squeezy)
LEMONSQUEEZY_PRODUCT_ID_TRIAL=12345
LEMONSQUEEZY_PRODUCT_ID_BASIC_MONTHLY=12346
LEMONSQUEEZY_PRODUCT_ID_PRO_MONTHLY=12347
LEMONSQUEEZY_PRODUCT_ID_BUSINESS_MONTHLY=12348
LEMONSQUEEZY_PRODUCT_ID_BASIC_ANNUAL=12349
LEMONSQUEEZY_PRODUCT_ID_PRO_ANNUAL=12350
LEMONSQUEEZY_PRODUCT_ID_BUSINESS_ANNUAL=12351
LEMONSQUEEZY_PRODUCT_ID_LIFETIME_LAUNCH=12352

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Feature Flags
MOCK_AI_RESPONSES=false                      # Use mock AI responses (dev only)
ENABLE_RATE_LIMITING=true                    # Enable API rate limiting
ENABLE_ANALYTICS=false                       # Enable analytics tracking

# Security
NEXTAUTH_SECRET=your_nextauth_secret         # For session encryption
NEXTAUTH_URL=http://localhost:3000           # Your app URL
```

### Production Values

```bash
# Supabase (Production Project)
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod_anon_key
SUPABASE_SERVICE_ROLE_KEY=prod_service_role_key

# AI (Production)
ANTHROPIC_API_KEY=sk-ant-prod-key
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_MAX_TOKENS=1024

# Payment (Production Mode)
LEMONSQUEEZY_API_KEY=prod_api_key
LEMONSQUEEZY_STORE_ID=prod_store_id
LEMONSQUEEZY_WEBHOOK_SECRET=prod_webhook_secret

# Application
NEXT_PUBLIC_APP_URL=https://emotifyai.com
NODE_ENV=production

# Feature Flags
MOCK_AI_RESPONSES=false
ENABLE_RATE_LIMITING=true
ENABLE_ANALYTICS=true

# Security
NEXTAUTH_SECRET=strong_random_secret_here
NEXTAUTH_URL=https://emotifyai.com
```

## Setting Up Environment Variables

### Local Development

1. Copy example files:
   ```bash
   cp apps/extension/.env.example apps/extension/.env.local
   cp apps/web/.env.local.example apps/web/.env.local
   ```

2. Fill in your values
3. Never commit `.env.local` files

### Netlify (Production)

1. Go to Netlify Dashboard
2. Site Settings → Environment Variables
3. Add all `NEXT_PUBLIC_*` and server-side variables
4. Deploy

### Supabase Setup

1. Create project at https://supabase.com
2. Get URL and keys from Settings → API
3. Add to environment variables

### Lemon Squeezy Setup

1. Create account at https://lemonsqueezy.com
2. Create store and products
3. Get API key from Settings → API
4. Configure webhook endpoint: `https://emotifyai.com/api/webhooks/lemonsqueezy`
5. Copy webhook secret

### Anthropic Setup

1. Create account at https://console.anthropic.com
2. Generate API key
3. Add to environment variables
4. Monitor usage in dashboard

## Security Best Practices

✅ **DO**:
- Use different keys for dev/prod
- Rotate keys regularly
- Use environment-specific values
- Keep secrets in `.env.local`
- Use strong random secrets

❌ **DON'T**:
- Commit `.env.local` files
- Share API keys
- Use production keys in development
- Hardcode secrets in code
- Expose service role keys client-side

## Troubleshooting

### Extension can't connect to API
- Check `VITE_API_BASE_URL` is correct
- Verify CORS settings in web app
- Check network tab for errors

### Supabase authentication fails
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check redirect URLs in Supabase dashboard
- Ensure cookies are enabled

### AI enhancement fails
- Verify `ANTHROPIC_API_KEY` is valid
- Check API quota in Anthropic dashboard
- Review error logs

### Webhooks not working
- Verify `LEMONSQUEEZY_WEBHOOK_SECRET`
- Check webhook URL is publicly accessible
- Review webhook logs in Lemon Squeezy dashboard
