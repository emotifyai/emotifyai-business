'use client'

import { useState, useEffect } from 'react'

interface LogEntry {
    timestamp: string
    level: 'info' | 'warn' | 'error' | 'debug'
    message: string
    data?: string
    source: string
}

export default function WebhookLogsPage() {
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [autoRefresh, setAutoRefresh] = useState(true)

    const fetchLogs = async () => {
        try {
            const response = await fetch('/api/debug/webhook-logs')
            const result = await response.json()
            if (result.success) {
                setLogs(result.logs)
            }
        } catch (error) {
            console.error('Failed to fetch logs:', error)
        } finally {
            setLoading(false)
        }
    }

    const clearLogs = async () => {
        try {
            await fetch('/api/debug/webhook-logs', { method: 'DELETE' })
            setLogs([])
        } catch (error) {
            console.error('Failed to clear logs:', error)
        }
    }

    useEffect(() => {
        fetchLogs()
    }, [])

    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(fetchLogs, 2000) // Refresh every 2 seconds
            return () => clearInterval(interval)
        }
    }, [autoRefresh])

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'error': return 'text-red-600 dark:text-red-400'
            case 'warn': return 'text-yellow-600 dark:text-yellow-400'
            case 'info': return 'text-blue-600 dark:text-blue-400'
            case 'debug': return 'text-gray-600 dark:text-gray-400'
            default: return 'text-gray-800 dark:text-gray-200'
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border p-6 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Webhook Debug Logs</h1>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={autoRefresh}
                                    onChange={(e) => setAutoRefresh(e.target.checked)}
                                    className="rounded"
                                />
                                <span className="text-sm text-gray-600 dark:text-gray-400">Auto-refresh</span>
                            </label>
                            <button
                                onClick={fetchLogs}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                            >
                                Refresh
                            </button>
                            <button
                                onClick={clearLogs}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                            >
                                Clear Logs
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="text-gray-600 dark:text-gray-400">Loading logs...</div>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-gray-600 dark:text-gray-400">No webhook logs found</div>
                            <div className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                                Trigger a webhook from Lemon Squeezy to see logs here
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {logs.map((log, index) => (
                                <div key={index} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className={`font-medium text-sm uppercase ${getLevelColor(log.level)}`}>
                                                {log.level}
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-400 bg-gray-200 dark:bg-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                                            {log.source}
                                        </span>
                                    </div>
                                    <div className="text-gray-900 font-medium mb-2 dark:text-gray-100">
                                        {log.message}
                                    </div>
                                    {log.data && (
                                        <details className="mt-2">
                                            <summary className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200">
                                                Show data
                                            </summary>
                                            <pre className="mt-2 text-xs bg-white dark:bg-gray-800 p-3 rounded border overflow-x-auto text-gray-900 dark:text-gray-100">
                                                {log.data}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}