import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    try {
        // Test environment variables
        const envCheck = {
            hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            supabaseUrlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
            serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
            serviceKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 15) || 'none',
            urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) || 'none'
        }

        console.log('Environment check:', envCheck)

        // Test Supabase connection
        const supabase = await createAdminClient()
        
        // Try a simple query
        // @ts-ignore
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, email')
            .limit(5)

        // Try a count query
        // @ts-ignore
        const { count, error: countError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })

        return NextResponse.json({
            success: true,
            environment: envCheck,
            supabaseTest: {
                profilesSuccess: !profilesError,
                profilesError: profilesError?.message,
                profilesCount: profiles?.length || 0,
                profiles: profiles?.map(p => ({ id: p.id, email: p.email })) || [],
                totalCount: count,
                countError: countError?.message
            }
        })
    } catch (error) {
        console.error('Supabase test error:', error)
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 })
    }
}