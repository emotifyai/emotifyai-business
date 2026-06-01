import type { EditorEnhanceConfig } from './constants'

export const EDITOR_SESSION_KEY = 'editor_session'

export type EditorSessionData = EditorEnhanceConfig & {
  originalText?: string
  enhancedText?: string
}

export function saveEditorSession(data: Partial<EditorSessionData>): void {
  if (typeof window === 'undefined') return
  try {
    const existing = loadEditorSession()
    const merged = { ...existing, ...data }
    sessionStorage.setItem(EDITOR_SESSION_KEY, JSON.stringify(merged))
  } catch {
    // sessionStorage may be unavailable
  }
}

export function loadEditorSession(): EditorSessionData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(EDITOR_SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as EditorSessionData
  } catch {
    return null
  }
}

export const EDITOR_PATH = '/dashboard/editor'

export function buildSignupRedirectUrl(): string {
  return `/signup?redirect_to=${encodeURIComponent(EDITOR_PATH)}`
}

export function buildLoginRedirectUrl(): string {
  return `/login?redirect_to=${encodeURIComponent(EDITOR_PATH)}`
}
