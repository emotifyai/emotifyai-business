/**
 * Infers product/service context from free-form input.
 * No fixed product catalog — any item (physical, digital, service) is supported.
 * v10.1 moment maps in the base prompt are illustrative examples only.
 */

export type ProductDomain = 'emotional' | 'technical' | 'service' | 'general'

export type ProductContext = {
  /** Short hint for the variable layer (from text, not a closed category list) */
  subjectHint: string
  domain: ProductDomain
  /** Arabic instruction telling the model to infer moment & category from the paste */
  inferenceDirectiveAr: string
}

const TECH_SIGNALS =
  /\b(API|SDK|app|webapp|software|SaaS|اشتراك|بطارية|شاشة|AMOLED|GHz|ملم|واط|Bluetooth|WiFi|لابتوب|جوال|تطبيق|منصة)\b/i

const SERVICE_SIGNALS =
  /\b(خدمة|استشارة|دورة|اشتراك|توصيل|ضمان|تركيب|صيانة|consulting|subscription|service)\b/i

const EMOTIONAL_SIGNALS =
  /\b(عطر|هدية|عباء|فستان|كريم|عناية|مجلس|ضيافة|perfume|gift|luxury|هدية)\b/i

function extractSubjectHint(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, ' ')
  if (!trimmed) return 'منتج أو خدمة (يُستنتج من النص)'

  const firstLine = trimmed.split(/\n/)[0]?.trim() ?? trimmed
  const snippet = firstLine.length > 120 ? `${firstLine.slice(0, 117)}…` : firstLine
  return snippet
}

function inferDomain(text: string): ProductDomain {
  const tech = (text.match(TECH_SIGNALS) ?? []).length
  const service = (text.match(SERVICE_SIGNALS) ?? []).length
  const emotional = (text.match(EMOTIONAL_SIGNALS) ?? []).length

  if (tech >= service && tech >= emotional && tech > 0) return 'technical'
  if (service > 0 && service >= emotional) return 'service'
  if (emotional > 0) return 'emotional'
  return 'general'
}

const DOMAIN_DIRECTIVES: Record<ProductDomain, string> = {
  emotional:
    'استنتج نوع المنتج واللحظة الإنسانية من النص (عطر، أزياء، ضيافة، هدايا، أو أي منتج عاطفي — ليست قائمة محصورة).',
  technical:
    'استنتج نوع المنتج التقني واللحظة الأولى للاستخدام من النص (أجهزة، إلكترونيات، SaaS، أو أي منتج تقني).',
  service:
    'استنتج طبيعة الخدمة ولحظة الارتياح أو النتيجة من النص (اشتراكات، خدمات، تجارب — أي مجال).',
  general:
    'استنتج ما يُباع (منتج، خدمة، تجربة) واللحظة الإنسانية المناسبة مباشرة من وصف المستخدم — دون تقييد بفئات جاهزة.',
}

export function inferProductContext(text: string): ProductContext {
  const domain = inferDomain(text)
  return {
    subjectHint: extractSubjectHint(text),
    domain,
    inferenceDirectiveAr: DOMAIN_DIRECTIVES[domain],
  }
}

/** @deprecated Use inferProductContext */
export function inferProductType(text: string): string {
  const ctx = inferProductContext(text)
  return ctx.subjectHint
}
