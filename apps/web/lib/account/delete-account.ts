/** Exact phrase the user must type to confirm permanent account deletion. */
export function getDeleteAccountConfirmationPhrase(displayName: string, email: string): string {
  const fromProfile = displayName?.trim()
  if (fromProfile) return fromProfile
  const local = email.split('@')[0]?.trim()
  return local || email.trim()
}

export function confirmationMatchesInput(expected: string, input: string): boolean {
  return input.trim() === expected.trim()
}
