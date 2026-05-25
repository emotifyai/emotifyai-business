import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchBillingHistory } from '@/lib/billing/fetch-billing'

/**
 * GET /api/billing/history
 *
 * Paid-user billing analytics: invoices, payments, subscription records.
 * Requires LEMONSQUEEZY_API_KEY + LEMONSQUEEZY_STORE_ID for live Lemon data;
 * falls back to Supabase subscription rows when API is unavailable.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'يرجى تسجيل الدخول' },
        },
        { status: 401 }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single()

    const userEmail =
      (profile as { email?: string } | null)?.email ?? user.email ?? ''

    const { data: rows, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (subError) {
      throw subError
    }

    const history = await fetchBillingHistory(userEmail, rows ?? [])

    return NextResponse.json(history)
  } catch (error) {
    console.error('Billing history API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'فشل تحميل بيانات الفوترة',
        },
      },
      { status: 500 }
    )
  }
}
