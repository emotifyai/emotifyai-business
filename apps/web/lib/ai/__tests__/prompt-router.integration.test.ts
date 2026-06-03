import {
  buildCachedSystemPrompt,
  buildEnhancementPrompts,
} from '../prompt-cache'
import {
  detectAndRoute,
  detectInputLanguage,
  mapOutputLanguageToRoute,
} from '../language-router'
import { buildInputToOutputNote } from '../prompts/input-output-bridge'
import { inferProductContext } from '../prompts/product-inference'

const EGYPTIAN_SAMPLE = 'انا عايز اعمل webapp يكون فيه حاجات كتير'
const GULF_SAMPLE = 'شوي تدري والله المنتج زين وايد'
const ENGLISH_SAMPLE = 'Premium leather wallet with RFID blocking'
const MIXED_SAMPLE = 'هذا منتج amazing جداً للـ shop'

describe('prompt router integration', () => {
  describe('mapOutputLanguageToRoute', () => {
    it.each([
      ['ar_gulf', 'ar-gulf'],
      ['ar_msa', 'ar-msa'],
      ['en', 'en'],
    ] as const)('maps %s → %s', (output, route) => {
      expect(mapOutputLanguageToRoute(output)).toBe(route)
    })
  })

  describe('detectAndRoute', () => {
    it('routes Egyptian input to ar-gulf when output is Gulf', () => {
      const { routeId } = detectAndRoute(EGYPTIAN_SAMPLE, 'ar_gulf')
      expect(routeId).toBe('ar-gulf')
    })

    it('routes Gulf markers with ar_gulf output', () => {
      const { routeId } = detectAndRoute(GULF_SAMPLE, 'ar_gulf')
      expect(routeId).toBe('ar-gulf')
    })

    it('routes English input with en output', () => {
      const { routeId } = detectAndRoute(ENGLISH_SAMPLE, 'en')
      expect(routeId).toBe('en')
    })

    it('handles mixed AR+EN toward MSA or fallback', () => {
      const { routeId, detection } = detectAndRoute(MIXED_SAMPLE, 'ar_msa')
      expect(['ar-msa', 'fallback-mixed']).toContain(routeId)
      expect(detection.isMixed || detection.scriptRatios.latin > 0.1).toBeTruthy()
    })
  })

  describe('buildCachedSystemPrompt', () => {
    it('includes Gulf brand for ar-gulf route', () => {
      const prompt = buildCachedSystemPrompt('ar-gulf')
      expect(prompt.cache_control?.type).toBe('ephemeral')
      expect(prompt.text).toContain('EmotifyAI')
    })

    it('includes EmotifyAI for en route', () => {
      const prompt = buildCachedSystemPrompt('en')
      expect(prompt.text).toContain('EmotifyAI')
    })
  })

  describe('buildEnhancementPrompts', () => {
    it('includes platform, tone, and output language in variable layer', () => {
      const { userPrompt, routeId, detection } = buildEnhancementPrompts(GULF_SAMPLE, {
        outputLanguage: 'ar_gulf',
        tone: 'exclusive',
        platform: 'instagram',
      })

      expect(routeId).toBe('ar-gulf')
      expect(userPrompt.text).toContain('إنستغرام')
      expect(userPrompt.text).toContain('حصري')
      expect(userPrompt.text).toContain('عربي خليجي')
      expect(userPrompt.text).toMatch(/مدخل|ثقة/)
      expect(detection.primaryScript).toBe('arabic')
    })

    it('adds input→output bridge when dialect differs from output', () => {
      const pureEgyptian = 'انا عايز عطر فاخر للمناسبات'
      const detection = detectInputLanguage(pureEgyptian)
      const note = buildInputToOutputNote(detection, 'ar_gulf')
      expect(note).toContain('المصرية')
      expect(note).toContain('الخليجية')
    })
  })

  describe('product inference (general)', () => {
    it('infers context without fixed catalog', () => {
      const tech = inferProductContext('ساعة ذكية بشاشة AMOLED وGPS')
      const food = inferProductContext('تمر سكري فاخر للضيافة')
      expect(tech.inferenceDirectiveAr).toContain('استنتج')
      expect(food.inferenceDirectiveAr).toContain('استنتج')
      expect(tech.subjectHint).not.toBe(food.subjectHint)
    })
  })
})
