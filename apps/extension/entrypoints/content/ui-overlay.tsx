import { useState, useEffect } from 'react';
import './ui-overlay.css';

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

    return (
        <div className={`verba-overlay verba-overlay--${state.type}`}>
            <div className="verba-overlay__content">
                {state.type === 'loading' && (
                    <div className="verba-spinner" />
                )}
                <span className="verba-overlay__message">{state.message}</span>
                {state.type === 'success' && (
                    <button
                        className="verba-overlay__undo"
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
