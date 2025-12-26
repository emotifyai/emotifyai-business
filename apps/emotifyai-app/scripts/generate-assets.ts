#!/usr/bin/env bun
/**
 * Asset Generation Script for Shopify Application
 * 
 * Generates all required Shopify App Store assets and icons
 * Run with: bun run generate:assets
 */

import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const PUBLIC_DIR = join(process.cwd(), 'public');
const LOGO_PATH = join(process.cwd(), '..', '..', 'assets', 'logo.svg');

// Shopify asset configurations
const SHOPIFY_ASSETS = [
    { name: 'app-icon', width: 1024, height: 1024 },
    { name: 'app-icon-small', width: 512, height: 512 },
    { name: 'favicon', width: 32, height: 32 }
];

const STORE_LISTING_IMAGES = [
    { name: 'screenshot-1280x800', width: 1280, height: 800 },
    { name: 'banner-1600x400', width: 1600, height: 400 }
];

/**
 * Generate Shopify Assets
 */
async function generateShopifyAssets(): Promise<void> {
    console.log('\n🛍️ Generating Shopify App Assets...\n');

    await mkdir(PUBLIC_DIR, { recursive: true });

    for (const config of SHOPIFY_ASSETS) {
        const outputPath = join(PUBLIC_DIR, `${config.name}.png`);

        await sharp(LOGO_PATH)
            .resize(config.width, config.height, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .png()
            .toFile(outputPath);

        console.log(`  ✓ ${config.name}.png created (${config.width}x${config.height})`);
    }
}

/**
 * Generate Store Listing Images
 */
async function generateStoreListing(): Promise<void> {
    console.log('\n🏪 Generating Shopify Store Listing Images...\n');

    const storeDir = join(PUBLIC_DIR, 'store');
    await mkdir(storeDir, { recursive: true });

    for (const config of STORE_LISTING_IMAGES) {
        const outputPath = join(storeDir, `${config.name}.png`);

        await sharp(LOGO_PATH)
            .resize(config.width, config.height, {
                fit: 'contain',
                background: { r: 15, g: 23, b: 42, alpha: 1 } // Dark background consistent with Verba branding
            })
            .png()
            .toFile(outputPath);

        console.log(`  ✓ ${config.name}.png created (${config.width}x${config.height})`);
    }
}

/**
 * Main execution
 */
async function main() {
    console.log('🎨 EmotifyAI Shopify App Asset Generation Script\n');
    console.log('============================================\n');

    try {
        await mkdir(PUBLIC_DIR, { recursive: true });

        // Generate all assets
        await generateShopifyAssets();
        await generateStoreListing();

        console.log('\n✅ All Shopify assets generated successfully!\n');
        console.log('📁 Assets locations:');
        console.log(`  - Icons: ${PUBLIC_DIR}`);
        console.log(`  - Store Images: ${join(PUBLIC_DIR, 'store')}`);
    } catch (error) {
        console.error('\n❌ Asset generation failed:', error);
        process.exit(1);
    }
}

main().then(r => r);
