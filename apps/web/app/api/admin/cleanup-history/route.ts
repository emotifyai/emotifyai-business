import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    // This endpoint should be called by a cron job or scheduled task
    // In production, you might want to add authentication/authorization
    
    const supabase = await createClient()
    
    // Call the cleanup function
    const { data: deletedCount, error } = await (supabase as any)
      .rpc('cleanup_old_editor_history')
    
    if (error) {
      console.error('Error cleaning up old editor history:', error)
      return NextResponse.json(
        { error: 'Failed to cleanup history' },
        { status: 500 }
      )
    }

    console.log(`Cleaned up ${deletedCount} old editor history entries`)
    
    return NextResponse.json({ 
      success: true, 
      deletedCount: deletedCount || 0 
    })
  } catch (error) {
    console.error('Cleanup API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}