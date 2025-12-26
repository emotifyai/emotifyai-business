import { NextResponse } from 'next/server'
import { debugLogger, webhookLog } from '@/lib/debug-logger'

export async function GET() {
    // Test the debug logger
    debugLogger.info('Test log from debug endpoint', { test: true })
    webhookLog.info('Test webhook log', { webhook: true })
    
    return NextResponse.json({
        success: true,
        message: 'Test logs sent',
        timestamp: new Date().toISOString()
    })
}

export async function POST(request: Request) {
    const { message, level = 'info' } = await request.json()
    
    switch (level) {
        case 'error':
            webhookLog.error(message, { manual: true })
            break
        case 'warn':
            webhookLog.warn(message, { manual: true })
            break
        case 'debug':
            webhookLog.debug(message, { manual: true })
            break
        default:
            webhookLog.info(message, { manual: true })
    }
    
    return NextResponse.json({ success: true })
}