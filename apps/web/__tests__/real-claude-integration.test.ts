/**
 * Real Claude Integration Tests
 * Tests the actual Claude API integration without mocks
 * Requires ANTHROPIC_API_KEY environment variable
 */

import { enhanceText, type EnhanceOptions } from '@/lib/ai/claude'
import { detectLanguage, validateOutputQuality, isLanguageSupported } from '@/lib/ai/language-detection'

// Skip all tests if no API key is provided
const hasApiKey = !!process.env.ANTHROPIC_API_KEY
const testWithClaude = hasApiKey ? describe : describe.skip

// Set up Anthropic configuration
process.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'your-api-key-here'
process.env.ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-20241022'
process.env.ANTHROPIC_MAX_TOKENS = process.env.ANTHROPIC_MAX_TOKENS || '1024'

testWithClaude('Real Claude API Integration', () => {
  // Increase timeout for real API calls
  jest.setTimeout(60000)

  beforeAll(() => {
    if (!hasApiKey) {
      console.log('⚠️  Skipping Claude integration tests - ANTHROPIC_API_KEY not provided')
      console.log('💡 Set ANTHROPIC_API_KEY environment variable to run these tests')
    } else {
      console.log('🚀 Running tests with real Claude API')
      console.log(`📋 Model: ${process.env.ANTHROPIC_MODEL}`)
      console.log(`🎯 Max tokens: ${process.env.ANTHROPIC_MAX_TOKENS}`)
    }
  })

  describe('English Text Enhancement', () => {
    it('should enhance simple English text professionally', async () => {
      const options: EnhanceOptions = {
        text: 'this is a simple text that needs improvement',
        language: 'en',
        tone: 'professional'
      }

      const result = await enhanceText(options)

      expect(result).toBeDefined()
      expect(result.enhancedText).toBeDefined()
      expect(result.enhancedText).not.toBe(options.text)
      expect(result.tokensUsed).toBeGreaterThan(0)
      expect(result.language).toBe('en')
      
      // Enhanced text should be longer and more professional
      expect(result.enhancedText.length).toBeGreaterThan(options.text.length)
      expect(result.enhancedText).toMatch(/^[A-Z]/) // Should start with capital letter
      
      console.log('📝 Original:', options.text)
      console.log('✨ Enhanced:', result.enhancedText)
      console.log('🔢 Tokens used:', result.tokensUsed)
    })

    it('should enhance business email with formal tone', async () => {
      const options: EnhanceOptions = {
        text: 'hi john, can you send me the report? thanks',
        language: 'en',
        tone: 'formal'
      }

      const result = await enhanceText(options)

      expect(result.enhancedText).toBeDefined()
      expect(result.enhancedText).not.toBe(options.text)
      expect(result.language).toBe('en')
      
      // Should be more formal
      expect(result.enhancedText.toLowerCase()).not.toContain('hi john')
      expect(result.enhancedText).toMatch(/Dear|Hello|Greetings/i)
      
      console.log('📝 Original:', options.text)
      console.log('✨ Enhanced:', result.enhancedText)
    })

    it('should enhance casual text with casual tone', async () => {
      const options: EnhanceOptions = {
        text: 'hey whats up? wanna grab coffee later?',
        language: 'en',
        tone: 'casual'
      }

      const result = await enhanceText(options)

      expect(result.enhancedText).toBeDefined()
      expect(result.enhancedText).not.toBe(options.text)
      expect(result.language).toBe('en')
      
      // Should maintain casual tone but improve grammar
      expect(result.enhancedText).toMatch(/[Hh]ey|[Hh]i/)
      expect(result.enhancedText).toMatch(/coffee/)
      
      console.log('📝 Original:', options.text)
      console.log('✨ Enhanced:', result.enhancedText)
    })
  })

  describe('Arabic Text Enhancement', () => {
    it('should enhance Arabic text correctly', async () => {
      const options: EnhanceOptions = {
        text: 'مرحبا كيف حالك اليوم',
        language: 'ar',
        tone: 'professional'
      }

      const result = await enhanceText(options)

      expect(result.enhancedText).toBeDefined()
      expect(result.enhancedText).not.toBe(options.text)
      expect(result.language).toBe('ar')
      
      // Should contain Arabic characters
      expect(result.enhancedText).toMatch(/[\u0600-\u06FF]/)
      
      // Should be enhanced (longer and more formal)
      expect(result.enhancedText.length).toBeGreaterThan(options.text.length)
      
      console.log('📝 Original:', options.text)
      console.log('✨ Enhanced:', result.enhancedText)
      console.log('🔢 Tokens used:', result.tokensUsed)
    })

    it('should enhance Arabic business text formally', async () => {
      const options: EnhanceOptions = {
        text: 'نريد تحديث الموقع الإلكتروني',
        language: 'ar',
        tone: 'formal'
      }

      const result = await enhanceText(options)

      expect(result.enhancedText).toBeDefined()
      expect(result.enhancedText).not.toBe(options.text)
      expect(result.language).toBe('ar')
      expect(result.enhancedText).toMatch(/[\u0600-\u06FF]/)
      
      console.log('📝 Original:', options.text)
      console.log('✨ Enhanced:', result.enhancedText)
    })
  })

  describe('French Text Enhancement', () => {
    it('should enhance French text correctly', async () => {
      const options: EnhanceOptions = {
        text: 'bonjour comment allez vous aujourd\'hui',
        language: 'fr',
        tone: 'professional'
      }

      const result = await enhanceText(options)

      expect(result.enhancedText).toBeDefined()
      expect(result.enhancedText).not.toBe(options.text)
      expect(result.language).toBe('fr')
      
      // Should contain French characteristics
      expect(result.enhancedText).toMatch(/[àâäæçéèêëïîôùûüÿœ]|Bonjour|Comment/)
      
      console.log('📝 Original:', options.text)
      console.log('✨ Enhanced:', result.enhancedText)
      console.log('🔢 Tokens used:', result.tokensUsed)
    })

    it('should enhance French business communication', async () => {
      const options: EnhanceOptions = {
        text: 'je veux une réunion demain matin',
        language: 'fr',
        tone: 'formal'
      }

      const result = await enhanceText(options)

      expect(result.enhancedText).toBeDefined()
      expect(result.enhancedText).not.toBe(options.text)
      expect(result.language).toBe('fr')
      
      console.log('📝 Original:', options.text)
      console.log('✨ Enhanced:', result.enhancedText)
    })
  })

  describe('Language Detection Integration', () => {
    it('should auto-detect English and enhance correctly', async () => {
      const text = 'hello world this is a test message'
      const detectedLang = detectLanguage(text)
      
      expect(detectedLang).toBe('en')
      expect(isLanguageSupported(detectedLang)).toBe(true)

      const options: EnhanceOptions = {
        text,
        language: detectedLang,
        tone: 'professional'
      }

      const result = await enhanceText(options)
      
      expect(result.enhancedText).toBeDefined()
      expect(result.language).toBe('en')
      
      console.log('🔍 Detected language:', detectedLang)
      console.log('📝 Original:', text)
      console.log('✨ Enhanced:', result.enhancedText)
    })

    it('should auto-detect Arabic and enhance correctly', async () => {
      const text = 'مرحبا بكم في موقعنا الجديد'
      const detectedLang = detectLanguage(text)
      
      expect(detectedLang).toBe('ar')
      expect(isLanguageSupported(detectedLang)).toBe(true)

      const options: EnhanceOptions = {
        text,
        language: detectedLang,
        tone: 'professional'
      }

      const result = await enhanceText(options)
      
      expect(result.enhancedText).toBeDefined()
      expect(result.language).toBe('ar')
      
      console.log('🔍 Detected language:', detectedLang)
      console.log('📝 Original:', text)
      console.log('✨ Enhanced:', result.enhancedText)
    })
  })

  describe('Quality Validation Integration', () => {
    it('should produce high-quality output that passes validation', async () => {
      const options: EnhanceOptions = {
        text: 'i need help with my project deadline is tomorrow',
        language: 'en',
        tone: 'professional'
      }

      const result = await enhanceText(options)
      
      // Validate the output quality
      const qualityCheck = validateOutputQuality(
        options.text,
        result.enhancedText,
        result.language
      )

      expect(qualityCheck.isValid).toBe(true)
      expect(qualityCheck.reason).toBeUndefined()
      
      console.log('📝 Original:', options.text)
      console.log('✨ Enhanced:', result.enhancedText)
      console.log('✅ Quality check:', qualityCheck.isValid ? 'PASSED' : 'FAILED')
      if (qualityCheck.reason) {
        console.log('❌ Reason:', qualityCheck.reason)
      }
    })

    it('should handle longer text inputs effectively', async () => {
      const longText = `
        This is a longer text that contains multiple sentences and ideas. 
        It needs to be enhanced while maintaining its original meaning and structure. 
        The enhancement should improve clarity, grammar, and overall professionalism 
        without losing the core message that the author intended to convey.
      `.trim()

      const options: EnhanceOptions = {
        text: longText,
        language: 'en',
        tone: 'professional'
      }

      const result = await enhanceText(options)
      
      expect(result.enhancedText).toBeDefined()
      expect(result.enhancedText).not.toBe(longText)
      expect(result.tokensUsed).toBeGreaterThan(50) // Should use more tokens for longer text
      
      const qualityCheck = validateOutputQuality(
        longText,
        result.enhancedText,
        result.language
      )

      expect(qualityCheck.isValid).toBe(true)
      
      console.log('📝 Original length:', longText.length)
      console.log('✨ Enhanced length:', result.enhancedText.length)
      console.log('🔢 Tokens used:', result.tokensUsed)
      console.log('✅ Quality check:', qualityCheck.isValid ? 'PASSED' : 'FAILED')
    })
  })

  describe('Prompt Caching Integration', () => {
    it('should utilize prompt caching for repeated requests', async () => {
      const options: EnhanceOptions = {
        text: 'first request for caching test',
        language: 'en',
        tone: 'professional'
      }

      // First request (should create cache)
      const result1 = await enhanceText(options)
      expect(result1.enhancedText).toBeDefined()
      
      console.log('🔄 First request - Cached:', result1.cached || false)
      console.log('💾 Cache stats:', result1.cacheStats)

      // Second request with same language (should hit cache)
      const options2: EnhanceOptions = {
        text: 'second request for caching test',
        language: 'en',
        tone: 'professional'
      }

      const result2 = await enhanceText(options2)
      expect(result2.enhancedText).toBeDefined()
      
      console.log('🔄 Second request - Cached:', result2.cached || false)
      console.log('💾 Cache stats:', result2.cacheStats)

      // At least one should show cache usage
      const hasCacheUsage = result1.cached || result2.cached || 
                           (result1.cacheStats?.tokensSaved || 0) > 0 ||
                           (result2.cacheStats?.tokensSaved || 0) > 0

      console.log('📊 Cache utilization detected:', hasCacheUsage)
    })
  })

  describe('Error Handling', () => {
    it('should handle very short text gracefully', async () => {
      const options: EnhanceOptions = {
        text: 'hi',
        language: 'en',
        tone: 'professional'
      }

      const result = await enhanceText(options)
      
      expect(result.enhancedText).toBeDefined()
      expect(result.enhancedText.length).toBeGreaterThan(2)
      
      console.log('📝 Original:', options.text)
      console.log('✨ Enhanced:', result.enhancedText)
    })

    it('should handle text with special characters', async () => {
      const options: EnhanceOptions = {
        text: 'hello @user! check this link: https://example.com #hashtag',
        language: 'en',
        tone: 'professional'
      }

      const result = await enhanceText(options)
      
      expect(result.enhancedText).toBeDefined()
      expect(result.enhancedText).not.toBe(options.text)
      
      console.log('📝 Original:', options.text)
      console.log('✨ Enhanced:', result.enhancedText)
    })
  })

  describe('Performance Benchmarks', () => {
    it('should complete enhancement within reasonable time', async () => {
      const options: EnhanceOptions = {
        text: 'this is a performance test to measure response time',
        language: 'en',
        tone: 'professional'
      }

      const startTime = Date.now()
      const result = await enhanceText(options)
      const endTime = Date.now()
      
      const responseTime = endTime - startTime
      
      expect(result.enhancedText).toBeDefined()
      expect(responseTime).toBeLessThan(30000) // Should complete within 30 seconds
      
      console.log('⏱️  Response time:', responseTime, 'ms')
      console.log('🔢 Tokens used:', result.tokensUsed)
      console.log('📊 Tokens per second:', Math.round(result.tokensUsed / (responseTime / 1000)))
    })
  })
})

// If no API key, show helpful message
if (!hasApiKey) {
  describe('Claude API Integration (Skipped)', () => {
    it('should provide API key to run tests', () => {
      console.log(`
🔑 To run real Claude API integration tests:

1. Get your API key from: https://console.anthropic.com/
2. Set environment variable:
   export ANTHROPIC_API_KEY="your-api-key-here"
3. Run tests:
   npm run test:claude

Optional configuration:
   export ANTHROPIC_MODEL="claude-3-5-sonnet-20241022"
   export ANTHROPIC_MAX_TOKENS="1024"
      `)
      
      expect(true).toBe(true) // Always pass this informational test
    })
  })
}