import { inferProductContext } from '../product-inference'

describe('inferProductContext', () => {
  it('handles arbitrary products not in any fixed list', () => {
    const ctx = inferProductContext('كرسي مكتب ergonomic مع دعم للظهر وعجلات صامتة')
    expect(ctx.subjectHint).toContain('كرسي')
    expect(ctx.inferenceDirectiveAr).toMatch(/استنتج/)
    expect(ctx.domain).toBe('general')
  })

  it('detects technical domain from signals without fixed category name', () => {
    const ctx = inferProductContext('منصة SaaS لإدارة المخزون مع API وتكامل Shopify')
    expect(ctx.domain).toBe('technical')
  })

  it('uses first-line snippet as subject hint', () => {
    const ctx = inferProductContext('باقة ورود مجففة\nلون بيج، مناسبة للصالات')
    expect(ctx.subjectHint).toContain('ورود')
  })
})
