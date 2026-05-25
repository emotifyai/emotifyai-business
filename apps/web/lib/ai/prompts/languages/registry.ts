import type { PromptRouteId } from '../types'
import { AR_GULF_SYSTEM_PROMPT } from './templates/ar-gulf'
import { AR_MSA_SYSTEM_PROMPT } from './templates/ar-msa'
import { AR_EGYPTIAN_SYSTEM_PROMPT } from './templates/ar-egyptian'
import { AR_LEVANTINE_SYSTEM_PROMPT } from './templates/ar-levantine'
import { EN_SYSTEM_PROMPT } from './templates/en'
import { FR_SYSTEM_PROMPT } from './templates/fr'
import { ES_SYSTEM_PROMPT } from './templates/es'
import { DE_SYSTEM_PROMPT } from './templates/de'
import { TR_SYSTEM_PROMPT } from './templates/tr'
import { UR_SYSTEM_PROMPT } from './templates/ur'
import { FALLBACK_NIGERIAN_SYSTEM_PROMPT } from './templates/fallback-nigerian'
import { FALLBACK_MIXED_SYSTEM_PROMPT } from './templates/fallback-mixed'
import { FALLBACK_MULTILINGUAL_SYSTEM_PROMPT } from './templates/fallback-multilingual'

/**
 * Stable system prompts per route (cached with Claude ephemeral cache_control).
 *
 * User output language (ar_gulf | ar_msa | en) is applied in the variable layer;
 * `mapOutputLanguageToRoute` picks ar-gulf, ar-msa, or en for API when the user chooses.
 *
 * Input-driven routes (when detection confidence is high enough, extend router):
 * - French input → `fr`
 * - Spanish → `es`, German → `de`, Turkish → `tr`, Urdu → `ur`
 * - Egyptian / Levantine Arabic input → `ar-egyptian` / `ar-levantine` (understand dialect, output per user choice)
 */
export const ROUTE_SYSTEM_PROMPTS: Record<PromptRouteId, string> = {
  'ar-gulf': AR_GULF_SYSTEM_PROMPT,
  'ar-msa': AR_MSA_SYSTEM_PROMPT,
  'ar-egyptian': AR_EGYPTIAN_SYSTEM_PROMPT,
  'ar-levantine': AR_LEVANTINE_SYSTEM_PROMPT,
  en: EN_SYSTEM_PROMPT,
  fr: FR_SYSTEM_PROMPT,
  es: ES_SYSTEM_PROMPT,
  de: DE_SYSTEM_PROMPT,
  tr: TR_SYSTEM_PROMPT,
  ur: UR_SYSTEM_PROMPT,
  'fallback-nigerian': FALLBACK_NIGERIAN_SYSTEM_PROMPT,
  'fallback-mixed': FALLBACK_MIXED_SYSTEM_PROMPT,
  'fallback-multilingual': FALLBACK_MULTILINGUAL_SYSTEM_PROMPT,
}

/** @deprecated Use ROUTE_SYSTEM_PROMPTS — alias for legacy tests */
export const SYSTEM_PROMPTS = {
  en: ROUTE_SYSTEM_PROMPTS.en,
  ar: ROUTE_SYSTEM_PROMPTS['ar-gulf'],
  fr: ROUTE_SYSTEM_PROMPTS.fr,
} as const

export function getSystemPromptForRoute(routeId: PromptRouteId): string {
  return ROUTE_SYSTEM_PROMPTS[routeId] ?? ROUTE_SYSTEM_PROMPTS['fallback-multilingual']
}
