'use client'

import { CheckCircle, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ExtensionSuccessClient() {
    const [countdown, setCountdown] = useState(30)
    const [notificationSent, setNotificationSent] = useState(false)
    const [showCloseInstructions, setShowCloseInstructions] = useState(false)

    useEffect(() => {
        // Try to notify extension directly (production) and via postMessage (development fallback)
        const notifyExtension = async () => {
            try {
                
                // Get current session data with token
                const response = await fetch('/api/auth/session')
                
                if (response.ok) {
                    const data = await response.json()
                    
                    if (data.valid && data.user) {
                        
                        // Method 1: Direct extension communication (production with fixed extension ID)
                        const productionExtensionId = process.env.NEXT_PUBLIC_EXTENSION_ID
                        
                        if (productionExtensionId && (window as any).chrome?.runtime) {
                            try {
                                const response = await new Promise((resolve, reject) => {
                                    const timeout = setTimeout(() => {
                                        reject(new Error('Extension communication timeout'))
                                    }, 5000) as any

                                    (window as any).chrome.runtime.sendMessage(
                                        productionExtensionId,
                                        {
                                            type: 'EMOTIFYAI_AUTH_SUCCESS',
                                            payload: {
                                                user: data.user,
                                                token: data.token
                                            },
                                            source: 'web_app'
                                        },
                                        (response: any) => {
                                            clearTimeout(timeout)
                                            if ((window as any).chrome.runtime.lastError) {
                                                reject((window as any).chrome.runtime.lastError)
                                            } else {
                                                resolve(response)
                                            }
                                        }
                                    )
                                })
                                setNotificationSent(true)
                                return // Success, no need for fallback
                            } catch (error) {
                            }
                        }

                        // Method 2: PostMessage fallback (development)
                        const fallbackMessage = {
                            type: 'EMOTIFYAI_AUTH_SUCCESS',
                            payload: {
                                user: data.user,
                                token: data.token
                            },
                            source: 'web_app'
                        }
                        
                        // Try both postMessage and direct window communication
                        window.postMessage(fallbackMessage, '*')
                        
                        // Also try dispatching a custom event
                        const customEvent = new CustomEvent('emotifyai-auth-success', {
                            detail: fallbackMessage
                        })
                        window.dispatchEvent(customEvent)
                        
                        setNotificationSent(true)
                    } else {
                    }
                } else {
                }
            } catch (error) {
            }
        }

        notifyExtension()

        // Only run countdown timer, don't try to auto-close
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    // Don't auto-close, just stop the countdown
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    const handleClose = () => {
        // Try to close the window
        const closed = window.close()
        
        // If window.close() returns undefined or doesn't work, show instructions
        setTimeout(() => {
            setShowCloseInstructions(true)
        }, 500)
    }

    const handleOpenDashboard = () => {
        window.open('/dashboard', '_blank')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center relative">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close window"
                >
                    <X size={20} />
                </button>

                {/* Success icon */}
                <div className="mb-6">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                </div>

                {/* Success message */}
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    You're all set!
                </h1>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                    Your account is ready with a free trial (10 enhancements). 
                    {notificationSent 
                        ? " Your extension should now be connected automatically!"
                        : " Close this tab and click the extension icon to complete setup."
                    }
                </p>

                {/* Instructions */}
                <div className={`${notificationSent ? 'bg-green-50' : 'bg-blue-50'} rounded-lg p-4 mb-6`}>
                    <h3 className={`font-semibold ${notificationSent ? 'text-green-900' : 'text-blue-900'} mb-2`}>
                        {notificationSent ? 'Ready to use!' : 'Next steps:'}
                    </h3>
                    {notificationSent ? (
                        <p className="text-sm text-green-800">
                            Your extension is now connected. You can start enhancing text right away!
                        </p>
                    ) : (
                        <ol className="text-sm text-blue-800 space-y-1 text-left">
                            <li>1. Close this tab</li>
                            <li>2. Click the EmotifyAI extension icon</li>
                            <li>3. Extension will automatically detect your login</li>
                        </ol>
                    )}
                </div>

                {/* Usage Instructions */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">How to enhance text:</h3>
                    <ul className="text-sm text-gray-700 space-y-1 text-left">
                        <li>• Select text on any webpage</li>
                        <li>• Right-click and choose "Enhance with EmotifyAI"</li>
                        <li>• Or use the keyboard shortcut: Ctrl+Shift+E</li>
                    </ul>
                </div>

                {/* Action buttons */}
                <div className="space-y-3">
                    <button
                        onClick={handleClose}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Close this tab
                    </button>
                    
                    <button
                        onClick={handleOpenDashboard}
                        className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                        Open Dashboard
                    </button>
                </div>

                {/* Close instructions or countdown */}
                {showCloseInstructions ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                        <p className="text-sm text-yellow-800">
                            <strong>To close this tab:</strong><br />
                            Press <kbd className="px-1 py-0.5 bg-yellow-100 rounded text-xs">Ctrl+W</kbd> (Windows/Linux) or <kbd className="px-1 py-0.5 bg-yellow-100 rounded text-xs">Cmd+W</kbd> (Mac)
                        </p>
                    </div>
                ) : countdown > 0 ? (
                    <p className="text-xs text-gray-400 mt-4">
                        Auto-close countdown: {countdown} seconds
                    </p>
                ) : (
                    <p className="text-xs text-gray-400 mt-4">
                        You can now close this tab manually
                    </p>
                )}
            </div>
        </div>
    )
}