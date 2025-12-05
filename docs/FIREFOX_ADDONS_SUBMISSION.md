# Firefox Add-ons Submission Guide

## Prerequisites

- [ ] Firefox Add-ons Developer account (free)
- [ ] Extension built for Firefox
- [ ] All assets prepared
- [ ] Privacy policy URL
- [ ] Support email address

## Build Extension

```bash
cd apps/extension
bun run build:firefox
bun run zip:firefox
```

This creates `.output/firefox-mv2.zip`

## Required Assets

### Icons
- ✅ 48x48px - Already in `public/icon/48.png`
- ✅ 96x96px - Already in `public/icon/96.png`
- ✅ 128x128px - Already in `public/icon/128.png`

### Store Listing
- **Icon**: 128x128px (use existing)
- **Screenshots**: 640x480px minimum (at least 1, max 10)

## Submission Steps

1. **Go to Firefox Add-ons Developer Hub**
   - https://addons.mozilla.org/developers/

2. **Submit New Add-on**
   - Click "Submit a New Add-on"
   - Upload `.output/firefox-mv2.zip`

3. **Fill Add-on Details**
   - **Name**: Verba - AI Text Enhancement
   - **Summary**: AI-powered text enhancement for better writing
   - **Description**:
     ```
     Verba is your AI-powered writing assistant that enhances and improves your text instantly.
     
     Features:
     • Right-click to enhance any selected text
     • Powered by Claude 3.5 Sonnet AI
     • Supports English, Arabic, and French
     • Professional grammar and tone correction
     
     How to use:
     1. Select text on any webpage
     2. Right-click → "Enhance with Verba"
     3. Get instantly improved text!
     
     Requires subscription after 50 free uses.
     ```
   - **Categories**: Productivity, Writing
   - **Tags**: ai, writing, text, enhancement, grammar

4. **Technical Details**
   - **Version**: 0.1.0
   - **License**: Proprietary
   - **Privacy policy**: https://verba.app/privacy
   - **Homepage**: https://verba.app
   - **Support email**: support@verba.app

5. **Permissions Justification**
   - `activeTab`: Read selected text from current tab
   - `contextMenus`: Add right-click menu option
   - `storage`: Save user preferences and auth tokens
   - `<all_urls>`: Work on all websites

6. **Upload Screenshots**
   - At least 1 screenshot showing extension in action
   - Show before/after text enhancement

7. **Source Code** (if using minified code)
   - Upload source code as separate .zip
   - Include build instructions in README

8. **Submit for Review**
   - Review time: 1-5 business days
   - More thorough than Chrome review
   - May request code explanations

## Firefox Review Process

Firefox has stricter review:
- Manual code review
- Security audit
- Privacy compliance check
- May ask questions about:
  - API usage
  - Data handling
  - Third-party services

## Post-Approval

- [ ] Update extension ID in `.env.production`
- [ ] Add Firefox Add-ons link to website
- [ ] Monitor reviews
- [ ] Respond to user feedback

## Updates

To update:
1. Increment version in `wxt.config.ts`
2. Build and zip for Firefox
3. Upload new version
4. Provide changelog
5. Submit for review

## Common Rejection Reasons

- Insufficient permission justification
- Missing privacy policy
- Unclear data handling
- Minified code without source
- External script loading

## Tips for Approval

✅ Clear permission explanations
✅ Detailed privacy policy
✅ Include source code
✅ Respond quickly to reviewer questions
✅ Test thoroughly before submission
