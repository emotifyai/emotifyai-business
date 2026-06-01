import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import {
  confirmationMatchesInput,
  getDeleteAccountConfirmationPhrase,
} from '@/lib/account/delete-account'

const DeleteAccountSchema = z.object({
  confirmation: z.string().min(1),
})

/**
 * POST /api/user/delete-account
 * Permanently deletes the authenticated user (requires exact display-name confirmation).
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user?.email) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = DeleteAccountSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .maybeSingle()

    const expectedPhrase = getDeleteAccountConfirmationPhrase(
      (profile as { display_name?: string | null } | null)?.display_name ?? '',
      user.email
    )

    if (!confirmationMatchesInput(expectedPhrase, parsed.data.confirmation)) {
      return NextResponse.json(
        {
          error: 'CONFIRMATION_MISMATCH',
          message: 'النص المدخل لا يطابق اسم العرض المطلوب.',
        },
        { status: 400 }
      )
    }

    const admin = await createAdminClient()
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('deleteUser error:', deleteError)
      return NextResponse.json(
        { error: 'فشل حذف الحساب. تواصل مع الدعم.' },
        { status: 500 }
      )
    }

    await supabase.auth.signOut()

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    if (message.includes('Missing Supabase admin')) {
      return NextResponse.json(
        { error: 'إعدادات الخادم غير مكتملة (مفتاح الخدمة).' },
        { status: 503 }
      )
    }
    console.error('delete-account error:', error)
    return NextResponse.json({ error: 'خطأ داخلي' }, { status: 500 })
  }
}
