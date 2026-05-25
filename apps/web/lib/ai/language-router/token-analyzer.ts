import type { ScriptId } from '../prompts/types'
import { normalizeArabicForMatching } from './arabic-normalize'

const SCRIPT_RANGES: { id: ScriptId; test: (c: string) => boolean }[] = [
  { id: 'arabic', test: (c) => /[\u0600-\u06FF\u0750-\u077F]/.test(c) },
  { id: 'latin', test: (c) => /[A-Za-z\u00C0-\u024F]/.test(c) },
  { id: 'cyrillic', test: (c) => /[\u0400-\u04FF]/.test(c) },
  { id: 'cjk', test: (c) => /[\u4E00-\u9FFF\u3040-\u30FF]/.test(c) },
]

export function analyzeScripts(text: string): Record<ScriptId, number> {
  const normalized = normalizeArabicForMatching(text)
  const counts: Record<ScriptId, number> = {
    arabic: 0,
    latin: 0,
    cyrillic: 0,
    cjk: 0,
    other: 0,
  }

  for (const char of normalized) {
    if (/\s/.test(char)) continue
    let matched = false
    for (const { id, test } of SCRIPT_RANGES) {
      if (test(char)) {
        counts[id]++
        matched = true
        break
      }
    }
    if (!matched) counts.other++
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1
  const ratios = {} as Record<ScriptId, number>
  for (const key of Object.keys(counts) as ScriptId[]) {
    ratios[key] = counts[key] / total
  }
  return ratios
}

export function getLeadSlice(text: string, tokenCount = 8): string {
  const tokens = normalizeArabicForMatching(text).trim().split(/\s+/).slice(0, tokenCount)
  return tokens.join(' ')
}

export function primaryScriptFromRatios(ratios: Record<ScriptId, number>): ScriptId {
  const entries = (Object.entries(ratios) as [ScriptId, number][])
    .filter(([k]) => k !== 'other')
    .sort((a, b) => b[1] - a[1])
  return entries[0]?.[0] ?? 'latin'
}
