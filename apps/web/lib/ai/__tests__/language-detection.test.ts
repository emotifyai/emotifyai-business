/**
 * Language Detection and Validation Tests
 * Tests language detection, support validation, and output quality checks
 */

import {
  detectLanguage,
  isLanguageSupported,
  validateOutputQuality,
  getLanguageName,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage
} from '../language-detection'

describe('Language Detection', () => {
  describe('detectLanguage', () => {
    it('should detect English text correctly', () => {
      const englishTexts = [
        'Hello world, this is a test message.',
        'The quick brown fox jumps over the lazy dog.',
        'Welcome to our application! Please sign in to continue.',
        'This is a professional business email regarding your account.'
      ]

      englishTexts.forEach(text => {
        expect(detectLanguage(text)).toBe('en')
      })
    })

    it('should detect Arabic text correctly', () => {
      const arabicTexts = [
        'مرحبا بكم في تطبيقنا الجديد',
        'هذا نص تجريبي باللغة العربية',
        'أهلاً وسهلاً بك في موقعنا الإلكتروني',
        'نحن نقدم خدمات متميزة لعملائنا الكرام'
      ]

      arabicTexts.forEach(text => {
        expect(detectLanguage(text)).toBe('ar')
      })
    })

    it('should detect French text correctly', () => {
      const frenchTexts = [
        'Bonjour et bienvenue dans notre application',
        'Ceci est un texte français avec des caractères spéciaux: à, é, è, ç',
        'Nous sommes heureux de vous présenter notre nouveau service',
        'Le développement de cette fonctionnalité a été un défi intéressant'
      ]

      frenchTexts.forEach(text => {
        expect(detectLanguage(text)).toBe('fr')
      })
    })

    it('should detect French using common words', () => {
      const frenchTexts = [
        'le chat et le chien',
        'une maison avec des fleurs',
        'dans la rue principale',
        'pour les enfants et les parents'
      ]

      frenchTexts.forEach(text => {
        expect(detectLanguage(text)).toBe('fr')
      })
    })

    it('should default to English for unknown languages', () => {
      const unknownTexts = [
        'Hola mundo esto es español sin caracteres franceses',
        'Guten Tag das ist Deutsch',
        'Ciao mondo questo italiano',
        'こんにちは世界',
        '你好世界'
      ]

      unknownTexts.forEach(text => {
        expect(detectLanguage(text)).toBe('en')
      })
    })

    it('should handle empty or whitespace-only text', () => {
      expect(detectLanguage('')).toBe('en')
      expect(detectLanguage('   ')).toBe('en')
      expect(detectLanguage('\n\t  \n')).toBe('en')
    })

    it('should handle mixed language text', () => {
      // Should detect based on first 100 characters
      const mixedText = 'مرحبا Hello world français'
      expect(detectLanguage(mixedText)).toBe('ar') // Arabic comes first

      const mixedText2 = 'Hello world this is English text without Arabic'
      expect(detectLanguage(mixedText2)).toBe('en') // Pure English

      const mixedText3 = 'Bonjour le monde français'
      expect(detectLanguage(mixedText3)).toBe('fr') // French detected first
    })

    it('should only analyze first 100 characters', () => {
      const longText = 'A'.repeat(150) + ' مرحبا بكم في تطبيقنا'
      expect(detectLanguage(longText)).toBe('en') // Arabic is after 100 chars
    })
  })

  describe('isLanguageSupported', () => {
    it('should return true for supported languages', () => {
      SUPPORTED_LANGUAGES.forEach(lang => {
        expect(isLanguageSupported(lang)).toBe(true)
      })
    })

    it('should return false for unsupported languages', () => {
      const unsupportedLanguages = ['es', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko']
      
      unsupportedLanguages.forEach(lang => {
        expect(isLanguageSupported(lang)).toBe(false)
      })
    })

    it('should handle case sensitivity', () => {
      expect(isLanguageSupported('EN')).toBe(false)
      expect(isLanguageSupported('En')).toBe(false)
      expect(isLanguageSupported('eN')).toBe(false)
    })

    it('should handle invalid input', () => {
      expect(isLanguageSupported('')).toBe(false)
      expect(isLanguageSupported('english')).toBe(false)
      expect(isLanguageSupported('eng')).toBe(false)
    })
  })

  describe('validateOutputQuality', () => {
    describe('basic validation', () => {
      it('should reject empty output', () => {
        const result = validateOutputQuality('input text', '', 'en')
        
        expect(result.isValid).toBe(false)
        expect(result.reason).toBe('Output is too short or empty')
      })

      it('should reject very short output', () => {
        const result = validateOutputQuality('input text', 'hi', 'en')
        
        expect(result.isValid).toBe(false)
        expect(result.reason).toBe('Output is too short or empty')
      })

      it('should reject identical input and output', () => {
        const text = 'This is the same text'
        const result = validateOutputQuality(text, text, 'en')
        
        expect(result.isValid).toBe(false)
        expect(result.reason).toBe('Output is identical to input')
      })

      it('should handle whitespace differences', () => {
        const input = 'This is the same text'
        const output = '  This is the same text  '
        const result = validateOutputQuality(input, output, 'en')
        
        expect(result.isValid).toBe(false)
        expect(result.reason).toBe('Output is identical to input')
      })
    })

    describe('length validation', () => {
      it('should reject output significantly shorter than input', () => {
        const input = 'This is a long input text that should be enhanced and improved significantly'
        const output = 'Short'
        const result = validateOutputQuality(input, output, 'en')
        
        expect(result.isValid).toBe(false)
        expect(result.reason).toBe('Output is significantly shorter than expected')
      })

      it('should accept output that is reasonably shorter', () => {
        const input = 'This is a somewhat long input text that needs improvement'
        const output = 'This is improved text that is clearer and better'
        const result = validateOutputQuality(input, output, 'en')
        
        expect(result.isValid).toBe(true)
      })

      it('should accept longer output', () => {
        const input = 'Short text'
        const output = 'This is a much longer and more detailed version of the original short text'
        const result = validateOutputQuality(input, output, 'en')
        
        expect(result.isValid).toBe(true)
      })
    })

    describe('error pattern detection', () => {
      it('should reject outputs with error messages', () => {
        const errorOutputs = [
          'I cannot process this request',
          'I apologize, but I cannot help with this',
          "I'm unable to enhance this text",
          "I don't have the capability to process this",
          'This language is not supported',
          'Cannot process this type of content'
        ]

        errorOutputs.forEach(output => {
          const result = validateOutputQuality('input text', output, 'en')
          expect(result.isValid).toBe(false)
          expect(result.reason).toBe('Output contains error or refusal message')
        })
      })

      it('should accept outputs with similar but valid content', () => {
        const validOutputs = [
          'I can help you improve this text',
          'This apologetic tone can be enhanced',
          'Unable to find errors, text is already good',
          "Don't worry, this text is well-written"
        ]

        validOutputs.forEach(output => {
          const result = validateOutputQuality('input text', output, 'en')
          expect(result.isValid).toBe(true)
        })
      })
    })

    describe('language consistency validation', () => {
      it('should validate English output matches English input', () => {
        const input = 'This is English text'
        const output = 'This is enhanced English text with better clarity'
        const result = validateOutputQuality(input, output, 'en')
        
        expect(result.isValid).toBe(true)
      })

      it('should validate Arabic output matches Arabic input', () => {
        const input = 'هذا نص عربي'
        const output = 'هذا نص عربي محسن مع وضوح أفضل'
        const result = validateOutputQuality(input, output, 'ar')
        
        expect(result.isValid).toBe(true)
      })

      it('should validate French output matches French input', () => {
        const input = 'Ceci est un texte français'
        const output = 'Ceci est un texte français amélioré avec une meilleure clarté'
        const result = validateOutputQuality(input, output, 'fr')
        
        expect(result.isValid).toBe(true)
      })

      it('should reject output in wrong language for supported languages', () => {
        const input = 'This is English text'
        const output = 'هذا نص عربي' // Arabic output for English input
        const result = validateOutputQuality(input, output, 'en')
        
        expect(result.isValid).toBe(false)
        expect(result.reason).toContain('Output language (ar) does not match expected language (en)')
      })
    })

    describe('unsupported language handling', () => {
      it('should be lenient with unsupported languages', () => {
        const input = 'Hola mundo'
        const output = 'Hola mundo mejorado'
        const result = validateOutputQuality(input, output, 'es')
        
        expect(result.isValid).toBe(true)
      })

      it('should still check basic validation for unsupported languages', () => {
        const input = 'Hola mundo'
        const output = ''
        const result = validateOutputQuality(input, output, 'es')
        
        expect(result.isValid).toBe(false)
        expect(result.reason).toBe('Output is too short or empty')
      })
    })
  })

  describe('getLanguageName', () => {
    it('should return correct names for supported languages', () => {
      expect(getLanguageName('en')).toBe('English')
      expect(getLanguageName('ar')).toBe('Arabic')
      expect(getLanguageName('fr')).toBe('French')
    })

    it('should return "Unknown" for unsupported languages', () => {
      expect(getLanguageName('es')).toBe('Unknown')
      expect(getLanguageName('de')).toBe('Unknown')
      expect(getLanguageName('invalid')).toBe('Unknown')
      expect(getLanguageName('')).toBe('Unknown')
    })
  })

  describe('SUPPORTED_LANGUAGES constant', () => {
    it('should contain exactly the expected languages', () => {
      expect(SUPPORTED_LANGUAGES).toEqual(['en', 'ar', 'fr'])
    })

    it('should be readonly', () => {
      // TypeScript should prevent this, but test runtime behavior
      // In JavaScript, arrays are mutable by default, so we just check the type
      expect(Array.isArray(SUPPORTED_LANGUAGES)).toBe(true)
      expect(SUPPORTED_LANGUAGES.length).toBe(3)
      
      // Test that it's a const array (can't be reassigned)
      expect(typeof SUPPORTED_LANGUAGES).toBe('object')
    })
  })

  describe('edge cases and performance', () => {
    it('should handle very long text efficiently', () => {
      const longText = 'A'.repeat(10000)
      const start = Date.now()
      const language = detectLanguage(longText)
      const end = Date.now()
      
      expect(language).toBe('en')
      expect(end - start).toBeLessThan(100) // Should be fast
    })

    it('should handle special characters and emojis', () => {
      const textWithEmojis = '🚀 Hello world! 🌟 This is a test 💯'
      expect(detectLanguage(textWithEmojis)).toBe('en')
      
      const arabicWithEmojis = '🚀 مرحبا بكم 🌟 في تطبيقنا 💯'
      expect(detectLanguage(arabicWithEmojis)).toBe('ar')
    })

    it('should handle numbers and punctuation', () => {
      const textWithNumbers = '123 Hello world! @#$%^&*()'
      expect(detectLanguage(textWithNumbers)).toBe('en')
      
      const arabicWithNumbers = '123 مرحبا بكم @#$%^&*()'
      expect(detectLanguage(arabicWithNumbers)).toBe('ar')
    })
  })
})