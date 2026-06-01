export const OUTPUT_LANGUAGES = [
  { value: 'ar_gulf', label: 'عربي خليجي' },
  { value: 'ar_msa', label: 'عربي فصيح' },
  { value: 'en', label: 'إنجليزي' },
] as const

export const TONE_OPTIONS = [
  { value: 'emotional', label: 'عاطفي' },
  { value: 'marketing', label: 'تسويقي' },
  { value: 'exclusive', label: 'حصري' },
] as const

export const PLATFORM_OPTIONS = [
  { value: 'store', label: 'متجر' },
  { value: 'whatsapp', label: 'واتساب' },
  { value: 'instagram', label: 'إنستغرام' },
  { value: 'facebook', label: 'فيسبوك' },
  { value: 'snap', label: 'سناب' },
  { value: 'tiktok', label: 'تيك توك' },
] as const

export type OutputLanguage = (typeof OUTPUT_LANGUAGES)[number]['value']
export type Tone = (typeof TONE_OPTIONS)[number]['value']
export type Platform = (typeof PLATFORM_OPTIONS)[number]['value']

export type EditorEnhanceConfig = {
  tone: Tone
  outputLanguage: OutputLanguage
  platform: Platform
}

/** Landing smart-combination chips — preset enhance controls */
export const LANDING_PRESET_CHIPS: Array<{
  id: string
  label: string
  config: EditorEnhanceConfig
}> = [
  {
    id: 'whatsapp-gulf-marketing',
    label: 'واتساب · عربي خليجي · تسويقي',
    config: { platform: 'whatsapp', outputLanguage: 'ar_gulf', tone: 'marketing' },
  },
  {
    id: 'store-msa-exclusive',
    label: 'متجر · عربي فصيح · حصري',
    config: { platform: 'store', outputLanguage: 'ar_msa', tone: 'exclusive' },
  },
  {
    id: 'instagram-gulf-emotional',
    label: 'إنستغرام · عربي خليجي · عاطفي',
    config: { platform: 'instagram', outputLanguage: 'ar_gulf', tone: 'emotional' },
  },
  {
    id: 'tiktok-gulf-marketing',
    label: 'تيك توك · عربي خليجي · تسويقي',
    config: { platform: 'tiktok', outputLanguage: 'ar_gulf', tone: 'marketing' },
  },
]
