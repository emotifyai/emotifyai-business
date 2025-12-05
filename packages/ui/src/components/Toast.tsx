import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextValue {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}

interface ToastProviderProps {
    children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback(
        (message: string, type: ToastType = 'info', duration: number = 3000) => {
            const id = `toast-${Date.now()}-${Math.random()}`;
            const toast: Toast = { id, message, type, duration };

            setToasts((prev) => [...prev, toast]);

            if (duration > 0) {
                setTimeout(() => removeToast(id), duration);
            }
        },
        [removeToast]
    );

    const success = useCallback(
        (message: string, duration?: number) => showToast(message, 'success', duration),
        [showToast]
    );

    const error = useCallback(
        (message: string, duration?: number) => showToast(message, 'error', duration),
        [showToast]
    );

    const info = useCallback(
        (message: string, duration?: number) => showToast(message, 'info', duration),
        [showToast]
    );

    const warning = useCallback(
        (message: string, duration?: number) => showToast(message, 'warning', duration),
        [showToast]
    );

    const value: ToastContextValue = {
        showToast,
        success,
        error,
        info,
        warning,
    };

    const getToastStyles = (type: ToastType) => {
        switch (type) {
            case 'success': return 'border-l-4 border-emerald-500';
            case 'error': return 'border-l-4 border-red-500';
            case 'warning': return 'border-l-4 border-amber-500';
            case 'info': return 'border-l-4 border-blue-500';
            default: return 'border-l-4 border-blue-500';
        }
    };

    const getIconStyles = (type: ToastType) => {
        switch (type) {
            case 'success': return 'bg-emerald-500 text-white';
            case 'error': return 'bg-red-500 text-white';
            case 'warning': return 'bg-amber-500 text-white';
            case 'info': return 'bg-blue-500 text-white';
            default: return 'bg-blue-500 text-white';
        }
    };

    const getIcon = (type: ToastType): string => {
        switch (type) {
            case 'success': return '✓';
            case 'error': return '✕';
            case 'warning': return '⚠';
            case 'info':
            default: return 'ℹ';
        }
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`flex items-center gap-3 min-w-[280px] max-w-[400px] px-4 py-3.5 bg-white rounded-lg shadow-lg pointer-events-auto cursor-pointer animate-slideIn transition-all hover:-translate-y-0.5 hover:shadow-xl ${getToastStyles(toast.type)}`}
                        onClick={() => removeToast(toast.id)}
                    >
                        <div className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold ${getIconStyles(toast.type)}`}>
                            {getIcon(toast.type)}
                        </div>
                        <div className="flex-1 text-sm text-gray-800 leading-snug">{toast.message}</div>
                        <button
                            className="shrink-0 w-5 h-5 flex items-center justify-center bg-transparent border-none rounded text-xl text-gray-400 cursor-pointer transition-all p-0 leading-none hover:bg-gray-100 hover:text-gray-600"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeToast(toast.id);
                            }}
                            aria-label="Close"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
