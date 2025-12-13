/**
 * Output Purification System
 * Removes AI meta-commentary and extracts clean enhanced text
 */

/**
 * Common AI response patterns that need to be removed
 */
const PURIFICATION_PATTERNS = {
  // English patterns
  en: [
    /^Here's an? (improved|enhanced|better|refined|polished) version:?\s*/i,
    /^Here's the (improved|enhanced|better|refined|polished) text:?\s*/i,
    /^I've (improved|enhanced|refined|polished) the text:?\s*/i,
    /^The (improved|enhanced|refined|polished) version:?\s*/i,
    /^Enhanced version:?\s*/i,
    /^Improved text:?\s*/i,
    /^Here's how I would (improve|enhance|refine|polish) it:?\s*/i,
    /\n\n(The enhanced version|Improvements made|Changes made|Enhancements):?[\s\S]*$/i,
    /\n\n(Key improvements|What I improved|Improvements):?[\s\S]*$/i,
    /\n\n- [^\n]*(\n- [^\n]*)*$/,  // Remove bullet point lists at end
    /\n\nThe (improved|enhanced|refined) version:[\s\S]*$/i,
  ],
  
  // Arabic patterns
  ar: [
    /^هنا النسخة المحسنة:?\s*/,
    /^النسخة المحسنة:?\s*/,
    /^النص المحسن:?\s*/,
    /^تم تحسين النص:?\s*/,
    /\n\n(التحسينات|التحسينات المطبقة|التغييرات):?[\s\S]*$/,
    /\n\n- [^\n]*(\n- [^\n]*)*$/,  // Remove Arabic bullet points
    /\n\nالتحسينات المُطبقة:[\s\S]*$/,
  ],
  
  // French patterns
  fr: [
    /^Voici une version (améliorée|amélioré|raffinée):?\s*/i,
    /^Version (améliorée|amélioré|raffinée):?\s*/i,
    /^Texte (amélioré|améliorée):?\s*/i,
    /^J'ai (amélioré|raffiné) le texte:?\s*/i,
    /\n\n(Améliorations apportées|Améliorations|Changements):?[\s\S]*$/i,
    /\n\n- [^\n]*(\n- [^\n]*)*$/,  // Remove French bullet points
    /\n\nAméliorations apportées:[\s\S]*$/i,
  ]
}

/**
 * Detect if text contains impurities (AI meta-commentary)
 */
export function hasImpurities(text: string, language: 'en' | 'ar' | 'fr' = 'en'): boolean {
  const patterns = PURIFICATION_PATTERNS[language]
  
  return patterns.some(pattern => pattern.test(text))
}

/**
 * Extract clean text from AI response
 * Removes introductions, explanations, and meta-commentary
 */
export function purifyOutput(rawOutput: string, language: 'en' | 'ar' | 'fr' = 'en'): string {
  let cleaned = rawOutput.trim()
  
  // Apply language-specific patterns
  const patterns = PURIFICATION_PATTERNS[language]
  
  for (const pattern of patterns) {
    cleaned = cleaned.replace(pattern, '').trim()
  }
  
  // Additional generic cleaning
  cleaned = cleaned
    // Remove common intro phrases in any language
    .replace(/^(Here is|Here's|This is|Below is)[\s\S]*?:\s*/i, '')
    // Remove trailing explanations after double newlines
    .replace(/\n\n[A-Z][^:]*:[\s\S]*$/, '')
    // Remove bullet point explanations
    .replace(/\n\n•[\s\S]*$/, '')
    // Remove numbered explanations
    .replace(/\n\n\d+\.[\s\S]*$/, '')
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  
  return cleaned
}

/**
 * Validate that output is clean and doesn't contain impurities
 */
export function validateCleanOutput(text: string, language: 'en' | 'ar' | 'fr' = 'en'): {
  isClean: boolean
  issues: string[]
} {
  const issues: string[] = []
  
  // Check for common impurity indicators
  const impurityChecks = {
    en: [
      { pattern: /here's|here is/i, issue: 'Contains introduction phrase' },
      { pattern: /improved version|enhanced version/i, issue: 'Contains meta-commentary about improvement' },
      { pattern: /\n\n-\s/i, issue: 'Contains bullet point explanations' },
      { pattern: /improvements made|changes made/i, issue: 'Contains explanation of changes' },
      { pattern: /the enhanced|the improved/i, issue: 'Contains reference to enhancement process' },
    ],
    ar: [
      { pattern: /النسخة المحسنة|النص المحسن/i, issue: 'Contains Arabic meta-commentary' },
      { pattern: /التحسينات|التغييرات/i, issue: 'Contains Arabic explanation of changes' },
      { pattern: /\n\n-\s/i, issue: 'Contains Arabic bullet points' },
    ],
    fr: [
      { pattern: /version améliorée|texte amélioré/i, issue: 'Contains French meta-commentary' },
      { pattern: /améliorations apportées/i, issue: 'Contains French explanation of changes' },
      { pattern: /\n\n-\s/i, issue: 'Contains French bullet points' },
    ]
  }
  
  const checks = impurityChecks[language] || impurityChecks.en
  
  for (const check of checks) {
    if (check.pattern.test(text)) {
      issues.push(check.issue)
    }
  }
  
  // Check for excessive length (might indicate explanations)
  const originalLength = text.length
  if (originalLength > 1000) {
    issues.push('Output suspiciously long (might contain explanations)')
  }
  
  return {
    isClean: issues.length === 0,
    issues
  }
}

/**
 * Extract the first clean sentence/paragraph from AI output
 * Fallback method when purification doesn't work perfectly
 */
export function extractFirstCleanBlock(text: string): string {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean)
  
  // Find the first substantial line that doesn't look like meta-commentary
  for (const line of lines) {
    // Skip obvious meta-commentary lines
    if (
      line.toLowerCase().includes('here') ||
      line.toLowerCase().includes('improved') ||
      line.toLowerCase().includes('enhanced') ||
      line.toLowerCase().includes('version') ||
      line.startsWith('-') ||
      line.startsWith('•') ||
      line.match(/^\d+\./) ||
      line.includes(':') && line.length < 50
    ) {
      continue
    }
    
    // Return first substantial content line
    if (line.length > 10) {
      return line
    }
  }
  
  // Fallback: return first non-empty line
  return lines[0] || text.trim()
}

/**
 * Complete purification pipeline
 * Applies all purification methods and validates result
 */
export function completePurification(
  rawOutput: string, 
  language: 'en' | 'ar' | 'fr' = 'en'
): {
  cleanText: string
  wasImpure: boolean
  issues: string[]
  confidence: 'high' | 'medium' | 'low'
} {
  const wasImpure = hasImpurities(rawOutput, language)
  
  // Step 1: Apply pattern-based purification
  let cleaned = purifyOutput(rawOutput, language)
  
  // Step 2: Validate result
  const validation = validateCleanOutput(cleaned, language)
  
  // Step 3: Fallback extraction if still impure
  if (!validation.isClean && validation.issues.length > 2) {
    cleaned = extractFirstCleanBlock(cleaned)
  }
  
  // Step 4: Final validation
  const finalValidation = validateCleanOutput(cleaned, language)
  
  // Determine confidence level
  let confidence: 'high' | 'medium' | 'low' = 'high'
  if (finalValidation.issues.length > 0) {
    confidence = 'medium'
  }
  if (finalValidation.issues.length > 2 || cleaned.length < 10) {
    confidence = 'low'
  }
  
  return {
    cleanText: cleaned,
    wasImpure,
    issues: finalValidation.issues,
    confidence
  }
}