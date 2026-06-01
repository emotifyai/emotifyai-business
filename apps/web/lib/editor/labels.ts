import {
  OUTPUT_LANGUAGES,
  PLATFORM_OPTIONS,
  TONE_OPTIONS,
} from './constants'

export function labelForOutputLanguage(value: string | null | undefined): string {
  return OUTPUT_LANGUAGES.find((l) => l.value === value)?.label ?? value ?? '—'
}

export function labelForTone(value: string | null | undefined): string {
  return TONE_OPTIONS.find((t) => t.value === value)?.label ?? value ?? '—'
}

export function labelForPlatform(value: string | null | undefined): string {
  return PLATFORM_OPTIONS.find((p) => p.value === value)?.label ?? value ?? '—'
}
