import { buildCachedSystemPrompt } from '../composer'

import { getSystemPromptForRoute, ROUTE_SYSTEM_PROMPTS } from '../languages/registry'

import type { PromptRouteId } from '../types'



const TOP_10_ROUTES: PromptRouteId[] = [

  'ar-gulf',

  'ar-msa',

  'ar-egyptian',

  'ar-levantine',

  'en',

  'fr',

  'es',

  'de',

  'tr',

  'ur',

]



describe('language route templates', () => {

  it.each(TOP_10_ROUTES)('route %s has unique prompt longer than 200 chars', (routeId) => {

    const text = getSystemPromptForRoute(routeId)

    expect(text.length).toBeGreaterThan(200)

    const others = TOP_10_ROUTES.filter((r) => r !== routeId)

    for (const other of others) {

      expect(text).not.toBe(getSystemPromptForRoute(other))

    }

  })



  it('French prompt is native French and not identical to English', () => {

    const fr = getSystemPromptForRoute('fr')

    const en = getSystemPromptForRoute('en')

    expect(fr).not.toBe(en)

    expect(fr).toMatch(/Tu es EmotifyAI|Règle d'or|e-commerce/)

    expect(fr).not.toContain('You are EmotifyAI — a premium e-commerce')

  })



  it('ar-msa contains MSA / فصيح indicators', () => {

    const msa = getSystemPromptForRoute('ar-msa')

    expect(msa).toMatch(/فصحى|الفصحى/)

    expect(msa).toMatch(/بلا لهجة محلية|بلا لهجة خليجية/)

  })



  it('buildCachedSystemPrompt works for all top 10 routes', () => {

    for (const routeId of TOP_10_ROUTES) {

      const cached = buildCachedSystemPrompt(routeId)

      expect(cached.type).toBe('text')

      expect(cached.cache_control?.type).toBe('ephemeral')

      expect(cached.text).toBe(ROUTE_SYSTEM_PROMPTS[routeId])

    }

  })



  it('fallback routes are defined and substantive', () => {

    for (const id of ['fallback-nigerian', 'fallback-mixed', 'fallback-multilingual'] as const) {

      expect(getSystemPromptForRoute(id).length).toBeGreaterThan(200)

    }

  })

})


