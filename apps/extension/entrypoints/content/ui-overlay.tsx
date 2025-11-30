import { useState, useEffect } from 'react';
import '../popup/style.css';

interface OverlayState {
    visible: boolean;
    type: 'loading' | 'success' | 'error' | null;
    message: string;
}

export default function UIOverlay() {
    const [state, setState] = useState<OverlayState>({
        visible: false,
        type: null,
        message: '',
    });

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.source !== window) return;

            const { type, payload } = event.data;

            switch (type) {
                case 'VERBA_SHOW_LOADING':
                    setState({
                        visible: true,
                        type: 'loading',
                        message: 'Enhancing text...',
                    });
                    break;

                case 'VERBA_SHOW_SUCCESS':
                    setState({
                        visible: true,
                        type: 'success',
                        message: payload?.message || 'Text enhanced!',
                    });
                    setTimeout(() => {
                        setState((prev) => ({ ...prev, visible: false }));
                    }, 3000);
                    break;

                case 'VERBA_SHOW_ERROR':
                    setState({
                        visible: true,
                        type: 'error',
                        message: payload?.error || 'Something went wrong',
                    });
                    setTimeout(() => {
                        setState((prev) => ({ ...prev, visible: false }));
                    }, 5000);
                    break;
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    if (!state.visible) return null;

    const handleUndo = () => {
        window.postMessage({ type: 'VERBA_UNDO' }, '*');
        setState((prev) => ({ ...prev, visible: false }));
    };

    const getBackgroundClass = () => {
        switch (state.type) {
            case 'success': return 'bg-gradient-to-br from-[#667eea] to-[#764ba2]';
            case 'error': return 'bg-gradient-to-br from-[#f093fb] to-[#f5576c]';
            case 'loading':
            default: return 'bg-black/90';
        }
    };

    return (
        <div className={`fixed top-5 right-5 z-[999999] p-4 rounded-xl backdrop-blur-md shadow-2xl text-white text-sm font-sans animate-slideIn ${getBackgroundClass()}`}>
            <div className="flex items-center gap-3">
                {state.type === 'loading' && (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                <span className="font-medium">{state.message}</span>
                {state.type === 'success' && (
                    <button
                        className="px-3 py-1.5 border-none rounded-md bg-white/20 text-white text-xs font-semibold cursor-pointer transition-colors hover:bg-white/30"
                        onClick={handleUndo}
                        type="button"
                    >
                        Undo
                    </button>
                )}
            </div>
        </div>
    );
}
