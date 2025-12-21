# API Setup & Token Guide

This guide explains how to obtain the necessary API tokens and configuration values for the EmotifAI project.

---

## 1. Supabase (Authentication & Database)

**Purpose**: Handles user authentication and database operations.

### Steps:

1. **Create a Project**:
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Click "New Project"
   - Fill in project details and wait for setup to complete

2. **Get URL & Keys**:
   - Navigate to **Settings** (⚙️) → **API**
   - Copy the following values:
     - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
     - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **Keep this secret!**

3. **Setup Authentication**:
   - Go to **Authentication** → **Providers**
   - Enable **Google OAuth**:
     - Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/)
     - Add authorized redirect URI: `https://[your-project].supabase.co/auth/v1/callback`
   - Enable **GitHub OAuth** (optional):
     - Create OAuth app in [GitHub Developer Settings](https://github.com/settings/developers)
     - Add callback URL: `https://[your-project].supabase.co/auth/v1/callback`

4. **Configure URL Settings**:
   - Go to **Authentication** → **URL Configuration**
   - Set **Site URL**: `http://localhost:3000` (development) or `https://emotifyai.com` (production)
   - Add **Redirect URLs**: `http://localhost:3000/auth/callback`

---

## 2. Lemon Squeezy (Payments & Subscriptions)

**Purpose**: Handles subscription billing and payments.

### Steps:

1. **Create a Store**:
   - Go to [Lemon Squeezy Dashboard](https://app.lemonsqueezy.com/)
   - Create a new store if you don't have one

2. **Get API Key**:
   - Navigate to **Settings** → **API**
   - Click "Create API Key"
   - Copy the key → `LEMONSQUEEZY_API_KEY`

3. **Get Store ID**:
   - Go to **Settings** → **Stores**
   - Copy your Store ID → `LEMONSQUEEZY_STORE_ID`

4. **Setup Webhook**:
   - Navigate to **Settings** → **Webhooks**
   - Click "Create Webhook"
   - **URL**: `https://your-domain.com/api/webhooks/lemonsqueezy`
     - For local development, use [ngrok](https://ngrok.com/) to expose localhost
   - **Events**: Select all subscription events
   - Copy the **Signing Secret** → `LEMONSQUEEZY_WEBHOOK_SECRET`

5. **Create Products**:
   - Go to **Products** → **Create Product**
   
   **Monthly Subscription**:
   - Name: "EmotifAI Monthly"
   - Price: $9.99/month
   - After creation, copy the **Variant ID** → `LEMONSQUEEZY_MONTHLY_VARIANT_ID`
   
   **Lifetime License**:
   - Name: "EmotifAI Lifetime"
   - Price: $99.99 (one-time)
   - After creation, copy the **Variant ID** → `LEMONSQUEEZY_LIFETIME_VARIANT_ID`

---

## 3. Anthropic (Claude AI)

**Purpose**: Powers the AI text enhancement using Claude 3.5 Sonnet.

### Steps:

1. **Get API Key**:
   - Go to [Anthropic Console](https://console.anthropic.com/settings/keys)
   - Sign up or log in
   - Click "Create Key"
   - Copy the key → `ANTHROPIC_API_KEY`
   - ✅ **Already configured** in your `.env.local` file

2. **Add Credits** (if needed):
   - Go to **Settings** → **Billing**
   - Add payment method and credits
   - Recommended: Start with $20 for testing

---

## 4. OAuth Configuration (Extension)

**Purpose**: Allows the browser extension to authenticate users.

### Steps:

1. **Use Supabase OAuth**:
   - The extension uses the same Supabase project as the web app
   - In `apps/extension/.env`:
     - `VITE_OAUTH_CLIENT_ID`: Use your Supabase project reference or OAuth provider client ID
     - For development with mock API: `test_client_id` is sufficient

2. **Configure Extension ID** (after first install):
   - Install the extension in Chrome/Firefox
   - Get the extension ID:
     - **Chrome**: `chrome://extensions` → Copy ID
     - **Firefox**: `about:debugging` → Copy UUID
   - Update `VITE_EXTENSION_ID` in `.env`

---

## Environment Files Summary

### `apps/web/.env.local` (Web Application)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Lemon Squeezy
LEMONSQUEEZY_API_KEY=lmsq_sk_xxxxx
LEMONSQUEEZY_STORE_ID=12345
LEMONSQUEEZY_WEBHOOK_SECRET=whsec_xxxxx
LEMONSQUEEZY_MONTHLY_VARIANT_ID=67890
LEMONSQUEEZY_LIFETIME_VARIANT_ID=67891

# Anthropic (Already configured ✅)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### `apps/extension/.env` (Browser Extension)

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_MOCK_API_ENABLED=true

# OAuth
VITE_OAUTH_CLIENT_ID=test_client_id
VITE_WEB_APP_URL=http://localhost:3000

# Logging
VITE_LOG_LEVEL=debug
```

---

## Quick Start Checklist

- [ ] **Supabase**: Project created, keys copied
- [ ] **Supabase**: Google OAuth enabled
- [ ] **Supabase**: Redirect URLs configured
- [ ] **Lemon Squeezy**: Store created, API key copied
- [ ] **Lemon Squeezy**: Webhook configured
- [ ] **Lemon Squeezy**: Products created (Monthly + Lifetime)
- [ ] **Anthropic**: API key obtained (✅ Already done)
- [ ] **Environment Files**: All values filled in `.env.local` and `.env`

---

## Testing Your Setup

### 1. Test Supabase Connection
```bash
cd apps/web
bun run dev
# Visit http://localhost:3000/login
# Try signing in with Google
```

### 2. Test AI Enhancement
```bash
# In apps/web/.env.local, ensure:
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
MOCK_AI_RESPONSES=false

# Test the /api/enhance endpoint
```

### 3. Test Extension
```bash
cd apps/extension
bun run dev
# Load extension in Chrome
# Try enhancing text on any webpage
```

---

## Troubleshooting

### Supabase Issues

**Error**: "Invalid API key"
- **Solution**: Verify you copied the correct anon key from Supabase dashboard

**Error**: OAuth redirect fails
- **Solution**: Check redirect URLs in Supabase Auth settings match your app URL

### Lemon Squeezy Issues

**Error**: Webhook signature verification failed
- **Solution**: Ensure `LEMONSQUEEZY_WEBHOOK_SECRET` matches the webhook signing secret

**Error**: Product variant not found
- **Solution**: Verify variant IDs are correct in Lemon Squeezy dashboard

### Anthropic Issues

**Error**: "Invalid API key"
- **Solution**: Verify the API key starts with `sk-ant-api03-`

**Error**: Rate limit exceeded
- **Solution**: Add more credits or enable `MOCK_AI_RESPONSES=true` for testing

---

## Security Best Practices

1. ✅ **Never commit `.env` files** to version control
2. ✅ **Keep service role keys secret** - never expose in client-side code
3. ✅ **Use different keys** for development and production
4. ✅ **Rotate API keys** regularly
5. ✅ **Enable webhook signature verification** for Lemon Squeezy
6. ✅ **Use environment-specific URLs** (localhost vs production)

---

## Need Help?

- **Supabase Docs**: https://supabase.com/docs
- **Lemon Squeezy Docs**: https://docs.lemonsqueezy.com
- **Anthropic Docs**: https://docs.anthropic.com
- **EmotifAI Docs**: See `docs/` folder in this repository

---

**Last Updated**: November 30, 2025
