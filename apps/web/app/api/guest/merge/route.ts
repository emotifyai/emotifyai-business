import { NextResponse } from 'next/server'

import { consumeGuestSession } from '@/lib/upstash/ratelimit'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const MergeRequestSchema = z.object({
  token: z.string().min(1).max(200),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = MergeRequestSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    const { token } = validation.data
    
    // 1. Consume session from Upstash. 
    // This atomic operation ensures we don't double-count if the client calls this twice.
    const creditsToMerge = await consumeGuestSession(token)

    if (creditsToMerge > 0) {
      // 2. Consume credits from the user's subscription in Supabase
      const { error } = await supabase.rpc('consume_credits', {
        user_uuid: user.id,
        credits_to_consume: creditsToMerge,
      }).single()

      if (error) {
        console.error('[DUCK guest/merge] Failed to consume credits:', error)
        // If Supabase fails, we've already marked the session as merged in Upstash.
        // This is a rare edge case, but preventing double-crediting is safer than 
        // failing to deduct credits.
      } else {
        console.log(`[DUCK guest/merge] Merged ${creditsToMerge} credits for user ${user.id}`)
      }
    }

    return NextResponse.json({ success: true, merged: creditsToMerge })
  } catch (error) {
    console.error('[DUCK guest/merge] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
