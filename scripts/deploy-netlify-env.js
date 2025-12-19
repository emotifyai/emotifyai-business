#!/usr/bin/env node

/**
 * Netlify Environment Variables Deployment Script
 * 
 * This script:
 * 1. Checks if Netlify CLI is installed
 * 2. Verifies user is logged in
 * 3. Confirms project is linked
 * 4. Reads environment variables from .env file
 * 5. Sets them one by one on Netlify
 * 6. Reports success/failure for each variable
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
    PROJECT_NAME: 'bright-marzipan-1b48f4',
    ENV_FILE: '.env', // Can be changed to '.env.production' later
    BASE_PATH: path.join(__dirname, '..', 'apps', 'web'),
    REQUIRED_NODE_ENV: 'production'
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
    log(`[${step}] ${message}`, 'cyan');
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

/**
 * Execute command and return result
 */
function executeCommand(command, options = {}) {
    try {
        const result = execSync(command, { 
            encoding: 'utf8', 
            stdio: options.silent ? 'pipe' : 'inherit',
            ...options 
        });
        return { success: true, output: result };
    } catch (error) {
        return { 
            success: false, 
            error: error.message, 
            output: error.stdout || error.stderr || '' 
        };
    }
}

/**
 * Check if Netlify CLI is installed
 */
function checkNetlifyCLI() {
    logStep('1/5', 'Checking Netlify CLI installation...');
    
    // Try npx first, then global installation
    let result = executeCommand('npx netlify --version', { silent: true });
    
    if (result.success) {
        const version = result.output.trim();
        logSuccess(`Netlify CLI installed (via npx): ${version}`);
        return 'npx netlify';
    }
    
    // Fallback to global installation
    result = executeCommand('netlify --version', { silent: true });
    
    if (result.success) {
        const version = result.output.trim();
        logSuccess(`Netlify CLI installed (global): ${version}`);
        return 'netlify';
    }
    
    logError('Netlify CLI not found. Please install it with: npm install netlify-cli');
    return false;
}

/**
 * Check if user is logged in to Netlify
 */
function checkNetlifyAuth(cliCommand) {
    logStep('2/5', 'Checking Netlify authentication...');
    
    const result = executeCommand(`${cliCommand} status`, { silent: true });
    
    // Check for both old and new output formats
    if (result.output && (result.output.includes('Email:') || result.output.includes('Logged in as'))) {
        // Try to extract email from new format
        let emailMatch = result.output.match(/Email:\s*(.+)/);
        if (!emailMatch) {
            // Try old format
            emailMatch = result.output.match(/Logged in as (.+)/);
        }
        const email = emailMatch ? emailMatch[1].trim() : 'unknown';
        logSuccess(`Logged in as: ${email}`);
        return true;
    } else {
        logError(`Not logged in to Netlify. Please run: ${cliCommand} login`);
        return false;
    }
}

/**
 * Check if project is linked
 */
function checkProjectLink(cliCommand) {
    logStep('3/5', `Checking project link to ${CONFIG.PROJECT_NAME}...`);
    
    const result = executeCommand(`${cliCommand} status`, { silent: true });
    
    // Check if already linked (even if command returns error)
    if (result.output && result.output.includes(CONFIG.PROJECT_NAME)) {
        logSuccess(`Project linked to: ${CONFIG.PROJECT_NAME}`);
        return true;
    }
    
    // If not linked, try to link with filter to avoid interactive prompt
    logWarning(`Project not linked to ${CONFIG.PROJECT_NAME}. Attempting to link...`);
    const linkResult = executeCommand(`${cliCommand} link --name ${CONFIG.PROJECT_NAME} --filter emotifyai-web`, { silent: true });
    
    if (linkResult.success || (linkResult.output && (linkResult.output.includes('Linked to') || linkResult.output.includes('Project already linked')))) {
        logSuccess(`Successfully linked to: ${CONFIG.PROJECT_NAME}`);
        return true;
    } else {
        logError(`Failed to link to ${CONFIG.PROJECT_NAME}. Please check the project name.`);
        logError(`Error: ${linkResult.error || linkResult.output}`);
        return false;
    }
}

/**
 * Parse .env file safely
 */
