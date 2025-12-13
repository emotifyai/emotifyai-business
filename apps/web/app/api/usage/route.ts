import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/usage
 * Returns usage statistics and history for the authenticated user
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        
        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
            return NextResponse.json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required'
                }
            }, { status: 401 })
        }

        // Get query parameters
        const url = new URL(request.url)
        const type = url.searchParams.get('type') || 'stats'
        const page = parseInt(url.searchParams.get('page') || '0')
        const pageSize = parseInt(url.searchParams.get('pageSize') || '20')

        if (type === 'history') {
            // Return paginated usage history
            const from = page * pageSize
            const to = from + pageSize - 1

            const { data: logs, error, count } = await supabase
                .from('usage_logs')
                .select(`
                    id,
                    created_at,
                    input_text,
                    output_text,
                    language,
                    mode,
                    tokens_used,
                    credits_consumed,
                    success
                `, { count: 'exact' })
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .range(from, to)

            if (error) {
                return NextResponse.json({
                    success: false,
                    error: {
                        code: 'DATABASE_ERROR',
                        message: `Failed to fetch usage history: ${error.message}`
                    }
                }, { status: 500 })
            }

            const totalCount = count ?? 0
            const hasMore = to < totalCount - 1
            const nextPage = hasMore ? page + 1 : null

            return NextResponse.json({
                success: true,
                data: {
                    logs: logs || [],
                    pagination: {
                        page,
                        pageSize,
                        totalCount,
                        hasMore,
                        nextPage
                    }
                }
            })
        } else {
            // Return usage statistics
            
            // First get subscription data
            const subscriptionResponse = await fetch(`${url.origin}/api/subscription`, {
                headers: {
                    'Authorization': request.headers.get('Authorization') || '',
                    'Cookie': request.headers.get('Cookie') || ''
                }
            })
            
            if (!subscriptionResponse.ok) {
                return NextResponse.json({
                    success: false,
                    error: {
                        code: 'SUBSCRIPTION_ERROR',
                        message: 'Failed to fetch subscription data'
                    }
                }, { status: 500 })
            }

            const subscriptionData = await subscriptionResponse.json()
            if (!subscriptionData.success) {
                return NextResponse.json({
                    success: false,
                    error: subscriptionData.error
                }, { status: 500 })
            }

            // Calculate usage breakdowns from usage_logs
            const now = new Date()
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

            // Get usage counts for different periods
            const [dailyResult, weeklyResult, monthlyResult, totalResult] = await Promise.all([
                supabase
                    .from('usage_logs')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .eq('success', true)
                    .gte('created_at', oneDayAgo.toISOString()),
                supabase
                    .from('usage_logs')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .eq('success', true)
                    .gte('created_at', oneWeekAgo.toISOString()),
                supabase
                    .from('usage_logs')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .eq('success', true)
                    .gte('created_at', oneMonthAgo.toISOString()),
                supabase
                    .from('usage_logs')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .eq('success', true)
            ])

            // Check for errors
            if (dailyResult.error || weeklyResult.error || monthlyResult.error || totalResult.error) {
                const error = dailyResult.error || weeklyResult.error || monthlyResult.error || totalResult.error
                return NextResponse.json({
                    success: false,
                    error: {
                        code: 'DATABASE_ERROR',
                        message: `Failed to fetch usage statistics: ${error?.message}`
                    }
                }, { status: 500 })
            }

            return NextResponse.json({
                success: true,
                data: {
                    total_enhancements: totalResult.count ?? 0,
                    credits_used: subscriptionData.data.credits_used,
                    credits_remaining: subscriptionData.data.credits_remaining,
                    reset_date: subscriptionData.data.credits_reset_date,
                    daily_usage: dailyResult.count ?? 0,
                    weekly_usage: weeklyResult.count ?? 0,
                    monthly_usage: monthlyResult.count ?? 0,
                }
            })
        }

    } catch (error) {
        console.error('Usage API error:', error)
        return NextResponse.json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to fetch usage data'
            }
        }, { status: 500 })
    }
}