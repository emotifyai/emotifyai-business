/**
 * Real Claude Integration Tests — skipped without ANTHROPIC_API_KEY
 */

import { enhanceText, type EnhanceOptions } from '@/lib/ai/claude'
import { validateOutputQuality } from '@/lib/ai/language-detection'

const hasApiKey =
  !!process.env.ANTHROPIC_API_KEY &&
  process.env.ANTHROPIC_API_KEY !== 'your-api-key-here' &&
  process.env.RUN_CLAUDE_INTEGRATION === '1'
const testWithClaude = hasApiKey ? describe : describe.skip

const baseOpts: Omit<EnhanceOptions, 'text'> = {
  outputLanguage: 'en',
  tone: 'marketing',
  platform: 'store',
}

testWithClaude('Real Claude API Integration', () => {
  jest.setTimeout(60000)

  it('should enhance English text', async () => {
    const options: EnhanceOptions = {
      ...baseOpts,
      text: 'this is a simple text that needs improvement',
    }
    const result = await enhanceText(options)
    expect(result.enhancedText.length).toBeGreaterThan(options.text.length)
    expect(result.language).toBe('en')
  })

  it('should enhance Gulf Arabic output', async () => {
    const options: EnhanceOptions = {
      text: 'شوي المنتج زين وايد',
      outputLanguage: 'ar_gulf',
      tone: 'emotional',
      platform: 'whatsapp',
    }
    const result = await enhanceText(options)
    expect(result.enhancedText).toMatch(/[\u0600-\u06FF]/)
    expect(result.language).toBe('ar_gulf')
  })

  it('should pass quality validation', async () => {
    const options: EnhanceOptions = {
      ...baseOpts,
      text: 'i need help with my project deadline is tomorrow',
    }
    const result = await enhanceText(options)
    const qualityCheck = validateOutputQuality(options.text, result.enhancedText, 'en')
    expect(qualityCheck.isValid).toBe(true)
  })
})

if (!hasApiKey) {
  describe('Claude API Integration (Skipped)', () => {
    it('skips without API key', () => {
      expect(true).toBe(true)
    })
  })
}
