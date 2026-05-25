/**
 * Output validation helpers — input routing lives in language-router/
 */
import type { OutputLanguageChoice } from './prompts/types'

export const SUPPORTED_OUTPUT_LANGUAGES = ['ar_gulf', 'ar_msa', 'en'] as const
export type SupportedOutputLanguage = (typeof SUPPORTED_OUTPUT_LANGUAGES)[number]

/** @deprecated Use SUPPORTED_OUTPUT_LANGUAGES */
export const SUPPORTED_LANGUAGES = SUPPORTED_OUTPUT_LANGUAGES
export type SupportedLanguage = SupportedOutputLanguage

export function detectLanguage(text: string): string {
  const sample = text.trim().slice(0, 100)
  if (/[\u0600-\u06FF]/.test(sample)) return 'ar'
  if (/[àâäæçéèêëïîôùûüÿœ]|(\b(le|la|les|un|une)\b)/i.test(sample)) return 'fr'
  return 'en'
}

export function isLanguageSupported(language: string): boolean {
  return (
    SUPPORTED_OUTPUT_LANGUAGES.includes(language as OutputLanguageChoice) ||
    ['en', 'ar', 'fr'].includes(language)
  )
}

export function outputLanguageToScript(expected: OutputLanguageChoice | string): 'ar' | 'en' | 'fr' {
  if (expected === 'en') return 'en'
  if (expected === 'fr') return 'fr'
  if (expected === 'ar_gulf' || expected === 'ar_msa' || expected === 'ar') return 'ar'
  return 'en'
}

export function validateOutputQuality(
  input: string,
  output: string,
  expectedOutputLanguage: string
): { isValid: boolean; reason?: string } {
  if (!output || output.trim().length < 5) {
    return { isValid: false, reason: 'Output is too short or empty' }
  }

  const expectedScript = outputLanguageToScript(expectedOutputLanguage as OutputLanguageChoice)
  const inputScript = detectLanguage(input)

  if (output.trim() === input.trim() && inputScript === expectedScript) {
    return { isValid: false, reason: 'Output is identical to input' }
  }

  const minLengthRatio = inputScript !== expectedScript ? 0.3 : 0.5
  if (output.length < input.length * minLengthRatio) {
    return { isValid: false, reason: 'Output is significantly shorter than expected' }
  }

  const errorPatterns = [
    /I cannot/i,
    /I apologize/i,
    /I'm unable/i,
    /I don't have the capability/i,
    /not supported/i,
    /cannot process/i,
    /لا أستطيع/i,
  ]

  for (const pattern of errorPatterns) {
    if (pattern.test(output)) {
      return { isValid: false, reason: 'Output contains error or refusal message' }
    }
  }

  const detectedOutput = detectLanguage(output)
  const expectedDetected =
    expectedScript === 'ar' ? 'ar' : expectedScript === 'fr' ? 'fr' : 'en'

  if (
    detectedOutput !== expectedDetected &&
    !['ar_gulf', 'ar_msa', 'ar'].includes(expectedOutputLanguage)
  ) {
    return {
      isValid: false,
      reason: `Output language (${detectedOutput}) does not match expected (${expectedDetected})`,
    }
  }

  return { isValid: true }
}

export function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    en: 'English',
    ar: 'Arabic',
    ar_gulf: 'Arabic (Gulf)',
    ar_msa: 'Arabic (MSA)',
    fr: 'French',
  }
  return names[code] || 'Unknown'
}

/** Client-safe preview of input detection (no API call) */
export { detectInputLanguage } from './language-router'
