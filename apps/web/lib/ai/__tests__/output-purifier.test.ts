import { 
  hasImpurities, 
  purifyOutput, 
  validateCleanOutput, 
  extractFirstCleanBlock,
  completePurification 
} from '../output-purifier'

describe('Output Purifier', () => {
  describe('hasImpurities', () => {
    it('should detect English impurities', () => {
      expect(hasImpurities("Here's an improved version: Hello world")).toBe(true)
      expect(hasImpurities("Enhanced version: Hello world")).toBe(true)
      expect(hasImpurities("Hello world")).toBe(false)
    })

    it('should detect Arabic impurities', () => {
      expect(hasImpurities("هنا النسخة المحسنة: مرحبا", 'ar')).toBe(true)
      expect(hasImpurities("مرحبا بكم", 'ar')).toBe(false)
    })

    it('should detect French impurities', () => {
      expect(hasImpurities("Voici une version améliorée: Bonjour", 'fr')).toBe(true)
      expect(hasImpurities("Bonjour le monde", 'fr')).toBe(false)
    })
  })

  describe('purifyOutput', () => {
    it('should remove English introductions', () => {
      const input = "Here's an improved version:\n\nHello, how are you today?"
      const expected = "Hello, how are you today?"
      expect(purifyOutput(input, 'en')).toBe(expected)
    })

    it('should remove explanations at the end', () => {
      const input = `Hello, how are you today?

The enhanced version:
- Fixed grammar
- Improved tone
- Added professionalism`
      const expected = "Hello, how are you today?"
      expect(purifyOutput(input, 'en')).toBe(expected)
    })

    it('should handle Arabic text', () => {
      const input = "هنا النسخة المحسنة:\n\nمرحبا كيف حالك اليوم؟"
      const expected = "مرحبا كيف حالك اليوم؟"
      expect(purifyOutput(input, 'ar')).toBe(expected)
    })

    it('should handle French text', () => {
      const input = "Voici une version améliorée:\n\nBonjour, comment allez-vous?"
      const expected = "Bonjour, comment allez-vous?"
      expect(purifyOutput(input, 'fr')).toBe(expected)
    })
  })

  describe('validateCleanOutput', () => {
    it('should validate clean text', () => {
      const result = validateCleanOutput("Hello, how are you today?", 'en')
      expect(result.isClean).toBe(true)
      expect(result.issues).toHaveLength(0)
    })

    it('should detect impurities', () => {
      const result = validateCleanOutput("Here's the improved version: Hello world", 'en')
      expect(result.isClean).toBe(false)
      expect(result.issues.length).toBeGreaterThan(0)
    })
  })

  describe('extractFirstCleanBlock', () => {
    it('should extract first clean sentence', () => {
      const input = `Here's an improved version:

Hello, how are you today?

Improvements made:
- Fixed grammar
- Added punctuation`
      const expected = "Hello, how are you today?"
      expect(extractFirstCleanBlock(input)).toBe(expected)
    })

    it('should skip meta-commentary lines', () => {
      const input = `Enhanced version:
Improved text:
Hello, how are you today?
Changes made: Fixed grammar`
      const expected = "Hello, how are you today?"
      expect(extractFirstCleanBlock(input)).toBe(expected)
    })
  })

  describe('completePurification', () => {
    it('should handle complex impure output', () => {
      const input = `Here's an enhanced version:

Dear John,

I hope this message finds you well. Could you please send me the quarterly report at your earliest convenience?

Thank you for your time.

Best regards

The enhanced version:
- Added professional greeting
- Improved tone and structure
- Made more polite and formal`

      const result = completePurification(input, 'en')
      
      expect(result.cleanText).toBe(`Dear John,

I hope this message finds you well. Could you please send me the quarterly report at your earliest convenience?

Thank you for your time.

Best regards`)
      expect(result.wasImpure).toBe(true)
      expect(result.confidence).toBe('high')
    })

    it('should handle already clean text', () => {
      const input = "Hello, how are you today?"
      const result = completePurification(input, 'en')
      
      expect(result.cleanText).toBe(input)
      expect(result.wasImpure).toBe(false)
      expect(result.confidence).toBe('high')
    })

    it('should handle Arabic impure output', () => {
      const input = `هنا النسخة المحسنة:

مرحبا كيف حالك اليوم؟

التحسينات:
- تحسين النحو
- إضافة الاحترافية`

      const result = completePurification(input, 'ar')
      
      expect(result.cleanText).toBe("مرحبا كيف حالك اليوم؟")
      expect(result.wasImpure).toBe(true)
    })
  })
})