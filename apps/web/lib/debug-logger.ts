/**
 * Debug Logger for Production Debugging
 * Stores logs in memory and streams them via Server-Sent Events
 */

interface LogEntry {
    timestamp: string
    level: 'info' | 'warn' | 'error' | 'debug'
    message: string
    data?: any
    source: string
}

class DebugLogger {
    private logs: LogEntry[] = []
    private maxLogs = 1000 // Keep last 1000 logs
    private listeners: Set<(log: LogEntry) => void> = new Set()

    private addLog(level: LogEntry['level'], message: string, data?: any, source = 'app') {
        const log: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            data: data ? JSON.stringify(data, null, 2) : undefined,
            source
        }

        this.logs.push(log)
        
        // Keep only last maxLogs entries
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs)
        }

        // Notify all listeners
        this.listeners.forEach(listener => {
            try {
                listener(log)
            } catch (error) {
                console.error('Error notifying log listener:', error)
            }
        })

        // Also log to console in development
        if (process.env.NODE_ENV === 'development') {
            const logMethod = level === 'error' ? console.error : 
                            level === 'warn' ? console.warn : 
                            console.log
            logMethod(`[${source}] ${message}`, data || '')
        }
    }

    info(message: string, data?: any, source = 'app') {
        this.addLog('info', message, data, source)
    }

    warn(message: string, data?: any, source = 'app') {
        this.addLog('warn', message, data, source)
    }

    error(message: string, data?: any, source = 'app') {
        this.addLog('error', message, data, source)
    }

    debug(message: string, data?: any, source = 'app') {
        this.addLog('debug', message, data, source)
    }

    getLogs(): LogEntry[] {
        return [...this.logs]
    }

    addListener(listener: (log: LogEntry) => void): () => void {
        this.listeners.add(listener)
        return () => this.listeners.delete(listener)
    }

    clear() {
        this.logs = []
    }
}

// Global instance
export const debugLogger = new DebugLogger()

// Helper function to replace console.log in webhook
export const webhookLog = {
    info: (message: string, data?: any) => debugLogger.info(message, data, 'webhook'),
    warn: (message: string, data?: any) => debugLogger.warn(message, data, 'webhook'),
    error: (message: string, data?: any) => debugLogger.error(message, data, 'webhook'),
    debug: (message: string, data?: any) => debugLogger.debug(message, data, 'webhook'),
}