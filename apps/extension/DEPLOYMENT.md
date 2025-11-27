# Verba Extension - Deployment Guide

## Prerequisites

Before deploying, ensure you have:
- ✅ Completed development and testing
- ✅ All tests passing
- ✅ Production environment variables configured
- ✅ Chrome Web Store Developer account ($5 one-time fee)
- ✅ Firefox Add-ons Developer account (free)

---

## Build for Production

### 1. Configure Environment Variables

Create `.env.production` in `apps/extension/`:

```env
VITE_API_BASE_URL=https://api.verba.app/api
VITE_MOCK_API_ENABLED=false
VITE_OAUTH_CLIENT_ID=your_production_oauth_client_id
VITE_WEB_APP_URL=https://verba.app
VITE_EXTENSION_ID=your_chrome_extension_id
VITE_LOG_LEVEL=error
```

### 2. Build Extension

```bash
cd apps/extension

# Build for Chrome
bun run build

# Build for Firefox
bun run build:firefox
```

### 3. Create Distribution Packages

```bash
# Create Chrome ZIP
bun run zip
# Output: .output/chrome-mv3.zip

# Create Firefox ZIP
bun run zip:firefox
# Output: .output/firefox-mv2.zip
```

---

## Chrome Web Store Deployment

### Initial Setup

1. **Create Developer Account**
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Pay $5 one-time registration fee
   - Complete account verification

2. **Prepare Store Assets**

Required assets (create in `apps/extension/store-assets/chrome/`):

- **Icon**: 128x128px PNG (already in `/icon/128.png`)
- **Screenshots**: 1280x800px or 640x400px (at least 1, max 5)
  - Dashboard view
  - Text enhancement in action
  - Settings panel
- **Promotional Images** (optional but recommended):
  - Small tile: 440x280px
  - Marquee: 1400x560px
- **Privacy Policy URL**: https://verba.app/privacy
- **Support URL**: https://verba.app/support

### Upload Extension

1. **Go to Dashboard**
   - Click "New Item"
   - Upload `chrome-mv3.zip`

2. **Fill Store Listing**

```
Name: Verba - AI Text Enhancement

Short Description (132 chars max):
AI-powered text enhancement and rewriting. Improve your writing instantly with Claude 3.5 Sonnet.

Detailed Description:
Verba is an AI-powered text enhancement tool that helps you write better, faster. 
Simply select any text on any webpage, right-click, and choose "Enhance with Verba" 
to instantly improve clarity, grammar, and style.

✨ Features:
• Instant text enhancement with Claude 3.5 Sonnet AI
• Support for English, Arabic, and French
• Right-click context menu integration
• Keyboard shortcut (Ctrl+Shift+E)
• Undo functionality
• Trial: 10 free enhancements
• Unlimited enhancements with subscription

🔒 Privacy & Security:
• No data stored locally
• Secure API communication
• No tracking or analytics in extension

💎 Pricing:
• Trial: 10 free enhancements
• Monthly: $9.99/month - Unlimited
• Lifetime: $99.99 - Unlimited forever

📚 Perfect for:
• Content creators
• Students
• Professionals
• Non-native English speakers
• Anyone who writes online

Category: Productivity
Language: English
```

3. **Privacy Practices**
   - Select "Yes" for "Does this extension collect user data?"
   - Data types collected:
     - Authentication information (for login)
     - Usage statistics (enhancement count)
   - Purpose: Provide core functionality
   - Data handling: Data is encrypted in transit

4. **Distribution**
   - Visibility: Public
   - Regions: All regions

5. **Submit for Review**
   - Click "Submit for Review"
   - Review typically takes 1-3 business days

### Post-Approval

Once approved:
1. Extension will be live on Chrome Web Store
2. Update `VITE_EXTENSION_ID` in `.env.production` with actual ID
3. Configure OAuth redirect URLs in backend

---

## Firefox Add-ons Deployment

### Initial Setup

