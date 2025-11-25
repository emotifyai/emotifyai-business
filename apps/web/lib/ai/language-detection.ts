/**
 * Supported languages for high-quality text enhancement
 */
export const SUPPORTED_LANGUAGES = ['en', 'ar', 'fr'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

/**
 * Detect the language of the input text
 * This is a simple heuristic-based detection
 * For production, consider using a proper language detection library
 */
export function detectLanguage(text: string): string {
    // Remove whitespace and get first 100 characters for analysis
    const sample = text.trim().slice(0, 100)

    // Arabic detection (Unicode range for Arabic characters)
    const arabicPattern = /[\u0600-\u06FF]/
    if (arabicPattern.test(sample)) {
        return 'ar'
    }

    // French detection (common French characters and words)
    const frenchPattern = /[àâäæçéèêëïîôùûüÿœ]|(\b(le|la|les|un|une|des|et|ou|à|de|du|en|dans|pour|avec|sur)\b)/i
    if (frenchPattern.test(sample)) {
        return 'fr'
    }

    // Default to English
    return 'en'
}

/**
 * Check if a language is supported for high-quality enhancement
 */
export function isLanguageSupported(language: string): boolean {
    return SUPPORTED_LANGUAGES.includes(language as SupportedLanguage)
}

/**
 * Validate the quality of AI output
 * Returns true if the output meets quality standards
 */
export function validateOutputQuality(input: string, output: string, language: string): {
    isValid: boolean
    reason?: string
} {
    // Check if output is empty or too short
    if (!output || output.trim().length < 5) {
        return {
            isValid: false,
            reason: 'Output is too short or empty',
        }
    }

    // Check if output is identical to input (AI didn't make changes)
    if (output.trim() === input.trim()) {
        return {
            isValid: false,
            reason: 'Output is identical to input',
        }
    }

    // Check if output is suspiciously short compared to input (for expand mode)
    // This is a basic check - you might want more sophisticated validation
    if (output.length < input.length * 0.5) {
        return {
            isValid: false,
            reason: 'Output is significantly shorter than expected',
        }
    }

    // Check if the output contains error messages or refusals
    const errorPatterns = [
        /I cannot/i,
        /I apologize/i,
        /I'm unable/i,
        /I don't have/i,
        /not supported/i,
        /cannot process/i,
    ]

    for (const pattern of errorPatterns) {
        if (pattern.test(output)) {
            return {
                isValid: false,
                reason: 'Output contains error or refusal message',
            }
        }
    }

    // Language-specific validation
    if (!isLanguageSupported(language)) {
        // For unsupported languages, we're more lenient but still check basics
        return {
            isValid: true,
        }
    }

    // Validate that the output is in the expected language
    const detectedLanguage = detectLanguage(output)
    if (detectedLanguage !== language && isLanguageSupported(language)) {
        return {
            isValid: false,
            reason: `Output language (${detectedLanguage}) does not match expected language (${language})`,
        }
    }

    return {
        isValid: true,
    }
}

/**
 * Get language name from code
 */
export function getLanguageName(code: string): string {
    const names: Record<string, string> = {
        en: 'English',
        ar: 'Arabic',
        fr: 'French',
    }
    return names[code] || 'Unknown'
}
