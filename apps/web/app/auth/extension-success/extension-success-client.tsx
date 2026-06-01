'use client'

import { CheckCircle, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ExtensionSuccessClient() {
    const [countdown, setCountdown] = useState(30)
    const [notificationSent, setNotificationSent] = useState(false)
    const [showCloseInstructions, setShowCloseInstructions] = useState(false)

    useEffect(() => {
        const notifyExtension = async () => {
            try {
                const response = await fetch('/api/auth/session')
                
                if (response.ok) {
                    const data = await response.json()
                    
                    if (data.valid && data.user) {
                        const productionExtensionId = process.env.NEXT_PUBLIC_EXTENSION_ID
                        
                        if (productionExtensionId && (window as any).chrome?.runtime) {
                            try {
                                await new Promise((resolve, reject) => {
                                    const timeout = setTimeout(() => {
                                        reject(new Error('Extension communication timeout'))
                                    }, 5000) as ReturnType<typeof setTimeout>

                                    ;(window as any).chrome.runtime.sendMessage(
                                        productionExtensionId,
                                        {
                                            type: 'EMOTIFYAI_AUTH_SUCCESS',
                                            payload: {
                                                user: data.user,
                                                token: data.token
                                            },
                                            source: 'web_app'
                                        },
                                        (response: unknown) => {
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
                                return
                            } catch {
                                // fallback below
                            }
                        }

                        const fallbackMessage = {
                            type: 'EMOTIFYAI_AUTH_SUCCESS',
                            payload: {
                                user: data.user,
                                token: data.token
                            },
                            source: 'web_app'
                        }
                        
                        window.postMessage(fallbackMessage, '*')
                        
                        const customEvent = new CustomEvent('emotifyai-auth-success', {
                            detail: fallbackMessage
                        })
                        window.dispatchEvent(customEvent)
                        
                        setNotificationSent(true)
                    }
                }
            } catch {
                // silent
            }
        }

        notifyExtension()

        const timer = setInterval(() => {
            setCountdown((prev) => (prev <= 1 ? 0 : prev - 1))
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    const handleClose = () => {
        window.close()
        setTimeout(() => {
            setShowCloseInstructions(true)
        }, 500)
    }

    const handleOpenDashboard = () => {
        window.open('/dashboard', '_blank')
    }

    return (
        <div dir="rtl" className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center relative">
                <button
                    onClick={handleClose}
                    className="absolute top-4 end-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="إغلاق النافذة"
                >
                    <X size={20} />
                </button>

                <div className="mb-6">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    كل شيء جاهز!
                </h1>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                    حسابك جاهز — ٥ تحويلات مجانية بعد التسجيل.
                    {notificationSent 
                        ? ' يجب أن تكون إضافتك متصلة تلقائياً!'
                        : ' أغلق هذا التبويب وانقر أيقونة الإضافة لإكمال الإعداد.'
                    }
                </p>

                <div className={`${notificationSent ? 'bg-green-50' : 'bg-blue-50'} rounded-lg p-4 mb-6 text-start`}>
                    <h3 className={`font-semibold ${notificationSent ? 'text-green-900' : 'text-blue-900'} mb-2`}>
                        {notificationSent ? 'جاهز للاستخدام!' : 'الخطوات التالية:'}
                    </h3>
                    {notificationSent ? (
                        <p className="text-sm text-green-800">
                            إضافتك متصلة الآن. يمكنك البدء بتحسين النصوص فوراً!
                        </p>
                    ) : (
                        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                            <li>أغلق هذا التبويب</li>
                            <li>انقر أيقونة إيموتيفاي</li>
                            <li>ستكتشف الإضافة تسجيل دخولك تلقائياً</li>
                        </ol>
                    )}
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-start">
                    <h3 className="font-semibold text-gray-900 mb-2">كيفية تحسين النص:</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                        <li>• حدّد نصاً في أي صفحة ويب</li>
                        <li>• انقر بالزر الأيمن واختر &laquo;تحسين مع إيموتيفاي&raquo;</li>
                        <li>• أو استخدم الاختصار: Ctrl+Shift+E</li>
                    </ul>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={handleClose}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        إغلاق هذا التبويب
                    </button>
                    
                    <button
                        onClick={handleOpenDashboard}
                        className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                        فتح لوحة التحكم
                    </button>
                </div>

                {showCloseInstructions ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4 text-start">
                        <p className="text-sm text-yellow-800">
                            <strong>لإغلاق التبويب:</strong><br />
                            اضغط <kbd className="px-1 py-0.5 bg-yellow-100 rounded text-xs">Ctrl+W</kbd> (Windows/Linux) أو <kbd className="px-1 py-0.5 bg-yellow-100 rounded text-xs">Cmd+W</kbd> (Mac)
                        </p>
                    </div>
                ) : countdown > 0 ? (
                    <p className="text-xs text-gray-400 mt-4">
                        العد التنازلي للإغلاق: {countdown} ثانية
                    </p>
                ) : (
                    <p className="text-xs text-gray-400 mt-4">
                        يمكنك إغلاق هذا التبويب يدوياً الآن
                    </p>
                )}
            </div>
        </div>
    )
}