1. **Create Developer Account**
   - Go to [Firefox Add-ons Developer Hub](https://addons.mozilla.org/developers/)
   - Sign in with Firefox Account (free)

2. **Prepare Store Assets**

Required assets (create in `apps/extension/store-assets/firefox/`):

- **Icon**: 128x128px PNG (already in `/icon/128.png`)
- **Screenshots**: At least 1 (same as Chrome)

### Upload Extension

1. **Go to Developer Hub**
   - Click "Submit a New Add-on"
   - Choose "On this site"

2. **Upload Extension**
   - Upload `firefox-mv2.zip`
   - Select "Firefox" as platform

3. **Fill Add-on Details**

```
Name: Verba - AI Text Enhancement

Summary (250 chars max):
AI-powered text enhancement with Claude 3.5 Sonnet. Improve writing instantly. 
Supports English, Arabic, French. Right-click any text to enhance.

Description: (Same as Chrome detailed description)

Categories:
- Productivity
- Writing & Editing

Tags:
- writing
- ai
- text enhancement
- productivity
- grammar

Support Email: support@verba.app
Support Website: https://verba.app/support
Homepage: https://verba.app
Privacy Policy: https://verba.app/privacy
```

4. **Version Notes**
```
Initial release of Verba extension.
Features:
- AI-powered text enhancement
- Multi-language support (EN/AR/FR)
- Context menu integration
- Keyboard shortcuts
```

5. **Submit for Review**
   - Click "Submit Version"
   - Review typically takes 1-5 business days

---

## Update Deployment

### For Updates

1. **Increment Version**
   - Update `version` in `wxt.config.ts`
   - Follow semantic versioning (e.g., 0.1.0 → 0.1.1)

2. **Build & Package**
   ```bash
   bun run build
   bun run zip
   ```

3. **Upload to Stores**
   - **Chrome**: Dashboard → Select extension → "Package" tab → "Upload new package"
   - **Firefox**: Developer Hub → Select add-on → "Upload New Version"

4. **Version Notes**
   ```
   Version 0.1.1
   - Fixed: [Bug description]
   - Added: [New feature]
   - Improved: [Enhancement]
   ```

---

## Post-Deployment Checklist

- [ ] Extension live on Chrome Web Store
- [ ] Extension live on Firefox Add-ons
- [ ] OAuth redirect URLs configured
- [ ] Analytics dashboard setup (on website)
- [ ] Support email monitored
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Pricing page live
- [ ] User documentation published

---

## Monitoring

### Metrics to Track

1. **Installation Metrics**
   - Daily active users (DAU)
   - Weekly active users (WAU)
   - Install/uninstall rate

2. **Usage Metrics** (from backend)
   - Enhancements per user
   - Trial conversion rate
   - Subscription retention

3. **Store Metrics**
   - Store rating
   - Review sentiment
   - Search ranking

### Tools

- **Chrome Web Store**: Built-in analytics
- **Firefox**: AMO Statistics
- **Backend**: Custom analytics dashboard
- **Error Tracking**: Monitor backend API errors

---

## Troubleshooting

### Common Issues

**Build Fails**
```bash
# Clear cache and rebuild
rm -rf .output node_modules/.vite
bun install
bun run build
```

**Extension Rejected**
- Check manifest permissions (only request necessary ones)
- Ensure privacy policy is accessible
- Remove any obfuscated code
- Provide clear description of data usage

**OAuth Not Working**
- Verify redirect URLs match production
- Check OAuth client ID is correct
- Ensure backend CORS allows extension origin

---

## Rollback Procedure

If critical bug found after deployment:

1. **Immediate**
   - Disable extension in store (if possible)
   - Post notice on support page

2. **Fix**
   - Revert to previous version code
   - Apply hotfix
   - Test thoroughly

3. **Redeploy**
   - Build fixed version
   - Upload as emergency update
   - Monitor closely

---

## Support

- **Documentation**: https://verba.app/docs
- **Support Email**: support@verba.app
- **GitHub Issues**: (if open source)
- **Discord/Slack**: (if community exists)

---

## Legal Requirements

### Required Pages

1. **Privacy Policy** (https://verba.app/privacy)
   - Data collection practices
   - Data usage
   - Third-party services (Claude AI)
   - User rights (GDPR/CCPA)

2. **Terms of Service** (https://verba.app/terms)
   - Acceptable use
   - Subscription terms
   - Refund policy
   - Liability limitations

3. **Support Page** (https://verba.app/support)
   - Contact information
   - FAQ
   - Troubleshooting guide

### Compliance

- **GDPR** (EU): Data deletion, data export
- **CCPA** (California): Privacy policy, opt-out
- **Store Policies**: Follow Chrome/Firefox guidelines

---

## Maintenance Schedule

### Weekly
- Monitor store reviews
- Check error rates
- Review support tickets

### Monthly
- Analyze usage metrics
- Plan feature updates
- Security audit

### Quarterly
- Major version updates
- Performance optimization
- User feedback implementation

---

## Emergency Contacts

- **Chrome Web Store Support**: https://support.google.com/chrome_webstore/
- **Firefox Add-ons Support**: https://discourse.mozilla.org/c/add-ons/
- **Backend Team**: backend@verba.app
- **Security Issues**: security@verba.app
