# Deployment Scripts

## Netlify Environment Variables Deployment

### `deploy-netlify-env.js`

Automatically deploys environment variables from your `.env` file to Netlify.

#### Features:
- ✅ Checks Netlify CLI installation
- ✅ Verifies authentication status  
- ✅ Confirms project linking
- ✅ Safely reads `.env` file
- ✅ Sets variables one by one with error handling
- ✅ Hides sensitive values in logs
- ✅ Provides detailed success/failure report

#### Usage:

```bash
# From project root
bun run deploy:netlify-env

# Or directly
node scripts/deploy-netlify-env.js
```

#### Configuration:

Edit the `CONFIG` object in the script to customize:

```javascript
const CONFIG = {
    PROJECT_NAME: 'bright-marzipan-1b48f4',  // Your Netlify project name
    ENV_FILE: '.env',                        // Can change to '.env.production'
    BASE_PATH: path.join(__dirname, '..', 'apps', 'web'),
    REQUIRED_NODE_ENV: 'production'
};
```

#### Prerequisites:

1. **Netlify CLI installed**: `npm install -g netlify-cli`
2. **Logged in**: `netlify login`
3. **Project exists**: Your Netlify project should exist
4. **Environment file**: `.env` file in `apps/web/` directory

#### What it does:

1. **Validation Phase**:
   - Checks if `netlify` command is available
   - Verifies you're logged in to Netlify
   - Confirms project is linked (auto-links if needed)

2. **Reading Phase**:
   - Parses `.env` file safely
   - Skips comments and empty lines
   - Removes quotes from values
   - Forces `NODE_ENV=production` for deployment

3. **Deployment Phase**:
   - Sets each variable individually
   - Hides sensitive values (API_KEY, SECRET, PASSWORD, TOKEN) in logs
   - Reports success/failure for each variable
   - Provides final summary

#### Example Output:

```
🚀 Netlify Environment Variables Deployment Script
============================================================

[1/5] Checking Netlify CLI installation...
✅ Netlify CLI installed: netlify-cli/17.10.1

[2/5] Checking Netlify authentication...
✅ Logged in as: your-email@example.com

[3/5] Checking project link to bright-marzipan-1b48f4...
✅ Project linked to: bright-marzipan-1b48f4

[4/5] Reading environment variables from apps/web/.env...
✅ Parsed 25 environment variables

[5/5] Setting environment variables on Netlify...
  Setting NEXT_PUBLIC_APP_URL=https://bright-marzipan-1b48f4.netlify.app...
    ✅ NEXT_PUBLIC_APP_URL set successfully
  Setting ANTHROPIC_API_KEY=[HIDDEN]...
    ✅ ANTHROPIC_API_KEY set successfully

📊 Deployment Summary
==============================
✅ Successfully set: 25/25 variables

🎯 Next Steps:
1. Verify variables in Netlify dashboard: Site Settings → Environment Variables
2. Update Lemon Squeezy variables with your real API keys
3. Trigger a new deployment: netlify deploy --prod
4. Check your site: https://bright-marzipan-1b48f4.netlify.app
```

#### Security Features:

- **Sensitive Value Hiding**: API keys, secrets, passwords, and tokens are shown as `[HIDDEN]` in logs
- **Safe Parsing**: Handles malformed `.env` files gracefully
- **Error Handling**: Continues processing even if individual variables fail
- **No Hardcoded Secrets**: All sensitive data comes from your `.env` file

#### Troubleshooting:

- **"Netlify CLI not found"**: Install with `npm install -g netlify-cli`
- **"Not logged in"**: Run `netlify login` and follow the prompts
- **"Project not found"**: Check the `PROJECT_NAME` in the config matches your Netlify site name
- **"Environment file not found"**: Ensure `.env` exists in `apps/web/` directory