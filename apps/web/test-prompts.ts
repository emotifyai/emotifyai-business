import { buildEnhancementPrompts } from './lib/ai/prompt-cache';

function testPrompts() {
  const { systemPrompt, userPrompt, routeId } = buildEnhancementPrompts('عطر فرنسي', {
    outputLanguage: 'ar_gulf',
    tone: 'marketing',
    platform: 'store',
    strength: 5
  });

  console.log('--- SYSTEM PROMPT ---');
  console.log(systemPrompt.text);
  console.log('\n--- USER PROMPT ---');
  console.log(userPrompt.text);
  console.log('\n--- ROUTE ID ---');
  console.log(routeId);
}

testPrompts();
