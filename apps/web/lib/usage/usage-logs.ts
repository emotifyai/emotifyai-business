import type { UsageLogInsert } from '@/types/database'

type SupabaseLike = {
  from: (table: string) => {
    insert: (payload: Record<string, unknown>) => {
      select: (columns: string) => {
        single: () => Promise<{
          data: { id?: string; retry_used?: boolean } | null
          error: { code?: string; message?: string } | null
        }>
      }
    }
    select: (columns: string) => {
      eq: (column: string, value: unknown) => unknown
    }
  }
  rpc: (
    fn: string,
    args: Record<string, unknown>
  ) => Promise<{ data: EditorHistoryRow[] | null; error: { code?: string; message?: string } | null }>
}

export type EditorHistoryRow = {
  id: string
  created_at: string
  input_text: string
  output_text: string
  language?: string
  output_language?: string | null
  tone?: string | null
  platform?: string | null
  tokens_used?: number
  retry_used?: boolean
}

export function isMissingColumnError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  if (error.code === '42703' || error.code === 'PGRST204') return true
  const msg = error.message ?? ''
  return msg.includes('does not exist') || msg.includes('Could not find the')
}

function stripUndefined<T extends Record<string, unknown>>(row: T): Record<string, unknown> {
  return Object.fromEntries(Object.entries(row).filter(([, v]) => v !== undefined))
}

/** Insert tiers from fullest → minimal when DB is missing newer columns. */
function buildInsertTiers(data: UsageLogInsert): Record<string, unknown>[] {
  const withRetry = stripUndefined({ ...data, retry_used: data.retry_used ?? false })
  const full = stripUndefined({ ...data })
  const editorCore = stripUndefined({
    user_id: data.user_id,
    input_text: data.input_text,
    output_text: data.output_text,
    language: data.language,
    output_language: data.output_language,
    mode: data.mode,
    tokens_used: data.tokens_used,
    success: data.success,
    credits_consumed: data.credits_consumed,
    is_editor_session: data.is_editor_session,
    tone: data.tone,
    platform: data.platform,
    detected_route: data.detected_route,
  })
  const minimal = stripUndefined({
    user_id: data.user_id,
    input_text: data.input_text,
    output_text: data.output_text,
    language: data.language,
    mode: data.mode,
    tokens_used: data.tokens_used,
    success: data.success,
    credits_consumed: data.credits_consumed,
  })

  const tiers = [withRetry, full, editorCore, minimal]
  const seen = new Set<string>()
  return tiers.filter((tier) => {
    const key = JSON.stringify(tier)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Inserts a usage_logs row with progressive payload fallback when columns are missing.
 * Always selects `id` only so a missing retry_used column cannot fail a successful insert.
 */
export async function insertUsageLog(
  supabase: SupabaseLike,
  data: UsageLogInsert
): Promise<{ usageLogId?: string; retryUsed: boolean; error?: { code?: string; message?: string } }> {
  const tiers = buildInsertTiers(data)
  let lastError: { code?: string; message?: string } | null = null

  for (const payload of tiers) {
    const result = await supabase.from('usage_logs').insert(payload).select('id').single()
    if (!result.error && result.data?.id) {
      return { usageLogId: result.data.id, retryUsed: false }
    }
    lastError = result.error
    if (!isMissingColumnError(result.error)) {
      return { usageLogId: undefined, retryUsed: false, error: result.error ?? undefined }
    }
    console.warn('[usage-logs] insert tier failed, trying simpler payload', result.error?.message)
  }

  return { usageLogId: undefined, retryUsed: false, error: lastError ?? undefined }
}

const EDITOR_HISTORY_SELECT =
  'id, created_at, input_text, output_text, language, output_language, tone, platform, tokens_used'

function mapDirectHistoryRows(
  rows: Array<Record<string, unknown>> | null
): EditorHistoryRow[] {
  return (rows ?? []).map((row) => ({
    id: String(row.id),
    created_at: String(row.created_at),
    input_text: String(row.input_text),
    output_text: String(row.output_text),
    language: row.language != null ? String(row.language) : undefined,
    output_language: row.output_language != null ? String(row.output_language) : null,
    tone: row.tone != null ? String(row.tone) : null,
    platform: row.platform != null ? String(row.platform) : null,
    tokens_used: typeof row.tokens_used === 'number' ? row.tokens_used : undefined,
    retry_used: false,
  }))
}

async function fetchEditorHistoryDirect(
  supabase: SupabaseLike,
  userId: string
): Promise<{ rows: EditorHistoryRow[]; error?: { code?: string; message?: string } }> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const base = (supabase as any)
    .from('usage_logs')
    .select(EDITOR_HISTORY_SELECT)
    .eq('user_id', userId)
    .eq('success', true)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(50)

  const withEditor = await base.eq('is_editor_session', true)
  if (!withEditor.error) {
    return { rows: mapDirectHistoryRows(withEditor.data) }
  }

  if (isMissingColumnError(withEditor.error)) {
    console.warn(
      '[usage-logs] is_editor_session missing — listing recent successful logs; run Supabase migration'
    )
    const fallback = await (supabase as any)
      .from('usage_logs')
      .select(EDITOR_HISTORY_SELECT)
      .eq('user_id', userId)
      .eq('success', true)
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(50)

    if (!fallback.error) {
      return { rows: mapDirectHistoryRows(fallback.data) }
    }
    return { rows: [], error: fallback.error }
  }

  return { rows: [], error: withEditor.error }
}

/**
 * Loads editor session history via RPC, falling back to a direct query when RPC/columns are missing.
 */
export async function fetchEditorHistory(
  supabase: SupabaseLike,
  userId: string
): Promise<{ rows: EditorHistoryRow[]; error?: { code?: string; message?: string } }> {
  const rpc = await supabase.rpc('get_user_editor_history', { user_uuid: userId })

  if (!rpc.error) {
    const rows = (rpc.data ?? []).map((row) => ({
      ...row,
      retry_used: row.retry_used ?? false,
    }))
    return { rows }
  }

  console.warn('[usage-logs] get_user_editor_history RPC failed, using direct query', rpc.error?.message)

  if (isMissingColumnError(rpc.error)) {
    return fetchEditorHistoryDirect(supabase, userId)
  }

  // RPC missing or other error — still try direct query for resilience
  const direct = await fetchEditorHistoryDirect(supabase, userId)
  if (direct.rows.length > 0) {
    return direct
  }

  return { rows: [], error: rpc.error ?? direct.error }
}
