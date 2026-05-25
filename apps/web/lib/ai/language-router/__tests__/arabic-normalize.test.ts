import { normalizeArabicForMatching } from '../arabic-normalize'

describe('normalizeArabicForMatching', () => {
  it('unifies alef hamza variants with bare alef', () => {
    expect(normalizeArabicForMatching('أحمد')).toBe(normalizeArabicForMatching('احمد'))
    expect(normalizeArabicForMatching('إبراهيم')).toBe(normalizeArabicForMatching('ابراهيم'))
    expect(normalizeArabicForMatching('آمن')).toBe(normalizeArabicForMatching('امن'))
  })

  it('strips diacritics so base letters match', () => {
    const withTashkeel = 'مَرْحَبًا'
    const bare = 'مرحبا'
    expect(normalizeArabicForMatching(withTashkeel)).toBe(normalizeArabicForMatching(bare))
  })

  it('maps Arabic-Indic digits to Western', () => {
    expect(normalizeArabicForMatching('٤٥ ريال')).toBe('45 ريال')
    expect(normalizeArabicForMatching('سعر ١٢٣')).toContain('123')
  })

  it('normalizes hamza on waw and ya', () => {
    expect(normalizeArabicForMatching('ئ')).toBe('ي')
    expect(normalizeArabicForMatching('ؤ')).toBe('و')
    expect(normalizeArabicForMatching('إ أ')).toBe('ا ا')
  })

  it('removes tatweel and normalizes ta marbuta', () => {
    expect(normalizeArabicForMatching('جمــيل')).toBe('جميل')
    expect(normalizeArabicForMatching('مدرسة')).toBe('مدرسه')
  })

  it('maps alef maqsura to ya', () => {
    expect(normalizeArabicForMatching('على')).toBe('علي')
  })
})
