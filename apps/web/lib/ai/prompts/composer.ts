import type { CachedPrompt } from '../prompt-cache'
import { getSystemPromptForRoute } from './languages/registry'
import { inferProductContext } from './product-inference'
import { buildInputToOutputNote } from './input-output-bridge'
import { PLATFORM_INSTRUCTIONS } from './layers/platform'
import { TONE_INSTRUCTIONS } from './layers/tone'
import { OUTPUT_LANGUAGE_INSTRUCTIONS } from './layers/output-language'
import type {
  DetectionResult,
  PromptComposition,
  PromptRouteId,
  UserGenerationOptions,
} from './types'
import { mapOutputLanguageToRoute } from '../language-router/router'

export function buildCachedSystemPrompt(routeId: PromptRouteId): CachedPrompt {
  return {
    type: 'text',
    text: getSystemPromptForRoute(routeId),
    cache_control: { type: 'ephemeral' },
  }
}

export function buildVariableLayer(
  text: string,
  options: UserGenerationOptions,
  detection: DetectionResult,
  routeId: PromptRouteId
): string {
  const product = inferProductContext(text)
  const inputNote = detection.isMixed
    ? `مدخل مختلط — ${detection.inputSummaryAr} (ثقة ${Math.round(detection.confidence * 100)}%)`
    : `مدخل: ${detection.inputSummaryAr} (ثقة ${Math.round(detection.confidence * 100)}%)`

  const crossDialect = buildInputToOutputNote(detection, options.outputLanguage)

  return `══════════════════════════════════════
الطبقة المتغيرة — هذا الطلب
══════════════════════════════════════
${product.inferenceDirectiveAr}
لمحة من الوصف: ${product.subjectHint}
المنتج:
${text}

${OUTPUT_LANGUAGE_INSTRUCTIONS[options.outputLanguage]}
${TONE_INSTRUCTIONS[options.tone]}
${PLATFORM_INSTRUCTIONS[options.platform]}
${inputNote}${crossDialect}

REMEMBER: Return ONLY the enhanced product text in the requested output language.`
}

export function buildUserPromptFromComposition(
  composition: PromptComposition,
  enableCaching = false
): CachedPrompt {
  return {
    type: 'text',
    text: composition.variableLayerText,
    ...(enableCaching ? {} : {}),
  }
}

export function composePrompt(
  text: string,
  options: UserGenerationOptions,
  detection: DetectionResult,
  routeId: PromptRouteId
): PromptComposition {
  const effectiveRoute = routeId || mapOutputLanguageToRoute(options.outputLanguage)
  const variableLayerText = buildVariableLayer(text, options, detection, effectiveRoute)
  return {
    routeId: effectiveRoute,
    systemPromptText: getSystemPromptForRoute(effectiveRoute),
    variableLayerText,
    detection,
    productType: inferProductContext(text).subjectHint,
  }
}
