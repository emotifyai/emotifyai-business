import { composePrompt, buildCachedSystemPrompt } from '../composer'
import { detectInputLanguage } from '../../language-router'

describe('prompt composer', () => {
  it('builds cached system prompt with cache_control', () => {
    const cached = buildCachedSystemPrompt('ar-gulf')
    expect(cached.cache_control?.type).toBe('ephemeral')
    expect(cached.text).toContain('إيموتيفاي')
  })

  it('includes platform and tone in variable layer', () => {
    const detection = detectInputLanguage('ساعة ذكية بشاشة AMOLED')
    const composition = composePrompt(
      'ساعة ذكية بشاشة AMOLED',
      { outputLanguage: 'ar_gulf', tone: 'exclusive', platform: 'whatsapp' },
      detection,
      'ar-gulf'
    )
    expect(composition.variableLayerText).toContain('واتساب')
    expect(composition.variableLayerText).toContain('حصري')
    expect(composition.variableLayerText).toContain('عربي خليجي')
    expect(composition.variableLayerText).toContain('استنتج')
  })
})
