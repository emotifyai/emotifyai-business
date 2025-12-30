# Chrome Web Store Privacy Justifications (Optimized Version)

This document provides the required justifications for all permissions used by the EmotifyAI extension. This version uses **activeTab only** instead of broad host permissions to reduce review complexity.

## Single Purpose Description

**Single Purpose**: AI-powered text enhancement and rewriting tool that helps users improve their writing by selecting text on any webpage and enhancing it with artificial intelligence through right-click context menu.

## Permission Justifications

### 1. activeTab Permission
**Justification**: Required to access and modify selected text on the currently active webpage when users right-click and choose "Enhance with EmotifyAI" from the context menu. This permission allows the extension to inject the content script only when needed, read the selected text, send it for AI enhancement, and replace it with the improved version on the same page. The extension only works when the user actively triggers it - no automatic background activity.

### 2. contextMenus Permission  
**Justification**: Required to add the "Enhance with EmotifyAI" option to the browser's right-click context menu when text is selected. This provides users with an intuitive way to access the text enhancement feature directly from any webpage. The context menu only appears when text is selected and the user is authenticated.

### 3. Host Permissions (OPTIMIZED APPROACH)
**Current Status**: The extension uses a **hybrid approach** for optimal Chrome Web Store approval:
- **Declarative content script**: Limited to `https://emotifyai.com/*` (our own domain) for web app integration
- **Programmatic injection**: Uses `activeTab` + `scripting` permissions to inject content scripts only when users trigger the context menu
- **User-initiated only**: Content scripts are injected dynamically via the background script when users right-click and select "Enhance with EmotifyAI"

This approach avoids broad host permissions (`https://*/*`) while still providing full functionality across all websites. The extension only accesses websites when users explicitly request text enhancement.

### 4. identity Permission
**Justification**: Required for secure user authentication using Google OAuth. This permission allows users to log into their EmotifyAI account directly from the extension without entering credentials manually, providing a seamless and secure authentication experience.

### 5. Remote Code Use
**Justification**: The extension does NOT execute any remote code. All JavaScript code is bundled with the extension during build time. The extension only makes HTTPS API calls to our secure backend (emotifyai.com) to send text for AI enhancement and receive processed text responses. No executable code is downloaded, evaluated, or executed from remote sources. All dynamic imports in the codebase are for local bundled modules (React lazy loading, theme utilities) and test mocking - not remote code execution.

### 6. scripting Permission
**Justification**: Required to inject content scripts into webpages ONLY when the user actively triggers text enhancement through the context menu. This allows the extension to dynamically inject the necessary UI components and text replacement functionality only on the current active tab when needed. The extension does not run scripts automatically on all websites - scripts are only injected when the user explicitly requests text enhancement.

### 7. storage Permission
**Justification**: Required to store user authentication tokens, usage statistics, user preferences, and usage analytics locally in the browser. This enables the extension to remember the user's login state, track their usage limits, maintain their settings (like preferred language and enhancement mode), and store usage logs for service improvement. All data is stored securely in the browser's local storage and never shared with third parties.

## Key Security Improvements

### Hybrid Permission Approach
- **Limited declarative content script**: Only runs on our own domain (`https://emotifyai.com/*`)
- **Programmatic injection**: Content scripts injected only when user triggers context menu via `activeTab` + `scripting`
- **User-initiated**: All functionality requires explicit user action (right-click → select menu item)
- **No automatic access**: Extension cannot access websites unless user explicitly triggers enhancement

### Minimal Permissions
- **No broad host permissions**: Uses targeted approach instead of `https://*/*`
- **Reduced attack surface**: Extension only accesses current tab when user requests it
- **Privacy-focused**: No background monitoring or automatic data collection across websites

## Data Usage Compliance

### Data Collection
- **Text Content**: Only the text selected by the user is temporarily sent to our secure servers for AI enhancement. Text is processed and immediately deleted - not stored permanently.
- **Authentication Data**: OAuth tokens are stored locally in the browser's secure storage and used only for API authentication.
- **Usage Analytics**: We collect usage logs including enhancement request metadata (timestamps, language preferences, success/failure status, token usage, and performance metrics) to improve user experience and service reliability. These logs never contain the actual text content - only technical metadata about the enhancement process.
- **User Preferences**: Settings like preferred language, enhancement mode, and theme preferences are stored locally.

