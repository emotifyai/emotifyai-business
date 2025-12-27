# Chrome Web Store Privacy Justifications

This document provides the required justifications for all permissions used by the EmotifyAI extension. Copy and paste these justifications into the Chrome Web Store Privacy practices tab.

## Single Purpose Description

**Single Purpose**: AI-powered text enhancement and rewriting tool that helps users improve their writing by selecting text on any webpage and enhancing it with artificial intelligence.

## Permission Justifications

### 1. activeTab Permission
**Justification**: Required to access and modify selected text on the currently active webpage when users right-click and choose "Enhance with EmotifyAI" from the context menu. This permission allows the extension to read the selected text, send it for AI enhancement, and replace it with the improved version on the same page.

### 2. contextMenus Permission  
**Justification**: Required to add the "Enhance with EmotifyAI" option to the browser's right-click context menu when text is selected. This provides users with an intuitive way to access the text enhancement feature directly from any webpage without opening the extension popup.

### 3. Host Permissions (https://*/*, http://*/*)
**Justification**: Required to inject content scripts and access selected text on all websites where users want to enhance their writing. The extension needs to work across all websites including social media, email platforms, document editors, and any other web-based text input areas where users write content.

### 4. identity Permission
**Justification**: Required for secure user authentication using Google OAuth. This permission allows users to log into their EmotifyAI account directly from the extension without entering credentials manually, providing a seamless and secure authentication experience.

### 5. Remote Code Use
**Justification**: The extension does NOT execute any remote code. All JavaScript code is bundled with the extension during build time. The extension only makes HTTPS API calls to our secure backend (emotifyai.com) to send text for AI enhancement and receive processed text responses. No executable code is downloaded, evaluated, or executed from remote sources. All dynamic imports in the codebase are for local bundled modules (React lazy loading, theme utilities) and test mocking - not remote code execution.

### 6. scripting Permission
**Justification**: Required to inject content scripts into webpages to detect text selection, display enhancement results, and provide undo functionality. This allows the extension to seamlessly integrate with any website's text content and provide in-place text replacement without disrupting the user's workflow.

### 7. storage Permission
**Justification**: Required to store user authentication tokens, usage statistics, and user preferences locally in the browser. This enables the extension to remember the user's login state, track their usage limits, and maintain their settings (like preferred language and enhancement mode) across browser sessions.

## Data Usage Compliance

### Data Collection
- **Text Content**: Only the text selected by the user is temporarily sent to our secure servers for AI enhancement. Text is processed and immediately deleted - not stored permanently.
- **Authentication Data**: OAuth tokens are stored locally in the browser's secure storage and used only for API authentication.
- **Usage Statistics**: Anonymous usage counts are stored to track subscription limits and provide usage analytics to users.

### Data Sharing
- **No Third-Party Sharing**: User data is never shared with third parties except for the AI processing service (Anthropic Claude) which processes text under strict data protection agreements.
- **No Advertising**: The extension does not collect data for advertising purposes.
- **No Analytics Tracking**: No user behavior tracking or analytics beyond essential usage counting for subscription management.

### Data Security
- **Encryption**: All data transmission uses HTTPS encryption.
- **Local Storage**: Sensitive data is stored in the browser's secure storage APIs.
- **Minimal Data**: Only essential data required for functionality is collected.

## Contact Information

**Developer Email**: ahmedmuhmmed239@gmail.com
**Support Email**: support@emotifyai.com
**Privacy Policy**: https://emotifyai-app.netlify.app/privacy
**Terms of Service**: https://emotifyai-app.netlify.app/terms

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

- Be specific and accurate in your justifications
- Explain exactly why each permission is necessary for your extension's core functionality
- Avoid generic explanations - be specific to EmotifyAI's use case
- Ensure your privacy policy URL is accessible and matches your data practices
- Test all functionality before submission to ensure permissions are actually needed
