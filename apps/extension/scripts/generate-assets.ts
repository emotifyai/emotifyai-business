#!/usr/bin/env bun
/**
 * Asset Generation Script for Browser Extension
 * 
 * Generates all required extension icons and store listing images
 * Run with: bun run generate:assets
 */

import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const PUBLIC_DIR = join(process.cwd(), 'public');
const ICON_DIR = join(PUBLIC_DIR, 'icon');
const LOGO_PATH = join(process.cwd(), '..', '..', 'assets', 'logo.svg');

// Extension icon sizes (required by Chrome/Firefox)
const EXTENSION_ICON_SIZES = [16, 32, 48, 96, 128];

// Store listing image sizes
const STORE_LISTING_SIZES = [
    { name: 'screenshot-1280x800', width: 1280, height: 800 },
    { name: 'screenshot-640x400', width: 640, height: 400 }
];

const PROMOTIONAL_TILES = [
    { name: 'promo-440x280', width: 440, height: 280 },
    { name: 'promo-920x680', width: 920, height: 680 },
    { name: 'promo-1400x560', width: 1400, height: 560 }
];

/**
 * Generate extension icons
 */
async function generateExtensionIcons(): Promise<void> {
    console.log('\n🧩 Generating Extension Icons...\n');

    await mkdir(ICON_DIR, { recursive: true });

    for (const size of EXTENSION_ICON_SIZES) {
        const outputPath = join(ICON_DIR, `${size}.png`);

        await sharp(LOGO_PATH)
            .resize(size, size, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .png({ quality: 100 })
            .toFile(outputPath);

        console.log(`  ✓ ${size}x${size}.png created`);
    }
}

/**
 * Generate store listing images
 */
async function generateStoreListingImages(): Promise<void> {
    console.log('\n🏪 Generating Store Listing Images...\n');

    const storeDir = join(PUBLIC_DIR, 'store');
    await mkdir(storeDir, { recursive: true });

    for (const config of STORE_LISTING_SIZES) {
        const outputPath = join(storeDir, `${config.name}.png`);

        await sharp(LOGO_PATH)
            .resize(config.width, config.height, {
                fit: 'contain',
                background: { r: 15, g: 23, b: 42, alpha: 1 } // Dark background
            })
            .png()
            .toFile(outputPath);

        console.log(`  ✓ ${config.name}.png created`);
    }
}

/**
 * Generate promotional tiles
 */
async function generatePromotionalTiles(): Promise<void> {
    console.log('\n📢 Generating Promotional Tiles...\n');

    const promoDir = join(PUBLIC_DIR, 'promo');
    await mkdir(promoDir, { recursive: true });

    for (const config of PROMOTIONAL_TILES) {
        const outputPath = join(promoDir, `${config.name}.png`);

        await sharp(LOGO_PATH)
            .resize(config.width, config.height, {
                fit: 'contain',
                background: { r: 15, g: 23, b: 42, alpha: 1 }
            })
            .png()
            .toFile(outputPath);

        console.log(`  ✓ ${config.name}.png created`);
    }
}

/**
 * Main execution
 */
async function main() {
    console.log('🎨 Verba Extension Asset Generation Script\n');
    console.log('==========================================\n');

    try {
        // Ensure public directory exists
        await mkdir(PUBLIC_DIR, { recursive: true });

        // Generate all assets
        await generateExtensionIcons();
        await generateStoreListingImages();
        await generatePromotionalTiles();

        console.log('\n✅ All extension assets generated successfully!\n');
        console.log('📁 Assets locations:');
        console.log(`  - Icons: ${ICON_DIR}`);
        console.log(`  - Store: ${join(PUBLIC_DIR, 'store')}`);
        console.log(`  - Promo: ${join(PUBLIC_DIR, 'promo')}`);
        console.log('\n💡 Next steps:');
        console.log('  1. Review generated assets');
        console.log('  2. Update manifest.json icon paths');
        console.log('  3. Use store/promo images for Chrome Web Store listing');
    } catch (error) {
        console.error('\n❌ Asset generation failed:', error);
        process.exit(1);
    }
}

main();
