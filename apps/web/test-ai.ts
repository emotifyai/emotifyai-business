import { enhanceTextStream } from './lib/ai/claude';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load env vars
config({ path: resolve(process.cwd(), 'apps/web/.env.local') });

async function main() {
  console.log('Testing AI with "عطر فرنسي"...');
  try {
    const result = await enhanceTextStream({
      text: 'عطر فرنسي',
      outputLanguage: 'ar_gulf',
      tone: 'marketing',
      platform: 'store',
      strength: 5
    }, (delta) => {
      process.stdout.write(delta);
    });
    console.log('\n\nResult:', result);
  } catch (error) {
    console.error('\n\nError caught:', error);
  }
}

main().catch(console.error);
