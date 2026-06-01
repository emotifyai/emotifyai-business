import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isBundleTier, type SubscriptionTierId } from '@emotifyai/config/pricing'
import { z } from 'zod'

interface SubscriptionVerifyRow {
  tier: string
  created_at: string
  lemon_squeezy_id: string
}

function tierIsBundle(tier: string): boolean {
  return isBundleTier(tier as SubscriptionTierId)
}

const VerifyQuerySchema = z.object({
  tier: z.string().optional(),
  order_id: z.string().optional(),
})

const VERIFY_WINDOW_MS = 20 * 60 * 1000

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ verified: false, error: 'unauthorized' }, { status: 401 })
    }

    const parsed = VerifyQuerySchema.safeParse({
      tier: request.nextUrl.searchParams.get('tier') ?? undefined,
      order_id: request.nextUrl.searchParams.get('order_id') ?? undefined,
    })

    if (!parsed.success) {
      return NextResponse.json({ verified: false, error: 'invalid_params' }, { status: 400 })
    }

    const { tier, order_id: orderId } = parsed.data
    const since = new Date(Date.now() - VERIFY_WINDOW_MS).toISOString()

    if (orderId) {
      const lemonId = orderId.startsWith('order_') ? orderId : `order_${orderId}`
      const { data: row, error } = await supabase
        .from('subscriptions')
        .select('tier, created_at, lemon_squeezy_id')
        .eq('user_id', user.id)
        .eq('lemon_squeezy_id', lemonId)
        .maybeSingle()

      if (error) {
        console.error('[checkout/verify] order lookup failed:', error)
        return NextResponse.json({ verified: false }, { status: 500 })
      }

      const subscription = row as SubscriptionVerifyRow | null
      if (!subscription) {
        return NextResponse.json({ verified: false, pending: true })
      }

      const rowTier = subscription.tier
      if (tier && rowTier !== tier) {
        return NextResponse.json({ verified: false, tierMismatch: true })
      }

      return NextResponse.json({
        verified: true,
        tier: rowTier,
        isBundle: tierIsBundle(rowTier),
        lemonSqueezyId: subscription.lemon_squeezy_id,
      })
    }

    let query = supabase
      .from('subscriptions')
      .select('tier, created_at, lemon_squeezy_id')
      .eq('user_id', user.id)
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(5)

    if (tier) {
      query = query.eq('tier', tier)
    }

    const { data: rows, error } = await query

    if (error) {
      console.error('[checkout/verify] recent subscription lookup failed:', error)
      return NextResponse.json({ verified: false }, { status: 500 })
    }

    const recent = (rows ?? []) as SubscriptionVerifyRow[]
    const match = recent.find((r) => {
      const rowTier = r.tier
      if (tier && rowTier !== tier) return false
      if (parsed.data.tier && tierIsBundle(parsed.data.tier)) {
        return tierIsBundle(rowTier)
      }
      return true
    })

    if (!match) {
      return NextResponse.json({ verified: false, pending: true })
    }

    const matchTier = match.tier

    return NextResponse.json({
      verified: true,
      tier: matchTier,
      isBundle: tierIsBundle(matchTier),
      lemonSqueezyId: match.lemon_squeezy_id,
    })
  } catch (error) {
    console.error('[checkout/verify] unexpected error:', error)
    return NextResponse.json({ verified: false }, { status: 500 })
  }
}