### Data Sharing
- **No Third-Party Sharing**: User data is never shared with third parties except for the AI processing service (Anthropic Claude) which processes text under strict data protection agreements.
- **No Advertising**: The extension does not collect data for advertising purposes.
- **Analytics for UX**: Usage analytics are collected solely to improve service performance, identify technical issues, and develop better features based on user behavior patterns.

### Data Security
- **Encryption**: All data transmission uses HTTPS encryption.
- **Local Storage**: Sensitive data is stored in the browser's secure storage APIs.
- **Minimal Data**: Only essential data required for functionality and service improvement is collected.
- **Content Privacy**: Actual text content is never stored in our usage logs - only metadata about the enhancement process.

## Contact Information

**Developer Email**: ahmedmuhmmed239@gmail.com
**Support Email**: support@emotifyai.com
**Privacy Policy**: https://emotifyai.com/privacy
**Terms of Service**: https://emotifyai.com/terms

## Account Requirements

1. **Contact Email**: You need to add and verify your developer contact email in the Chrome Web Store Developer Dashboard under the Account tab.

2. **Email Verification**: Complete the email verification process by clicking the verification link sent to your email.

3. **Developer Program Policies Certification**: You must certify compliance with Chrome Web Store Developer Program Policies on the Privacy practices tab.

## Steps to Complete Submission

### 1. Account Setup (Required First)
- Go to Chrome Web Store Developer Dashboard
- Navigate to "Account" tab
- Add your contact email address
- Complete email verification by clicking the link sent to your email
- **This must be done before you can publish any extension**

### 2. Privacy Practices Tab
- Go to your extension's edit page
- Click "Privacy practices" tab
- Fill in the **Single Purpose Description** (copy from above)
- For each permission listed, click "Add justification" and paste the corresponding text from above:
  - activeTab → paste activeTab justification
  - contextMenus → paste contextMenus justification  
  - Host permissions → paste host permissions justification
  - identity → paste identity justification
  - scripting → paste scripting justification
  - storage → paste storage justification
- For "Remote code use" → Select "No" and paste the remote code justification
- **Certify compliance** with Developer Program Policies (check the box)

### 3. Store Listing Tab
- Ensure all required fields are filled:
  - Description
  - Screenshots (at least 1, recommended 3-5)
  - Category selection
  - Language selection

### 4. Submit for Review
- Click "Submit for review"
- Review process typically takes 1-3 business days
- You'll receive email notifications about the review status

## Troubleshooting Common Issues

### "Remote Code" Warning
If you still get remote code warnings:
1. Ensure you select "No, I am not using remote code" 
2. Provide the detailed justification above explaining that dynamic imports are for bundled code only
3. Consider temporarily removing the broad host permissions and using a more specific list if possible

### Host Permissions Too Broad
If reviewers flag the `https://*/*` permission as too broad:
1. You can justify it's needed for the extension to work on any website where users write text
2. Alternative: Consider using `activeTab` only and requesting host permissions dynamically
3. Explain that text enhancement needs to work across all websites (social media, email, documents, etc.)

### Contact Email Issues
- Make sure the email is verified (check spam folder for verification email)
- Use a professional email address
- Ensure the email matches your developer account

## Important Notes

- **Major Improvement**: This version removes broad host permissions (`https://*/*`) and uses `activeTab` only
- **Faster Review**: Extensions with activeTab typically get approved much faster than those with broad host permissions
- **User-Initiated Only**: All functionality requires explicit user action - no automatic background activity
- **Privacy-Focused**: Extension only accesses websites when user explicitly triggers enhancement
- Be specific and accurate in your justifications
- Explain exactly why each permission is necessary for your extension's core functionality
- Avoid generic explanations - be specific to EmotifyAI's use case
- Ensure your privacy policy URL is accessible and matches your data practices
- Test all functionality before submission to ensure permissions are actually needed

## Client's Recommendation (Arabic)

العميل محق تماماً في نصيحته:
- إزالة Host Permissions العامة يقلل التدقيق بشكل كبير
- الاعتماد على activeTab + scripting + contextMenus أفضل للقبول
- الإضافة تعمل فقط عند التفعيل اليدوي (Right-click) - وهذا مثالي
- هذا التغيير يجعل المراجعة أسرع وأسهل
