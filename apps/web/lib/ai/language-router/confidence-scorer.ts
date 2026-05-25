import type { DialectId, DetectionResult, ScriptId } from '../prompts/types'
import { analyzeScripts, getLeadSlice, primaryScriptFromRatios } from './token-analyzer'
import { scoreDialects } from './dialect-patterns'

const CONFIDENCE_THRESHOLD = 0.45

function normalizeDialectScores(scores: Partial<Record<DialectId, number>>): Partial<Record<DialectId, number>> {
  const max = Math.max(...Object.values(scores).map((v) => v ?? 0), 1)
  const out: Partial<Record<DialectId, number>> = {}
  for (const [k, v] of Object.entries(scores) as [DialectId, number][]) {
    out[k] = (v ?? 0) / max
  }
  return out
}

function topDialect(scores: Partial<Record<DialectId, number>>): DialectId | undefined {
  const sorted = (Object.entries(scores) as [DialectId, number][])
    .sort((a, b) => b[1] - a[1])
  if (!sorted[0] || sorted[0][1] < 0.2) return undefined
  if (sorted[1] && sorted[0][1] - sorted[1][1] < 0.15) return undefined
  return sorted[0][0]
}

function buildInputSummaryAr(
  script: ScriptId,
  dialect?: DialectId,
  isMixed?: boolean
): string {
  if (isMixed) return 'لغات مختلطة'
  const scriptLabels: Record<ScriptId, string> = {
    arabic: 'عربي',
    latin: 'إنجليزي/لاتيني',
    cyrillic: 'سيريلي',
    cjk: 'شرق آسيوي',
    other: 'غير محدد',
  }
  const dialectLabels: Record<DialectId, string> = {
    gulf: 'خليجي',
    msa: 'فصيح',
    egyptian: 'مصري',
    levantine: 'شامي',
    maghrebi: 'مغاربي',
  }
  if (script === 'arabic') {
    return dialect ? `عربي ${dialectLabels[dialect]}` : 'عربي'
  }
  return scriptLabels[script]
}

export function detectInputLanguage(text: string): DetectionResult {
  const trimmed = text.trim()
  const scriptRatios = analyzeScripts(trimmed)
  const primaryScript = primaryScriptFromRatios(scriptRatios)

  const lead = getLeadSlice(trimmed)
  const rawDialect = scoreDialects(trimmed, lead)
  const dialectScores = normalizeDialectScores(rawDialect)
  const primaryDialect = primaryScript === 'arabic' ? topDialect(dialectScores) : undefined

  const sortedScripts = Object.entries(scriptRatios)
    .filter(([k]) => k !== 'other')
    .sort((a, b) => b[1] - a[1])
  const dialectEntries = Object.entries(dialectScores) as [DialectId, number][]
  const topTwo = dialectEntries.sort((a, b) => b[1] - a[1])
  const ambiguousDialect =
    primaryScript === 'arabic' &&
    topTwo.length >= 2 &&
    topTwo[0][1] > 0.25 &&
    topTwo[1][1] > 0.25 &&
    topTwo[0][1] - topTwo[1][1] < 0.12

  const isMixed =
    (sortedScripts[1]?.[1] ?? 0) > 0.15 || ambiguousDialect

  const scriptScore = sortedScripts[0]?.[1] ?? 0
  const dialectScore = primaryDialect ? (dialectScores[primaryDialect] ?? 0) : 0
  const leadBoost = scoreDialects(lead)[primaryDialect ?? 'msa'] ?? 0
  const leadNorm = Math.min(leadBoost / 3, 1)

  let confidence = scriptScore * 0.4 + dialectScore * 0.4 + leadNorm * 0.2

  // Clear single-script input without dialect ambiguity (e.g. English product copy)
  if (!isMixed && scriptScore >= 0.85) {
    if (primaryScript === 'latin' || (primaryScript === 'arabic' && primaryDialect)) {
      confidence = Math.max(confidence, 0.52)
    }
  }

  return {
    primaryScript,
    scriptRatios,
    primaryDialect,
    dialectScores,
    confidence: Math.min(1, confidence),
    isMixed,
    breakdown: {
      scriptScore,
      dialectScore,
      leadBoostScore: leadNorm,
    },
    inputSummaryAr: buildInputSummaryAr(primaryScript, primaryDialect, isMixed),
  }
}

export { CONFIDENCE_THRESHOLD }
