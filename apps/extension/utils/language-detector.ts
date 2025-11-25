const SUPPORTED_LANGUAGES = ['en', 'ar', 'fr'];

// Simple language detection based on character patterns
export function detectLanguage(text: string): string {
    if (!text || text.trim().length === 0) {
        return 'unknown';
    }

    // Arabic detection (Unicode range for Arabic characters)
    const arabicPattern = /[\u0600-\u06FF]/;
    if (arabicPattern.test(text)) {
        return 'ar';
    }

    // French detection (common French characters and words)
    const frenchPattern = /[àâäæçéèêëïîôùûüÿœÀÂÄÆÇÉÈÊËÏÎÔÙÛÜŸŒ]/;
    const frenchWords = /\b(le|la|les|un|une|des|et|ou|mais|donc|car|ni|est|sont|avec|pour|dans|sur|sous)\b/i;

    if (frenchPattern.test(text) || frenchWords.test(text)) {
        return 'fr';
    }

    // Default to English for Latin script
    return 'en';
}

export function isLanguageSupported(language: string): boolean {
    return SUPPORTED_LANGUAGES.includes(language.toLowerCase());
}

export function getSupportedLanguages(): string[] {
    return [...SUPPORTED_LANGUAGES];
}

export function getLanguageName(code: string): string {
    const languageNames: Record<string, string> = {
        en: 'English',
        ar: 'Arabic',
        fr: 'French',
    };
    return languageNames[code.toLowerCase()] || code;
}
