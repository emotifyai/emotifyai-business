import type { OutputLanguageChoice, PromptRouteId } from '../prompts/types'
import { detectInputLanguage, CONFIDENCE_THRESHOLD } from './confidence-scorer'
import { dialectToInputRoute } from './dialect-inheritance'

export function mapOutputLanguageToRoute(output: OutputLanguageChoice): PromptRouteId {
  switch (output) {
    case 'ar_gulf':
      return 'ar-gulf'
    case 'ar_msa':
      return 'ar-msa'
    case 'en':
      return 'en'
    default:
      return 'ar-gulf'
  }
}

/** Regional Latin markers (example: West African English) — hints only, not exhaustive */
const REGIONAL_LATIN_MARKERS =
  /\b(abeg|dey|na\s|wahala|sabi|chop|oga|naira|wetin|howfar|shey|innit|mate|yaar)\b/i

export function detectAndRoute(
  text: string,
  userOutputLanguage: OutputLanguageChoice
): { routeId: PromptRouteId; detection: ReturnType<typeof detectInputLanguage> } {
  const detection = detectInputLanguage(text)
  const outputRoute = mapOutputLanguageToRoute(userOutputLanguage)

  // User output choice + unambiguous script → route even when dialect score is low
  if (!detection.isMixed) {
    if (userOutputLanguage === 'en' && detection.primaryScript === 'latin') {
      return { routeId: 'en', detection }
    }
    if (userOutputLanguage === 'ar_msa' && detection.primaryScript === 'arabic') {
      return { routeId: 'ar-msa', detection }
    }
    if (userOutputLanguage === 'ar_gulf' && detection.primaryScript === 'arabic') {
      return { routeId: 'ar-gulf', detection }
    }
  }

  if (detection.confidence < CONFIDENCE_THRESHOLD) {
    if (detection.isMixed) {
      return { routeId: 'fallback-mixed', detection }
    }
    if (detection.primaryScript === 'latin' && REGIONAL_LATIN_MARKERS.test(text)) {
      return { routeId: 'fallback-nigerian', detection }
    }
    return { routeId: 'fallback-multilingual', detection }
  }

  if (userOutputLanguage === 'en') {
    return { routeId: 'en', detection }
  }

  if (userOutputLanguage === 'ar_msa') {
    return { routeId: 'ar-msa', detection }
  }

  // ar_gulf — user output is Gulf; use input dialect only for variable layer hints
  if (detection.primaryScript === 'arabic' && detection.primaryDialect) {
    const inputRoute = dialectToInputRoute(detection.primaryDialect)
    if (inputRoute && inputRoute !== 'ar-gulf') {
      return { routeId: 'ar-gulf', detection }
    }
  }

  if (detection.primaryScript === 'latin' && !detection.isMixed) {
    return { routeId: outputRoute, detection }
  }

  return { routeId: outputRoute, detection }
}

export { detectInputLanguage }
