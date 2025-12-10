# OAuth Production Setup Guide

This guide covers the complete setup of Google OAuth for the EmotifyAI platform in production, including configuration for both the web application and browser extension.

## Overview

The EmotifyAI platform uses Google OAuth for authentication across two components:
- **Web Application**: Next.js app hosted at `https://emotifyai.com`
- **Browser Extension**: Chrome/Firefox extension that communicates with the web app

Both components need to be configured to work with the same Google OAuth project for seamless authentication and token synchronization.

## Google Cloud Console Setup

### 1. Create OAuth 2.0 Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Select **Web application** as the application type

### 2. Configure Authorized Redirect URIs

Add the following redirect URIs to your OAuth client:

#### Web Application Redirects
```
https://emotifyai.com/auth/callback
https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback
```

#### Extension Redirects (Add after extension is published)
```
chrome-extension://YOUR_CHROME_EXTENSION_ID/
moz-extension://YOUR_FIREFOX_EXTENSION_ID/
```

### 3. Configure Authorized JavaScript Origins

Add the following origins:
```
https://emotifyai.com
```

### 4. Get Client Credentials

After creating the OAuth client, note down:
- **Client ID**: Used in both web app and extension
- **Client Secret**: Used only in web app (server-side)

## Supabase Configuration

### 1. Configure OAuth Provider

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Enable **Google** provider
4. Enter your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
5. Set **Redirect URL** to: `https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback`

### 2. Configure Site URL

1. Go to **Authentication** → **Settings**
2. Set **Site URL** to: `https://emotifyai.com`
3. Add **Redirect URLs**:
   ```
   https://emotifyai.com/auth/callback
   https://emotifyai.com/dashboard
   ```

## Web Application Configuration

### 1. Environment Variables

Update your production environment file (`.env.production.local`):

```bash
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_google_client_secret

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your_project_id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application URL
NEXT_PUBLIC_APP_URL=https://emotifyai.com
```

### 2. OAuth Flow Implementation

The web app OAuth flow is already implemented in:
- `components/auth/oauth-buttons.tsx`: OAuth login button
- `lib/hooks/use-auth.ts`: OAuth login hook
- `app/auth/callback/route.ts`: OAuth callback handler

## Browser Extension Configuration

### 1. Environment Variables

Update your production environment file (`.env.production`):

```bash
# API Configuration
VITE_API_BASE_URL=https://emotifyai.com/api
VITE_WEB_APP_URL=https://emotifyai.com

# OAuth Configuration
VITE_OAUTH_CLIENT_ID=your_google_client_id

# Extension ID (update after store approval)
VITE_EXTENSION_ID=your_extension_id_after_publishing
```

### 2. Manifest Permissions

The extension manifest includes the `identity` permission for OAuth:

```json
{
  "permissions": [
    "contextMenus",
    "storage",
    "activeTab",
    "scripting",
    "identity"
  ]
}
```

### 3. OAuth Flow Implementation

The extension OAuth flow is implemented in:
- `services/api/auth.ts`: OAuth login functions
- `entrypoints/popup/hooks/useAuth.ts`: Auth state management

## Cross-Platform Token Synchronization

### 1. Token Flow

1. User initiates OAuth in extension or web app
2. Google OAuth completes and returns to web app callback
3. Web app processes OAuth and creates session
4. Extension syncs token from web app via API call
5. Both platforms maintain synchronized auth state

### 2. Token Sync Implementation

The token synchronization is handled by:
- **Web App**: Stores session in Supabase auth cookies
- **Extension**: Calls `/api/auth/session` to get current session token
- **Background Script**: Periodically validates and refreshes tokens

## Testing OAuth Configuration

### 1. Pre-Production Testing

Before going live, test the OAuth flow:

1. **Web App Testing**:
   ```bash
   cd apps/web
   npm run build
   npm run start
   ```
   - Test login at `http://localhost:3000/login`
   - Verify redirect to Google OAuth
   - Confirm successful callback and dashboard redirect

2. **Extension Testing**:
   ```bash
   cd apps/extension
   npm run build:chrome
   ```
   - Load unpacked extension in Chrome
   - Test OAuth login from extension popup
   - Verify token sync with web app

### 2. Production Validation

After deployment:

1. **Verify OAuth URLs**:
   - Test `https://emotifyai.com/login`
   - Confirm Google OAuth redirect works
   - Verify callback URL processes correctly

2. **Test Extension Integration**:
   - Install published extension
   - Test OAuth login from extension
   - Verify cross-platform logout

## Security Considerations

### 1. Client ID Security

- **Web App**: Client ID can be public (used in frontend)
- **Extension**: Client ID is embedded in extension (public)
- **Client Secret**: NEVER expose in frontend or extension code

### 2. Redirect URI Validation

- Google validates redirect URIs against configured list
- Ensure all production URLs are added to OAuth client
- Remove development URLs from production OAuth client

### 3. Token Storage

- **Web App**: Uses secure HTTP-only cookies via Supabase
- **Extension**: Uses `chrome.storage.local` (encrypted by browser)
- **Never** store tokens in localStorage or sessionStorage

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" Error**:
   - Verify redirect URI is exactly configured in Google Console
   - Check for trailing slashes or protocol mismatches

2. **Extension OAuth Not Working**:
   - Ensure `identity` permission is in manifest
   - Verify extension ID is correct after publishing
   - Check that OAuth client includes extension redirect URI

3. **Token Sync Issues**:
   - Verify API endpoints are accessible from extension
   - Check CORS configuration allows extension origin
   - Ensure session validation endpoint works correctly

4. **Supabase OAuth Errors**:
   - Verify Supabase OAuth provider is enabled
   - Check client ID/secret match Google Console
   - Confirm site URL and redirect URLs are correct

### Debug Steps

1. **Check Network Requests**:
   - Monitor OAuth redirect URLs
   - Verify API calls between extension and web app
   - Check for CORS or authentication errors

2. **Validate Configuration**:
   - Confirm all environment variables are set
   - Verify OAuth client configuration in Google Console
   - Check Supabase auth provider settings

3. **Test Individual Components**:
   - Test web app OAuth independently
   - Test extension OAuth with mock responses
   - Verify token validation endpoints

## Deployment Checklist

### Before Going Live

- [ ] Google OAuth client configured with production URLs
- [ ] Supabase OAuth provider enabled and configured
- [ ] Web app environment variables updated for production
- [ ] Extension environment variables updated for production
- [ ] OAuth redirect URIs include all necessary URLs
- [ ] Client secret secured and not exposed in frontend

### After Extension Publishing

- [ ] Update extension ID in environment variables
- [ ] Add extension redirect URIs to Google OAuth client
- [ ] Test complete OAuth flow from published extension
- [ ] Verify cross-platform token synchronization
- [ ] Monitor for OAuth-related errors in production

### Ongoing Maintenance

- [ ] Monitor OAuth success/failure rates
- [ ] Keep Google OAuth client credentials secure
- [ ] Update redirect URIs when adding new domains
- [ ] Regularly test OAuth flow across all platforms
- [ ] Monitor token expiration and refresh patterns

## Support and Documentation

For additional help:
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Chrome Extension Identity API](https://developer.chrome.com/docs/extensions/reference/identity/)
- [Firefox WebExtensions Identity API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/identity)