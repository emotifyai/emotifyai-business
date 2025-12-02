#!/usr/bin/env bun
/**
 * Asset Generation Script for Web Application
 * 
 * Generates all required favicon and OG images from a source logo
 * Run with: bun run generate:assets
 */

import sharp from 'sharp';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

const PUBLIC_DIR = join(process.cwd(), 'public');
const LOGO_PATH = join(process.cwd(), '..', '..', 'assets', 'logo.svg');

// Asset configurations
const FAVICON_SIZES = [16, 32, 48, 64, 128, 256];
const APPLE_TOUCH_SIZES = [57, 60, 72, 76, 114, 120, 144, 152, 180];
const ANDROID_SIZES = [192, 512];
const MS_TILE_SIZES = [144, 310];

interface AssetConfig {
    name: string;
    width: number;
    height: number;
    format: 'png' | 'ico' | 'svg';
}

/**
 * Generate a single asset
 */
async function generateAsset(config: AssetConfig, outputPath: string): Promise<void> {
    console.log(`Generating ${config.name}...`);

    try {
        if (config.format === 'svg') {
            // Copy SVG as-is
            const { readFile } = await import('fs/promises');
            const svgContent = await readFile(LOGO_PATH);
            await writeFile(outputPath, svgContent);
        } else {
            // Generate PNG/ICO from SVG
            const image = sharp(LOGO_PATH)
                .resize(config.width, config.height, {
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                });

            if (config.format === 'png') {
                await image.png({ quality: 100 }).toFile(outputPath);
            } else if (config.format === 'ico') {
                // Convert to PNG first, then to ICO
                await image.png().toFile(outputPath.replace('.ico', '.png'));
                console.log(`  Note: ICO format requires manual conversion from PNG`);
            }
        }

        console.log(`  ✓ ${config.name} created`);
    } catch (error) {
        console.error(`  ✗ Failed to generate ${config.name}:`, error);
        throw error;
    }
}

/**
 * Generate all favicons
 */
async function generateFavicons(): Promise<void> {
    console.log('\n📱 Generating Favicons...\n');

    for (const size of FAVICON_SIZES) {
        await generateAsset(
            {
                name: `favicon-${size}x${size}.png`,
                width: size,
                height: size,
                format: 'png'
            },
            join(PUBLIC_DIR, `favicon-${size}x${size}.png`)
        );
    }

    // Generate main favicon.ico (16x16)
    await generateAsset(
        {
            name: 'favicon.ico',
            width: 16,
            height: 16,
            format: 'ico'
        },
        join(PUBLIC_DIR, 'favicon.ico')
    );
}

/**
 * Generate Apple Touch Icons
 */
async function generateAppleTouchIcons(): Promise<void> {
    console.log('\n🍎 Generating Apple Touch Icons...\n');

    for (const size of APPLE_TOUCH_SIZES) {
        await generateAsset(
            {
                name: `apple-touch-icon-${size}x${size}.png`,
                width: size,
                height: size,
                format: 'png'
            },
            join(PUBLIC_DIR, `apple-touch-icon-${size}x${size}.png`)
        );
    }

    // Generate default apple-touch-icon (180x180)
    await generateAsset(
        {
            name: 'apple-touch-icon.png',
            width: 180,
            height: 180,
            format: 'png'
        },
        join(PUBLIC_DIR, 'apple-touch-icon.png')
    );
}

/**
 * Generate Android Chrome Icons
 */
async function generateAndroidIcons(): Promise<void> {
    console.log('\n🤖 Generating Android Chrome Icons...\n');

    for (const size of ANDROID_SIZES) {
        await generateAsset(
            {
                name: `android-chrome-${size}x${size}.png`,
                width: size,
                height: size,
                format: 'png'
            },
            join(PUBLIC_DIR, `android-chrome-${size}x${size}.png`)
        );
    }
}

/**
 * Generate MS Tile Images
 */
async function generateMSTiles(): Promise<void> {
    console.log('\n🪟 Generating MS Tile Images...\n');

    for (const size of MS_TILE_SIZES) {
        await generateAsset(
            {
                name: `mstile-${size}x${size}.png`,
                width: size,
                height: size,
                format: 'png'
            },
            join(PUBLIC_DIR, `mstile-${size}x${size}.png`)
        );
    }
}

/**
 * Generate OG and Twitter Card Images
 */
async function generateSocialImages(): Promise<void> {
    console.log('\n🌐 Generating Social Media Images...\n');

    // OG Image (1200x630)
    await sharp(LOGO_PATH)
        .resize(1200, 630, {
            fit: 'contain',
            background: { r: 15, g: 23, b: 42, alpha: 1 } // Dark background
        })
        .png()
        .toFile(join(PUBLIC_DIR, 'og-image.png'));
    console.log('  ✓ og-image.png created');

    // Twitter Card (1200x600)
    await sharp(LOGO_PATH)
        .resize(1200, 600, {
            fit: 'contain',
            background: { r: 15, g: 23, b: 42, alpha: 1 }
        })
        .png()
        .toFile(join(PUBLIC_DIR, 'twitter-card.png'));
    console.log('  ✓ twitter-card.png created');
}

/**
 * Main execution
 */
async function main() {
    console.log('🎨 Verba Asset Generation Script\n');
    console.log('================================\n');

    try {
        // Ensure public directory exists
        await mkdir(PUBLIC_DIR, { recursive: true });

        // Generate all assets
        await generateFavicons();
        await generateAppleTouchIcons();
        await generateAndroidIcons();
        await generateMSTiles();
        await generateSocialImages();

        console.log('\n✅ All assets generated successfully!\n');
        console.log('📁 Assets location:', PUBLIC_DIR);
        console.log('\n💡 Next steps:');
        console.log('  1. Review generated assets in public/ directory');
        console.log('  2. Manually convert favicon-16x16.png to favicon.ico if needed');
        console.log('  3. Update manifest.json with new icon paths');
    } catch (error) {
        console.error('\n❌ Asset generation failed:', error);
        process.exit(1);
    }
}

main().then(r => r);
