/** User-facing generation options (four controls) */
export type OutputLanguageChoice = 'ar_gulf' | 'ar_msa' | 'en'
export type ToneChoice = 'emotional' | 'marketing' | 'exclusive'
export type PlatformChoice =
  | 'store'
  | 'whatsapp'
  | 'instagram'
  | 'facebook'
  | 'snap'
  | 'tiktok'

export type UserGenerationOptions = {
  outputLanguage: OutputLanguageChoice
  tone: ToneChoice
  platform: PlatformChoice
  strength?: number
}

/** Cached system prompt route ids */
export type PromptRouteId =
  | 'ar-gulf'
  | 'ar-msa'
  | 'ar-egyptian'
  | 'ar-levantine'
  | 'en'
  | 'fr'
  | 'es'
  | 'de'
  | 'tr'
  | 'ur'
  | 'fallback-nigerian'
  | 'fallback-mixed'
  | 'fallback-multilingual'

export type DialectId = 'gulf' | 'msa' | 'egyptian' | 'levantine' | 'maghrebi'

export type ScriptId = 'arabic' | 'latin' | 'cyrillic' | 'cjk' | 'other'

export type DetectionResult = {
  primaryScript: ScriptId
  scriptRatios: Record<ScriptId, number>
  primaryDialect?: DialectId
  dialectScores: Partial<Record<DialectId, number>>
  confidence: number
  isMixed: boolean
  breakdown: {
    scriptScore: number
    dialectScore: number
    leadBoostScore: number
  }
  inputSummaryAr: string
}

export type PromptComposition = {
  routeId: PromptRouteId
  systemPromptText: string
  variableLayerText: string
  detection: DetectionResult
  productType: string
}
