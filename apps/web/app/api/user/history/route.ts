import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchEditorHistory } from '@/lib/usage/usage-logs'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log('[DUCK history] unauthenticated', { authError: authError?.message })
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log('[DUCK history] fetch for user', user.id)

    const { rows, error: historyError } = await fetchEditorHistory(supabase as any, user.id)

    console.log('[DUCK history] result', {
      userId: user.id,
      count: rows.length,
      error: historyError?.message ?? null,
    })

    if (historyError && rows.length === 0) {
      console.error('[DUCK history] Error fetching editor history:', historyError)
      return NextResponse.json(
        { error: 'Failed to fetch history' },
        { status: 500 }
      )
    }

    return NextResponse.json({ history: rows })
  } catch (error) {
    console.error('History API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}