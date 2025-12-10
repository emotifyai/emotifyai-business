#!/usr/bin/env node

/**
 * OAuth Configuration Testing Script
 * 
 * This script validates OAuth configuration for production deployment
 * Run with: node scripts/test-oauth-config.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const DOMAIN = 'emotifyai.com';
const EXPECTED_URLS = [
  `https://${DOMAIN}`,
  `https://${DOMAIN}/auth/callback`,
  `https://${DOMAIN}/api/auth/session`,
  `https://${DOMAIN}/api/enhance`,
];

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  console.log('\n' + '='.repeat(60));
  log(message, 'bold');
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

/**
 * Check if environment files exist and have required variables
 */
function checkEnvironmentFiles() {
  logHeader('Checking Environment Configuration');
  
  const envFiles = [
    'apps/web/.env.production.example',
    'apps/extension/.env.production.example'
  ];
  
  const requiredVars = {
    web: [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXT_PUBLIC_APP_URL',
      'NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID'
    ],
    extension: [
      'VITE_API_BASE_URL',
      'VITE_OAUTH_CLIENT_ID',
      'VITE_WEB_APP_URL'
    ]
  };
  
  envFiles.forEach((filePath, index) => {
    const appType = index === 0 ? 'web' : 'extension';
    
    if (fs.existsSync(filePath)) {
      logSuccess(`Found ${filePath}`);
      
      const content = fs.readFileSync(filePath, 'utf8');
      const vars = requiredVars[appType];
      
      vars.forEach(varName => {
        if (content.includes(varName)) {
          logSuccess(`  ${varName} is defined`);
        } else {
          logError(`  ${varName} is missing`);
        }
      });
      
      // Check for emotifyai.com domain usage
      if (content.includes('emotifyai.com')) {
        logSuccess(`  Uses emotifyai.com domain`);
      } else {
        logWarning(`  May not be using emotifyai.com domain`);
      }
      
    } else {
      logError(`Missing ${filePath}`);
    }
  });
}

/**
 * Check OAuth redirect URIs configuration
 */
function checkOAuthConfiguration() {
  logHeader('OAuth Configuration Checklist');
  
  logInfo('Required Google Cloud Console Configuration:');
  console.log('\n📋 Authorized Redirect URIs:');
  console.log(`   • https://${DOMAIN}/auth/callback`);
  console.log(`   • https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback`);
  console.log(`   • chrome-extension://YOUR_EXTENSION_ID/ (after publishing)`);
  console.log(`   • moz-extension://YOUR_EXTENSION_ID/ (after publishing)`);
  
  console.log('\n📋 Authorized JavaScript Origins:');
  console.log(`   • https://${DOMAIN}`);
  
  console.log('\n📋 Supabase Auth Configuration:');
  console.log(`   • Site URL: https://${DOMAIN}`);
  console.log(`   • Redirect URLs: https://${DOMAIN}/auth/callback`);
  console.log(`   • Google OAuth provider enabled`);
  
  logWarning('Manual verification required - check Google Cloud Console and Supabase settings');
}

/**
 * Test URL accessibility (basic connectivity test)
 */
function testUrlAccessibility(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname,
      method: 'HEAD',
      timeout: 5000
    };
    
    const req = https.request(options, (res) => {
      resolve({
        url,
        status: res.statusCode,
        accessible: res.statusCode < 500
      });
    });
    
    req.on('error', (err) => {
      resolve({
        url,
        status: null,
        accessible: false,
        error: err.message
      });
    });
    
    req.on('timeout', () => {
      resolve({
        url,
        status: null,
        accessible: false,
        error: 'Timeout'
      });
    });
    
    req.end();
  });
}

/**
 * Test production URLs
 */
