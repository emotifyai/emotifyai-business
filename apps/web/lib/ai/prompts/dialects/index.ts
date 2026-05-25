import type { DialectId } from '../types'

export type DialectOverlay = {
  id: DialectId
  labelAr: string
  instructions: string
}

/** Regional variety hints for the model — extend via dialect-patterns.ts, not a closed list */
export const DIALECT_OVERLAYS: Record<DialectId, DialectOverlay> = {
  gulf: {
    id: 'gulf',
    labelAr: 'خليجي',
    instructions: `اكتب بالعربية الخليجية الطبيعية. كلمة خليجية واحدة على الأقل: شوي، تدري، مو، يعني، والله.`,
  },
  msa: {
    id: 'msa',
    labelAr: 'فصيح',
    instructions: `اكتب بالعربية الفصحى الحديثة الواضحة — مناسبة للمتاجر الرسمية دون لهجة محلية.`,
  },
  egyptian: {
    id: 'egyptian',
    labelAr: 'مصري',
    instructions: `إذا كان المدخل مصرياً، افهم المعنى ثم اكتب المخرج باللهجة المطلوبة — لا تنسخ العامية المصرية في المخرج إلا إذا طُلب ذلك صراحة.`,
  },
  levantine: {
    id: 'levantine',
    labelAr: 'شامي',
    instructions: `إذا كان المدخل شامياً، افهم المعنى ثم حوّله للمخرج المطلوب.`,
  },
  maghrebi: {
    id: 'maghrebi',
    labelAr: 'مغاربي',
    instructions: `إذا كان المدخل مغاربياً، افهم المعنى ثم حوّله للمخرج المطلوب.`,
  },
}

export function getDialectOverlay(id: DialectId): string {
  return DIALECT_OVERLAYS[id].instructions
}
