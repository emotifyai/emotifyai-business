import type { RetryReasonValue } from '@/types/api'

export interface RetryReasonOption {
  value: RetryReasonValue
  labelAr: string
}

export const RETRY_REASON_OPTIONS: RetryReasonOption[] = [
  { value: 'too_robotic', labelAr: 'آلياً' },
  { value: 'wrong_platform', labelAr: 'ما ناسب المنصة' },
  { value: 'wrong_tone', labelAr: 'النبرة غلط' },
  { value: 'missing_something', labelAr: 'ناقص شيء' },
  { value: 'other', labelAr: 'أخرى' },
]

export function getRetryReasonLabel(value: RetryReasonValue): string {
  return RETRY_REASON_OPTIONS.find((o) => o.value === value)?.labelAr ?? value
}
