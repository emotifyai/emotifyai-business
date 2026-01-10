import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user's editor history using the database function
    const { data: history, error: historyError } = await (supabase as any)
      .rpc('get_user_editor_history', { user_uuid: user.id })

    if (historyError) {
      console.error('Error fetching editor history:', historyError)
      return NextResponse.json(
        { error: 'Failed to fetch history' },
        { status: 500 }
      )
    }

    return NextResponse.json({ history: history || [] })
  } catch (error) {
    console.error('History API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}