# Chrome Web Store Submission Guide

## Prerequisites

- [ ] Google Developer account ($5 one-time fee)
- [ ] Extension built and tested
- [ ] All assets prepared (icons, screenshots, promotional images)
- [ ] Privacy policy URL
- [ ] Support email address

## Build Extension

```bash
cd apps/extension
bun run build
bun run zip
```

This creates `.output/chrome-mv3.zip`

## Required Assets

### Icons
- ✅ 16x16px - Already in `public/icon/16.png`
- ✅ 32x32px - Already in `public/icon/32.png`
- ✅ 48x48px - Already in `public/icon/48.png`
- ✅ 96x96px - Already in `public/icon/96.png`
- ✅ 128x128px - Already in `public/icon/128.png`

### Store Listing
- **Small tile icon**: 440x280px (create from logo)
- **Large tile icon**: 920x680px (create from logo)
- **Marquee**: 1400x560px (promotional banner)
- **Screenshots**: 1280x800px or 640x400px (at least 1, max 5)

## Submission Steps

1. **Go to Chrome Web Store Developer Dashboard**
   - https://chrome.google.com/webstore/devconsole

2. **Create New Item**
   - Upload `.output/chrome-mv3.zip`

3. **Fill Store Listing**
   - **Name**: Verba - AI Text Enhancement
   - **Summary**: AI-powered text enhancement and rewriting for better writing
   - **Description**: 
     ```
     Verba is your AI-powered writing assistant that enhances, rewrites, and improves your text with a single click.
     
     Features:
     • Right-click context menu for instant text enhancement
     • Powered by Claude 3.5 Sonnet AI
     • Support for English, Arabic, and French
     • Professional tone and grammar correction
     • Privacy-focused: No data stored locally
     
     How to use:
     1. Select any text on any webpage
     2. Right-click and choose "Enhance with Verba"
     3. Your text is instantly improved!
     
     Subscription required after 50 free enhancements.
     ```
   - **Category**: Productivity
   - **Language**: English

4. **Privacy Practices**
   - **Single purpose**: Text enhancement
   - **Permissions justification**:
     - `activeTab`: To read selected text
     - `contextMenus`: To add right-click menu
     - `storage`: To save user preferences
     - `scripting`: To replace enhanced text
   - **Host permissions**: To work on all websites
   - **Privacy policy URL**: https://emotifyai.com/privacy

5. **Upload Assets**
   - Upload all required images
   - Add screenshots showing the extension in action

6. **Pricing**
   - Free with in-app purchases
   - Link to Lemon Squeezy checkout

7. **Submit for Review**
   - Review time: 1-3 business days
   - Check email for approval/rejection

## Post-Approval

- [ ] Update extension ID in `.env.production`
- [ ] Add Chrome Web Store link to website
- [ ] Monitor reviews and ratings
- [ ] Respond to user feedback

## Updates

To update the extension:
1. Increment version in `wxt.config.ts`
2. Build and zip
3. Upload new version to dashboard
4. Submit for review
