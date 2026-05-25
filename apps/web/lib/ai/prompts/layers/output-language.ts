import type { OutputLanguageChoice } from '../types'

export const OUTPUT_LANGUAGE_INSTRUCTIONS: Record<OutputLanguageChoice, string> = {
  ar_gulf: `لغة المخرج: عربي خليجي — إلزامي. حتى لو المدخل بلغة أخرى، اكتب المخرج بالخليجية الطبيعية.`,
  ar_msa: `لغة المخرج: عربي فصيح — إلزامي. حتى لو المدخل بلغة أخرى، اكتب المخرج بالفصحى الحديثة.`,
  en: `لغة المخرج: إنجليزي — إلزامي. حتى لو المدخل بأي لغة، اكتب المخرج بإنجليزية تسويقية احترافية.`,
}

export const OUTPUT_LANGUAGE_LABELS: Record<OutputLanguageChoice, string> = {
  ar_gulf: 'عربي خليجي',
  ar_msa: 'عربي فصيح',
  en: 'إنجليزي',
}
