import type { ToneChoice } from '../types'

export const TONE_INSTRUCTIONS: Record<ToneChoice, string> = {
  emotional: `النبرة: عاطفي — اربط القارئ بلحظة إنسانية حقيقية، مشاعر ملموسة، صورة يعيشها.`,
  marketing: `النبرة: تسويقي — اقنع بهدوء، فوائد واضحة، دعوة ضمنية للشراء دون صراخ إعلاني.`,
  exclusive: `النبرة: حصري — ندرة هادئة، تميز يليق بمن يفهم، لا تخفض القيمة بخصومات صاخبة.`,
}