async function testProductionUrls() {
  logHeader('Testing Production URL Accessibility');
  
  logInfo('Testing basic connectivity to production URLs...');
  
  for (const url of EXPECTED_URLS) {
    const result = await testUrlAccessibility(url);
    
    if (result.accessible) {
      logSuccess(`${url} - Status: ${result.status}`);
    } else {
      logError(`${url} - ${result.error || 'Not accessible'}`);
    }
  }
  
  logWarning('Note: Some endpoints may return errors until fully deployed');
}

/**
 * Check extension manifest configuration
 */
function checkExtensionManifest() {
  logHeader('Extension Manifest Configuration');
  
  const manifestPath = 'apps/extension/wxt.config.ts';
  
  if (fs.existsSync(manifestPath)) {
    logSuccess(`Found ${manifestPath}`);
    
    const content = fs.readFileSync(manifestPath, 'utf8');
    
    // Check for required permissions
    const requiredPermissions = ['identity', 'storage', 'contextMenus'];
    requiredPermissions.forEach(permission => {
      if (content.includes(`'${permission}'`)) {
        logSuccess(`  Permission '${permission}' is included`);
      } else {
        logError(`  Permission '${permission}' is missing`);
      }
    });
    
    // Check for emotifyai.com in host_permissions
    if (content.includes('emotifyai.com')) {
      logSuccess(`  Host permission for emotifyai.com is configured`);
    } else {
      logError(`  Host permission for emotifyai.com is missing`);
    }
    
    // Check for EmotifyAI branding
    if (content.includes('EmotifyAI')) {
      logSuccess(`  Extension name uses EmotifyAI branding`);
    } else {
      logWarning(`  Extension name may not use EmotifyAI branding`);
    }
    
  } else {
    logError(`Missing ${manifestPath}`);
  }
}

/**
 * Generate deployment checklist
 */
function generateDeploymentChecklist() {
  logHeader('Production Deployment Checklist');
  
  console.log('\n🚀 Pre-Deployment Steps:');
  console.log('   □ Google OAuth client configured with production URLs');
  console.log('   □ Supabase OAuth provider enabled and configured');
  console.log('   □ Web app environment variables updated for production');
  console.log('   □ Extension environment variables updated for production');
  console.log('   □ DNS and SSL certificates configured for emotifyai.com');
  console.log('   □ All placeholder values replaced with actual credentials');
  
  console.log('\n📱 Extension Publishing:');
  console.log('   □ Extension built with production environment');
  console.log('   □ Extension submitted to Chrome Web Store');
  console.log('   □ Extension submitted to Firefox Add-ons');
  console.log('   □ Extension ID updated in environment variables after approval');
  console.log('   □ Extension redirect URIs added to Google OAuth client');
  
  console.log('\n🌐 Web App Deployment:');
  console.log('   □ Web app deployed to production hosting');
  console.log('   □ Environment variables configured on hosting platform');
  console.log('   □ Database migrations run on production database');
  console.log('   □ Webhook endpoints configured in external services');
  
  console.log('\n✅ Post-Deployment Verification:');
  console.log('   □ OAuth login works from web app');
  console.log('   □ OAuth login works from extension');
  console.log('   □ Token synchronization works between platforms');
  console.log('   □ Cross-platform logout functionality works');
  console.log('   □ All API endpoints respond correctly');
  console.log('   □ External service integrations work (Lemon Squeezy, etc.)');
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 EmotifyAI OAuth Configuration Validator\n');
  
  try {
    checkEnvironmentFiles();
    checkOAuthConfiguration();
    checkExtensionManifest();
    await testProductionUrls();
    generateDeploymentChecklist();
    
    logHeader('Summary');
    logInfo('Configuration validation complete!');
    logWarning('Manual verification of external services (Google, Supabase) is required');
    logInfo('See docs/oauth-production-setup.md for detailed setup instructions');
    
  } catch (error) {
    logError(`Script failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  checkEnvironmentFiles,
  checkOAuthConfiguration,
  testProductionUrls,
  checkExtensionManifest,
  generateDeploymentChecklist
};