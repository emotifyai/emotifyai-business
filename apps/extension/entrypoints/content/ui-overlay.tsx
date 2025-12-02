import React, { useState, useEffect, useCallback } from 'react';
import '../popup/style.css';

type OverlayType = 'loading' | 'success' | 'error';

interface OverlayState {
    visible: boolean;
    type: OverlayType | null;
    message: string;
}

interface MessagePayload {
    message?: string;
    error?: string;
}

interface WindowMessage {
    type: string;
    payload?: MessagePayload;
}

// ============================================================================
// Constants
// ============================================================================

const MESSAGE_TYPES = {
    SHOW_LOADING: 'VERBA_SHOW_LOADING',
    SHOW_SUCCESS: 'VERBA_SHOW_SUCCESS',
    SHOW_ERROR: 'VERBA_SHOW_ERROR',
    UNDO: 'VERBA_UNDO',
} as const;

const AUTO_HIDE_DURATION = {
    success: 3000,
    error: 5000,
} as const;

const DEFAULT_MESSAGES = {
    loading: 'Enhancing text...',
    success: 'Text enhanced!',
    error: 'Something went wrong',
} as const;

const BACKGROUND_STYLES: Record<OverlayType, string> = {
    success: 'bg-gradient-to-br from-[#667eea] to-[#764ba2]',
    error: 'bg-gradient-to-br from-[#f093fb] to-[#f5576c]',
    loading: 'bg-black/90',
};

// ============================================================================
// State Management
// ============================================================================

const INITIAL_STATE: OverlayState = {
    visible: false,
    type: null,
    message: '',
};

function createState(type: OverlayType, message: string): OverlayState {
    return {
        visible: true,
        type,
        message,
    };
}

// ============================================================================
// Message Handlers
// ============================================================================

class MessageHandler {
    private readonly setState: React.Dispatch<React.SetStateAction<OverlayState>>;

    constructor(setState: React.Dispatch<React.SetStateAction<OverlayState>>) {
        this.setState = setState;
    }

    handle(event: MessageEvent<WindowMessage>): void {
        if (event.source !== window) return;

        const { type, payload } = event.data;

        switch (type) {
            case MESSAGE_TYPES.SHOW_LOADING:
                this.showLoading();
                break;

            case MESSAGE_TYPES.SHOW_SUCCESS:
                this.showSuccess(payload?.message);
                break;

            case MESSAGE_TYPES.SHOW_ERROR:
                this.showError(payload?.error);
                break;

            default:
                break;
        }
    }

    private showLoading(): void {
        this.setState(createState('loading', DEFAULT_MESSAGES.loading));
    }

    private showSuccess(message?: string): void {
        this.setState(createState('success', message || DEFAULT_MESSAGES.success));
        this.autoHide(AUTO_HIDE_DURATION.success);
    }

    private showError(error?: string): void {
        this.setState(createState('error', error || DEFAULT_MESSAGES.error));
        this.autoHide(AUTO_HIDE_DURATION.error);
    }

    private autoHide(duration: number): void {
        setTimeout(() => {
            this.setState((prev) => ({ ...prev, visible: false }));
        }, duration);
    }
}

// ============================================================================
// UI Components
// ============================================================================

function LoadingSpinner() {
    return (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    );
}

interface UndoButtonProps {
    onClick: () => void;
}

function UndoButton({ onClick }: UndoButtonProps) {
    return (
        <button
            className="px-3 py-1.5 border-none rounded-md bg-white/20 text-white text-xs font-semibold cursor-pointer transition-colors hover:bg-white/30"
            onClick={onClick}
            type="button"
        >
            Undo
        </button>
    );
}

// ============================================================================
// Hooks
// ============================================================================

function useOverlayMessages(
    setState: React.Dispatch<React.SetStateAction<OverlayState>>
) {
    useEffect(() => {
        const handler = new MessageHandler(setState);
        const handleMessage = (event: MessageEvent<WindowMessage>) => {
            handler.handle(event);
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [setState]);
}

function useUndo() {
    return useCallback(() => {
        window.postMessage({ type: MESSAGE_TYPES.UNDO }, '*');
    }, []);
}

// ============================================================================
// Utilities
// ============================================================================

function getBackgroundClass(type: OverlayType | null): string {
    if (!type) return BACKGROUND_STYLES.loading;
    return BACKGROUND_STYLES[type] || BACKGROUND_STYLES.loading;
}

// ============================================================================
// Main Component
// ============================================================================

export default function UIOverlay() {
    const [state, setState] = useState<OverlayState>(INITIAL_STATE);
    const sendUndo = useUndo();

    useOverlayMessages(setState);

    const handleUndo = useCallback(() => {
        sendUndo();
        setState((prev) => ({ ...prev, visible: false }));
    }, [sendUndo]);

    if (!state.visible) return null;

    const backgroundClass = getBackgroundClass(state.type);
    const showLoading = state.type === 'loading';
    const showUndo = state.type === 'success';

    return (
        <div
            className={`fixed top-5 right-5 z-[999999] p-4 rounded-xl backdrop-blur-md shadow-2xl text-white text-sm font-sans animate-slideIn ${backgroundClass}`}
        >
            <div className="flex items-center gap-3">
                {showLoading && <LoadingSpinner />}
                <span className="font-medium">{state.message}</span>
                {showUndo && <UndoButton onClick={handleUndo} />}
            </div>
        </div>
    );
}