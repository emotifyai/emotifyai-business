import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchInvoices } from '@/lib/billing/fetch-invoices'

/**
 * GET /api/billing/invoices
 *
 * Billing history for the invoices dashboard: subscription invoices (خطة)
 * and bundle orders (حزمة) from Lemon Squeezy, with Supabase fallback.
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

    const result = await fetchInvoices(userEmail, rows ?? [])

    return NextResponse.json(result)
  } catch (error) {
    console.error('Billing invoices API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'فشل تحميل سجل الفواتير',
        },
      },
      { status: 500 }
    )
  }
}
