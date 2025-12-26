'use client'

import { useEffect, useState } from 'react'

interface LogEntry {
    timestamp: string
    level: 'info' | 'warn' | 'error' | 'debug'
    message: string
    data?: string
    source: string
}

interface StreamMessage {
    type: 'connected' | 'log' | 'heartbeat'
    timestamp: string
    message?: string
    totalLogs?: number
    level?: string
    data?: string
    source?: string
}

export default function DevLogsPage() {
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [isConnected, setIsConnected] = useState(false)
    const [connectionError, setConnectionError] = useState<string>('')
    const [autoScroll, setAutoScroll] = useState(true)
    const [filter, setFilter] = useState<string>('')
    const [levelFilter, setLevelFilter] = useState<string>('all')

    useEffect(() => {
        const eventSource = new EventSource('/api/dev/logs')
        
        eventSource.onopen = () => {
            setIsConnected(true)
            setConnectionError('')
            console.log('EventSource connected')
        }

        eventSource.onmessage = (event) => {
            try {
                const data: StreamMessage = JSON.parse(event.data)
                console.log('Received message:', data)
                
                if (data.type === 'connected') {
                    console.log('Connected to debug log stream:', data.message)
                } else if (data.type === 'log') {
                    const logEntry: LogEntry = {
                        timestamp: data.timestamp,
                        level: data.level as LogEntry['level'],
                        message: data.message || '',
                        data: data.data,
                        source: data.source || 'app'
                    }
                    
                    setLogs(prev => [...prev, logEntry])
                    
                    // Auto scroll to bottom
                    if (autoScroll) {
                        setTimeout(() => {
                            const container = document.getElementById('logs-container')
                            if (container) {
                                container.scrollTop = container.scrollHeight
                            }
                        }, 100)
                    }
                } else if (data.type === 'heartbeat') {
                    console.log('Heartbeat received')
                }
            } catch (error) {
                console.error('Error parsing log message:', error, event.data)
            }
        }

        eventSource.onerror = (error) => {
            console.error('EventSource error:', error)
            setIsConnected(false)
            setConnectionError('Connection failed or lost')
        }

        return () => {
            eventSource.close()
            setIsConnected(false)
        }
    }, [autoScroll])

    const clearLogs = async () => {
        try {
            await fetch('/api/dev/logs', { method: 'DELETE' })
            setLogs([])
        } catch (error) {
            console.error('Error clearing logs:', error)
        }
    }

    const filteredLogs = logs.filter(log => {
        const matchesText = !filter || 
            log.message.toLowerCase().includes(filter.toLowerCase()) ||
            log.source.toLowerCase().includes(filter.toLowerCase()) ||
            (log.data && log.data.toLowerCase().includes(filter.toLowerCase()))
        
        const matchesLevel = levelFilter === 'all' || log.level === levelFilter
        
        return matchesText && matchesLevel
    })

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'error': return 'text-red-400'
            case 'warn': return 'text-yellow-400'
            case 'info': return 'text-blue-400'
            case 'debug': return 'text-gray-400'
            default: return 'text-gray-300'
        }
    }

    const getLevelBg = (level: string) => {
        switch (level) {
            case 'error': return 'bg-red-900/20'
            case 'warn': return 'bg-yellow-900/20'
            case 'info': return 'bg-blue-900/20'
            case 'debug': return 'bg-gray-900/20'
            default: return 'bg-gray-900/10'
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Debug Logs</h1>
                        <p className="text-gray-400">
                            Real-time application logs for debugging
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                        <span className="text-sm text-gray-400">
                            {isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                        {connectionError && (
                            <span className="text-xs text-red-400">({connectionError})</span>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-400">Filter:</label>
                            <input
                                type="text"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                placeholder="Search logs..."
                                className="bg-gray-700 text-white px-3 py-1 rounded text-sm"
                            />
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-400">Level:</label>
                            <select
                                value={levelFilter}
                                onChange={(e) => setLevelFilter(e.target.value)}
                                className="bg-gray-700 text-white px-3 py-1 rounded text-sm"
                            >
                                <option value="all">All</option>
                                <option value="error">Error</option>
                                <option value="warn">Warn</option>
                                <option value="info">Info</option>
                                <option value="debug">Debug</option>
                            </select>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="autoscroll"
                                checked={autoScroll}
                                onChange={(e) => setAutoScroll(e.target.checked)}
                                className="rounded"
                            />
                            <label htmlFor="autoscroll" className="text-sm text-gray-400">
                                Auto-scroll
                            </label>
                        </div>
                        
                        <button
                            onClick={clearLogs}
                            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                        >
                            Clear Logs
                        </button>
                        
                        <button
                            onClick={async () => {
                                try {
                                    await fetch('/api/debug/test')
                                } catch (error) {
                                    console.error('Test failed:', error)
                                }
                            }}
                            className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
                        >
                            Test Logs
                        </button>
                        
                        <div className="text-sm text-gray-400">
                            {filteredLogs.length} / {logs.length} logs
                        </div>
                    </div>
                </div>

                {/* Logs Container */}
                <div 
                    id="logs-container"
                    className="bg-black rounded-lg p-4 h-[70vh] overflow-y-auto font-mono text-sm"
                >
                    {filteredLogs.length === 0 ? (
                        <div className="text-gray-500 text-center py-8">
                            {logs.length === 0 ? 'No logs yet...' : 'No logs match current filters'}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredLogs.map((log, index) => (
                                <div 
                                    key={index} 
                                    className={`p-2 rounded ${getLevelBg(log.level)} border-l-2 border-l-gray-600`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-gray-500 text-xs whitespace-nowrap">
                                            {new Date(log.timestamp).toLocaleTimeString()}
                                        </span>
                                        <span className={`text-xs font-semibold uppercase ${getLevelColor(log.level)} whitespace-nowrap`}>
                                            {log.level}
                                        </span>
                                        <span className="text-xs text-purple-400 whitespace-nowrap">
                                            [{log.source}]
                                        </span>
                                        <span className="text-gray-200 flex-1">
                                            {log.message}
                                        </span>
                                    </div>
                                    {log.data && (
                                        <div className="mt-2 ml-20 text-xs text-gray-400 bg-gray-900/50 p-2 rounded overflow-x-auto">
                                            <pre>{log.data}</pre>
                                        </div>
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