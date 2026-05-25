import type { DialectId } from '../prompts/types'
import { normalizeArabicForMatching } from './arabic-normalize'

/**
 * Marker signals for Arabic regional varieties — extensible, not exhaustive.
 * Examples (Egyptian, Gulf, Levantine, etc.) illustrate the scoring model;
 * unknown dialects still route via script + output language choice.
 */
export type DialectRule = {
  id: DialectId
  regex: RegExp
  weight: number
}

export const DIALECT_RULES: DialectRule[] = [
  { id: 'egyptian', regex: /(?:^|\s)(عايز|عاوز|عايزة|ازاي|كده|كتير|مش|ايه|إيه|حاجة|حاجات|علشان|دلوقتي)(?:\s|$|[،.])/gi, weight: 1.2 },
  { id: 'egyptian', regex: /\b(انا|إحنا)\b/gi, weight: 0.4 },
  { id: 'gulf', regex: /(?:^|\s)(شوي|تدري|مو\b|يعني|والله|وش|زين|حيل|وايد)(?:\s|$|[،.])/gi, weight: 1.1 },
  { id: 'gulf', regex: /\b(يالله|عساك|مب|ما\s+قصرت)\b/gi, weight: 0.8 },
  { id: 'levantine', regex: /(?:^|\s)(هلق|شو|كتير|منيح|كتير\s+حلو|بدي|عم)(?:\s|$)/gi, weight: 1.0 },
  { id: 'maghrebi', regex: /(?:^|\s)(بزاف|واش|دابا|زوين|بصح|غير|شحال)(?:\s|$)/gi, weight: 1.0 },
  { id: 'msa', regex: /(?:^|\s)(هذا|هذه|التي|الذي|يمكن|لأن|أيضاً|جداً)(?:\s|$)/gi, weight: 0.35 },
]

export function scoreDialects(text: string, leadSlice?: string): Partial<Record<DialectId, number>> {
  const scores: Partial<Record<DialectId, number>> = {}
  const sources = [
    normalizeArabicForMatching(text),
    leadSlice ? normalizeArabicForMatching(leadSlice) : undefined,
  ].filter(Boolean) as string[]

  for (const rule of DIALECT_RULES) {
    for (let i = 0; i < sources.length; i++) {
      const src = sources[i]!
      const matches = src.match(rule.regex)
      if (!matches?.length) continue
      const boost = i === 1 ? 2 : 1
      scores[rule.id] = (scores[rule.id] ?? 0) + matches.length * rule.weight * boost
    }
    rule.regex.lastIndex = 0
  }

  return scores
}
