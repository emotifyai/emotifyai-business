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

    // Get user credit status using the database function
    const { data: creditStatus, error: creditError } = await (supabase as any)
      .rpc('get_user_credit_status', { user_uuid: user.id })
      .single()

    if (creditError) {
      console.error('Error fetching credit status:', creditError)
      return NextResponse.json(
        { error: 'Failed to fetch usage data' },
        { status: 500 }
      )
    }

    return NextResponse.json(creditStatus)
  } catch (error) {
    console.error('Usage API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}