# Deployment Guide

This guide covers the steps to deploy the EmotifyAI extension and its accompanying Shopify App.

## Prerequisites

- [Bun](https://bun.sh/) installed.
- A [Shopify Partner](https://partners.shopify.com/) account.
- Chrome Web Store Developer account (for Chrome extension).
- Firefox Add-ons Developer account (for Firefox extension).

## 1. Automated Setup

We have provided a `ship` script to automate most of the process.

```bash
bun run scripts/ship.ts
```

This script will:
1.  Build the Chrome and Firefox extension artifacts (`.zip` files).
2.  Initialize the Shopify App (if not already present) - **Requires Login**.
3.  Build the Shopify App.
4.  Optionally deploy the Shopify App.

## 2. Manual Steps

### A. Extension Distribution

The `ship` script generates the following files in `apps/extension/.output/`:
-   `emotifyai-extension-x.x.x-chrome.zip`
-   `emotifyai-extension-x.x.x-firefox.zip`

#### Chrome Web Store
1.  Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2.  Click "New Item".
3.  Upload `emotifyai-extension-x.x.x-chrome.zip`.
4.  Fill in the store listing details.
5.  Submit for review.

#### Firefox Add-ons
1.  Go to the [Firefox Add-ons Developer Hub](https://addons.mozilla.org/developers/).
2.  Click "Submit a New Add-on".
3.  Upload `emotifyai-extension-x.x.x-firefox.zip`.
4.  Select "On this site" (Self-hosted) or "On Firefox Add-ons" (Recommended).
5.  Submit for review.

### B. Shopify App Configuration

If you initialized the app via the script, you have a Remix app in `apps/emotifyai-app`.

1.  **App Configuration**:
    -   Edit `apps/emotifyai-app/shopify.app.toml`.
    -   Ensure the `application_url` and `redirect_url_whitelist` match your deployment (or tunnel if developing).

2.  **Linking Extension**:
    -   Typically, Shopify Apps for extensions act as a landing page or installer.
    -   Update `apps/emotifyai-app/app/routes/_index.tsx` to include download links to your Chrome/Firefox store listings.

3.  **Deployment**:
    -   Run `cd apps/emotifyai-app && bun run deploy` to push your app configuration to Shopify.
    -   You will need to host the Remix app (e.g., on Vercel, Fly.io, or Shopify's managed hosting if available).

## Troubleshooting

-   **Login Issues**: If `bun create @shopify/app` hangs, try running it manually in a separate terminal:
    ```bash
    cd apps
    bun create @shopify/app@latest --template remix --name emotifyai-app
    ```
-   **Build Errors**: Ensure all dependencies are installed (`bun install` in root and subdirectories).
