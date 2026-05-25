/**
 * Arabic text normalization for regex / dialect / script matching.
 * Strips decorative forms that should not affect token or marker scoring.
 */

/** Tashkeel, tanween, and Quranic annotation marks */
const DIACRITICS =
  /[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g

/** Kashida / tatweel */
const TATWEEL = /\u0640/g

/** Alef with hamza / madda / wasla → bare alef */
const ALEF_VARIANTS = /[\u0622\u0623\u0625\u0671]/g

/** Alef maqsura → ya */
const ALEF_MAQSURA = /\u0649/g

/** Ta marbuta → ha (improves dialect marker matching) */
const TA_MARBUTA = /\u0629/g

/** Hamza on waw / ya → base letter for consistent matching */
const HAMZA_WAW = /\u0624/g
const HAMZA_YA = /\u0626/g

/** Arabic-Indic and Eastern Arabic digits → Western */
const ARABIC_INDIC_DIGIT = /[\u0660-\u0669]/g
const EXT_ARABIC_INDIC_DIGIT = /[\u06F0-\u06F9]/g

function mapIndicDigit(char: string, base: number): string {
  return String(char.charCodeAt(0) - base)
}

/**
 * Normalize Arabic (and mixed) text before dialect regex and script analysis.
 */
export function normalizeArabicForMatching(text: string): string {
  let s = text.normalize('NFKC')

  s = s
    .replace(DIACRITICS, '')
    .replace(TATWEEL, '')
    .replace(ALEF_VARIANTS, '\u0627')
    .replace(ALEF_MAQSURA, '\u064A')
    .replace(TA_MARBUTA, '\u0647')
    .replace(HAMZA_WAW, '\u0648')
    .replace(HAMZA_YA, '\u064A')
    .replace(ARABIC_INDIC_DIGIT, (d) => mapIndicDigit(d, 0x0660))
    .replace(EXT_ARABIC_INDIC_DIGIT, (d) => mapIndicDigit(d, 0x06f0))

  return s
}
