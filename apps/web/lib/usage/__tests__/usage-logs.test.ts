import { fetchEditorHistory, insertUsageLog, isMissingColumnError } from '../usage-logs'

describe('isMissingColumnError', () => {
  it('detects PostgreSQL undefined column', () => {
    expect(isMissingColumnError({ code: '42703', message: 'column retry_used does not exist' })).toBe(
      true
    )
  })

  it('detects PostgREST schema cache miss', () => {
    expect(isMissingColumnError({ code: 'PGRST204', message: 'Could not find retry_used' })).toBe(
      true
    )
  })

  it('returns false for other errors', () => {
    expect(isMissingColumnError({ code: '23505', message: 'duplicate' })).toBe(false)
  })
})

describe('insertUsageLog', () => {
  it('returns id on first successful tier', async () => {
    const single = jest.fn().mockResolvedValue({ data: { id: 'log-1' }, error: null })
    const supabase = {
      from: () => ({
        insert: () => ({
          select: () => ({ single }),
        }),
      }),
    }

    const result = await insertUsageLog(supabase as never, {
      user_id: 'u1',
      input_text: 'a',
      output_text: 'b',
      language: 'ar',
      mode: 'enhance' as never,
      tokens_used: 10,
      success: true,
      is_editor_session: true,
    })

    expect(result.usageLogId).toBe('log-1')
    expect(single).toHaveBeenCalled()
  })

  it('retries with simpler payload when column is missing', async () => {
    const single = jest
      .fn()
      .mockResolvedValueOnce({
        data: null,
        error: { code: '42703', message: 'column retry_used does not exist' },
      })
      .mockResolvedValueOnce({ data: { id: 'log-2' }, error: null })

    const supabase = {
      from: () => ({
        insert: () => ({
          select: () => ({ single }),
        }),
      }),
    }

    const result = await insertUsageLog(supabase as never, {
      user_id: 'u1',
      input_text: 'a',
      output_text: 'b',
      language: 'ar',
      mode: 'enhance' as never,
      tokens_used: 10,
      success: true,
      is_editor_session: true,
    })

    expect(result.usageLogId).toBe('log-2')
    expect(single).toHaveBeenCalledTimes(2)
  })
})

describe('fetchEditorHistory', () => {
  it('uses RPC when available', async () => {
    const supabase = {
      rpc: jest.fn().mockResolvedValue({
        data: [{ id: '1', created_at: '2026-01-01', input_text: 'a', output_text: 'b' }],
        error: null,
      }),
      from: jest.fn(),
    }

    const { rows } = await fetchEditorHistory(supabase as never, 'user-1')
    expect(rows).toHaveLength(1)
    expect(supabase.rpc).toHaveBeenCalledWith('get_user_editor_history', { user_uuid: 'user-1' })
  })
})
