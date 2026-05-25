import type { DetectionResult, OutputLanguageChoice, DialectId } from './types'

const DIALECT_LABELS: Record<DialectId, string> = {
  gulf: 'الخليجية',
  msa: 'الفصحى',
  egyptian: 'المصرية',
  levantine: 'الشامية',
  maghrebi: 'المغاربية',
}

const OUTPUT_DIALECT: Partial<Record<OutputLanguageChoice, DialectId | 'en'>> = {
  ar_gulf: 'gulf',
  ar_msa: 'msa',
  en: 'en',
}

/**
 * When input dialect/regional variety differs from chosen output language,
 * add a generic bridge note (not limited to specific dialect pairs).
 */
export function buildInputToOutputNote(
  detection: DetectionResult,
  outputLanguage: OutputLanguageChoice
): string {
  if (outputLanguage === 'en') {
    if (detection.primaryScript === 'arabic') {
      return '\nالمدخل بالعربية (أي لهجة أو فصحى) — اكتب المخرج بالإنجليزية فقط.'
    }
    if (detection.isMixed) {
      return '\nالمدخل بلغات متعددة — وحّد المعنى في المخرج الإنجليزي.'
    }
    return ''
  }

  const target = OUTPUT_DIALECT[outputLanguage]
  if (!target || target === 'en') return ''

  if (detection.isMixed) {
    return '\nالمدخل مختلط اللغات — افهم كل المعاني ثم اكتب المخرج باللغة المطلوبة فقط.'
  }

  if (detection.primaryScript !== 'arabic') {
    return `\nالمدخل بـ${detection.inputSummaryAr} — اكتب المخرج بالعربية (${DIALECT_LABELS[target as DialectId] ?? 'حسب الاختيار'}).`
  }

  const inputDialect = detection.primaryDialect
  if (!inputDialect || inputDialect === target) return ''

  const inputLabel = DIALECT_LABELS[inputDialect]
  const outputLabel = DIALECT_LABELS[target as DialectId] ?? 'المطلوبة'
  return `\nالمدخل باللهجة ${inputLabel} — اكتب المخرج بالعربية ${outputLabel}.`
}
