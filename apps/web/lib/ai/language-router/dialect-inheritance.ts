import type { DialectId, PromptRouteId } from '../prompts/types'

/** Maps detected dialect to specialized route when input understanding needs overlay */
export function dialectToInputRoute(dialect: DialectId | undefined): PromptRouteId | null {
  switch (dialect) {
    case 'egyptian':
      return 'ar-egyptian'
    case 'levantine':
      return 'ar-levantine'
    case 'maghrebi':
      return 'ar-levantine'
    case 'gulf':
      return 'ar-gulf'
    case 'msa':
      return 'ar-msa'
    default:
      return null
  }
}
