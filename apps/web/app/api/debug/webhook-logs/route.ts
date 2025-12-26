import { NextRequest, NextResponse } from 'next/server'
import { debugLogger } from '@/lib/debug-logger'

export async function GET(request: NextRequest) {
    try {
        const logs = debugLogger.getLogs()
        
        // Filter for webhook logs only
        const webhookLogs = logs.filter(log => log.source === 'webhook')
        
        return NextResponse.json({
            success: true,
            logs: webhookLogs,
            total: webhookLogs.length
        })
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch logs'
        }, { status: 500 })
    }
}

export async function DELETE() {
    try {
        debugLogger.clear()
        return NextResponse.json({
            success: true,
            message: 'Logs cleared'
        })
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Failed to clear logs'
        }, { status: 500 })
    }
}