function parseEnvFile(filePath) {
    logStep('4/5', `Reading environment variables from ${filePath}...`);
    
    if (!fs.existsSync(filePath)) {
        logError(`Environment file not found: ${filePath}`);
        return null;
    }

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const envVars = {};
        let lineNumber = 0;

        content.split('\n').forEach(line => {
            lineNumber++;
            line = line.trim();
            
            // Skip empty lines and comments
            if (!line || line.startsWith('#')) return;
            
            // Parse KEY=VALUE format
            const match = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
            if (match) {
                const [, key, value] = match;
                // Remove quotes if present
                const cleanValue = value.replace(/^["']|["']$/g, '');
                envVars[key] = cleanValue;
            }
        });

        // Check if NODE_ENV is production (if specified)
        if (CONFIG.REQUIRED_NODE_ENV && envVars.NODE_ENV !== CONFIG.REQUIRED_NODE_ENV) {
            logWarning(`NODE_ENV is '${envVars.NODE_ENV}', expected '${CONFIG.REQUIRED_NODE_ENV}'`);
            // Set it to production for deployment
            envVars.NODE_ENV = CONFIG.REQUIRED_NODE_ENV;
        }

        logSuccess(`Parsed ${Object.keys(envVars).length} environment variables`);
        return envVars;
    } catch (error) {
        logError(`Failed to parse .env file: ${error.message}`);
        return null;
    }
}

/**
 * Perform comprehensive integrity check
 */
async function performIntegrityCheck(originalEnvVars, cliCommand) {
    logStep('6/6', 'Performing integrity check...');
    
    try {
        // Get current environment variables from Netlify in JSON format
        const result = executeCommand(`${cliCommand} env:list --json --filter emotifyai-web`, { silent: true });
        
        if (!result.success) {
            logError(`Failed to retrieve environment variables: ${result.error}`);
            return { success: false, details: 'Failed to retrieve variables' };
        }

        let netlifyEnvVars;
        try {
            netlifyEnvVars = JSON.parse(result.output);
        } catch (parseError) {
            logError(`Failed to parse JSON response: ${parseError.message}`);
            return { success: false, details: 'Invalid JSON response' };
        }

        // Convert Netlify response to key-value pairs for comparison
        const netlifyVars = {};
        if (Array.isArray(netlifyEnvVars)) {
            netlifyEnvVars.forEach(envVar => {
                if (envVar.key && envVar.values && envVar.values.length > 0) {
                    // Use the first (most recent) value
                    netlifyVars[envVar.key] = envVar.values[0].value;
                }
            });
        }

        log(`📊 Integrity Check Results:`, 'cyan');
        log(`  Local variables: ${Object.keys(originalEnvVars).length}`, 'blue');
        log(`  Netlify variables: ${Object.keys(netlifyVars).length}`, 'blue');

        const issues = {
            missing: [],
            mismatch: [],
            extra: []
        };

        // Check for missing variables
        for (const [key, expectedValue] of Object.entries(originalEnvVars)) {
            if (!(key in netlifyVars)) {
                issues.missing.push(key);
            } else if (netlifyVars[key] !== expectedValue) {
                // Only report mismatch for non-sensitive variables
                const isSensitive = ['API_KEY', 'SECRET', 'PASSWORD', 'TOKEN'].some(sensitive => key.includes(sensitive));
                if (!isSensitive) {
                    issues.mismatch.push({
                        key,
                        expected: expectedValue,
                        actual: netlifyVars[key]
                    });
                } else {
                    // For sensitive variables, just check if they exist and are not empty
                    if (!netlifyVars[key] || netlifyVars[key].trim() === '') {
                        issues.mismatch.push({
                            key,
                            expected: '[HIDDEN]',
                            actual: '[EMPTY]'
                        });
                    }
                }
            }
        }

        // Check for extra variables (variables on Netlify that weren't in our .env)
        for (const key of Object.keys(netlifyVars)) {
            if (!(key in originalEnvVars)) {
                issues.extra.push(key);
            }
        }

        // Report results
        let hasIssues = false;

        if (issues.missing.length > 0) {
            hasIssues = true;
            logError(`Missing variables (${issues.missing.length}):`);
            issues.missing.forEach(key => log(`  - ${key}`, 'red'));
        }

        if (issues.mismatch.length > 0) {
            hasIssues = true;
            logError(`Value mismatches (${issues.mismatch.length}):`);
            issues.mismatch.forEach(({ key, expected, actual }) => {
                log(`  - ${key}:`, 'red');
                log(`    Expected: ${expected}`, 'red');
                log(`    Actual:   ${actual}`, 'red');
            });
        }

        if (issues.extra.length > 0) {
            logWarning(`Extra variables on Netlify (${issues.extra.length}):`);
            issues.extra.forEach(key => log(`  - ${key}`, 'yellow'));
        }

        if (!hasIssues) {
            logSuccess('✅ All environment variables match perfectly!');
            
            // Additional checks for critical variables
            const criticalVars = [
                'NEXT_PUBLIC_SUPABASE_URL',
                'NEXT_PUBLIC_SUPABASE_ANON_KEY',
                'SUPABASE_SERVICE_ROLE_KEY',
                'ANTHROPIC_API_KEY',
                'NEXT_PUBLIC_APP_URL',
                'NODE_ENV'
            ];

            const missingCritical = criticalVars.filter(key => !(key in netlifyVars));
            if (missingCritical.length > 0) {
                logError(`Missing critical variables: ${missingCritical.join(', ')}`);
                return { success: false, details: 'Missing critical variables' };
            }

            // Check NODE_ENV is production
            if (netlifyVars.NODE_ENV !== 'production') {
                logWarning(`NODE_ENV is '${netlifyVars.NODE_ENV}', expected 'production'`);
            }

            logSuccess('✅ All critical environment variables are present and configured');
        }

        return {
            success: !hasIssues,
            details: {
                total: Object.keys(originalEnvVars).length,
                deployed: Object.keys(netlifyVars).length,
                missing: issues.missing.length,
                mismatched: issues.mismatch.length,
                extra: issues.extra.length
            }
        };

    } catch (error) {
        logError(`Integrity check failed: ${error.message}`);
        return { success: false, details: error.message };
    }
}

/**
 * Set environment variables on Netlify
 */
async function setNetlifyEnvVars(envVars, cliCommand) {
    logStep('5/5', 'Setting environment variables on Netlify...');
    
    const results = {
        success: [],
        failed: [],
        total: Object.keys(envVars).length
    };

    // Filter out sensitive variables that shouldn't be logged
    const sensitiveKeys = ['API_KEY', 'SECRET', 'PASSWORD', 'TOKEN'];
    
    for (const [key, value] of Object.entries(envVars)) {
        try {
            // Check if this is a sensitive variable
            const isSensitive = sensitiveKeys.some(sensitive => key.includes(sensitive));
            const displayValue = isSensitive ? '[HIDDEN]' : value;
            
            log(`  Setting ${key}=${displayValue}...`, 'blue');
            
            // Use key=value syntax to avoid issues with negative values
            const result = executeCommand(`${cliCommand} env:set ${key}="${value}" --filter emotifyai-web`, { silent: true });
            
            if (result.success) {
                results.success.push(key);
                log(`    ✅ ${key} set successfully`, 'green');
            } else {
                results.failed.push({ key, error: result.error });
                log(`    ❌ Failed to set ${key}: ${result.error}`, 'red');
            }
        } catch (error) {
            results.failed.push({ key, error: error.message });
            log(`    ❌ Failed to set ${key}: ${error.message}`, 'red');
        }
    }

    return results;
}

/**
 * Main execution function
 */
async function main() {
    log('\n🚀 Netlify Environment Variables Deployment Script', 'magenta');
    log('=' .repeat(60), 'magenta');
    
    try {
        // Step 1: Check Netlify CLI
        const cliCommand = checkNetlifyCLI();
        if (!cliCommand) {
            process.exit(1);
        }

        // Step 2: Check authentication
        if (!checkNetlifyAuth(cliCommand)) {
            process.exit(1);
        }

        // Step 3: Check project link
        if (!checkProjectLink(cliCommand)) {
            process.exit(1);
        }

        // Step 4: Read environment variables
        const envFilePath = path.join(CONFIG.BASE_PATH, CONFIG.ENV_FILE);
        const envVars = parseEnvFile(envFilePath);
        
        if (!envVars) {
            process.exit(1);
        }

        // Step 5: Set environment variables
        const results = await setNetlifyEnvVars(envVars, cliCommand);

        // Final report
        log('\n📊 Deployment Summary', 'magenta');
        log('=' .repeat(30), 'magenta');
        logSuccess(`Successfully set: ${results.success.length}/${results.total} variables`);
        
        if (results.failed.length > 0) {
            logError(`Failed to set: ${results.failed.length} variables`);
            results.failed.forEach(({ key, error }) => {
                log(`  - ${key}: ${error}`, 'red');
            });
        }

        // Step 6: Perform integrity check
        const integrityResult = await performIntegrityCheck(envVars, cliCommand);
        
        if (!integrityResult.success) {
            logError('Integrity check failed! Some variables may not have been set correctly.');
            if (integrityResult.details && typeof integrityResult.details === 'object') {
                log(`\nIntegrity Summary:`, 'yellow');
                log(`  Total expected: ${integrityResult.details.total}`, 'yellow');
                log(`  Actually deployed: ${integrityResult.details.deployed}`, 'yellow');
                log(`  Missing: ${integrityResult.details.missing}`, 'yellow');
                log(`  Mismatched: ${integrityResult.details.mismatched}`, 'yellow');
                log(`  Extra: ${integrityResult.details.extra}`, 'yellow');
            }
            process.exit(1);
        }

        // Suggest next steps
        log('\n🎯 Next Steps:', 'cyan');
        log('1. Verify variables in Netlify dashboard: Site Settings → Environment Variables');
        log('2. Update Lemon Squeezy variables with your real API keys');
        log(`3. Trigger a new deployment: ${cliCommand} deploy --prod`);
        log(`4. Check your site: https://${CONFIG.PROJECT_NAME}.netlify.app`);

        process.exit(results.failed.length > 0 ? 1 : 0);

    } catch (error) {
        logError(`Unexpected error: ${error.message}`);
        process.exit(1);
    }
}

// Run the script
main();