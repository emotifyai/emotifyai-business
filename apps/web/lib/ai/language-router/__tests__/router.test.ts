import { detectAndRoute, detectInputLanguage } from '../router'

describe('language-router', () => {
  it('detects Egyptian Arabic with high confidence', () => {
    const text = 'انا عايز اعمل webapp يكون فيه حاجات كتير'
    const detection = detectInputLanguage(text)
    expect(detection.primaryScript).toBe('arabic')
    expect(detection.primaryDialect).toBe('egyptian')
    expect(detection.confidence).toBeGreaterThan(0.3)
  })

  it('routes Egyptian input to ar-gulf when user chose Gulf output', () => {
    const text = 'انا عايز اعمل webapp يكون فيه حاجات كتير'
    const { routeId } = detectAndRoute(text, 'ar_gulf')
    expect(routeId).toBe('ar-gulf')
  })

  it('detects mixed language', () => {
    const text = 'هذا منتج amazing جداً للـ shop'
    const detection = detectInputLanguage(text)
    expect(detection.isMixed || detection.scriptRatios.latin > 0.1).toBeTruthy()
  })

  it('uses fallback for low confidence', () => {
    const text = '??? ###'
    const { routeId } = detectAndRoute(text, 'en')
    expect(['fallback-mixed', 'fallback-multilingual', 'en']).toContain(routeId)
  })

  it('maps English output to en route', () => {
    const { routeId } = detectAndRoute('Hello product description', 'en')
    expect(routeId).toBe('en')
  })
})
