import React from 'react';
import { logger } from '@/utils/logger';
import { createRoot } from 'react-dom/client';
import UIOverlay from './content/ui-overlay';
import EnhancementPopup from './content/enhancement-popup';
import type { Root } from 'react-dom/client';
import { browser } from 'wxt/browser';

// ============================================================================
// Types
// ============================================================================

type UndoAction = {
  node: Node;
  text: string;
  range: Range;
};

type MessageType = 'SHOW_LOADING' | 'REPLACE_TEXT' | 'SHOW_ERROR' | 'SHOW_ENHANCEMENT_POPUP';

type RuntimeMessage = {
  type: MessageType;
  payload?: {
    originalText?: string;
    enhancedText?: string;
    error?: string;
    text?: string;
  };
};

type WindowMessage = {
  type: string;
  payload?: {
    message?: string;
    error?: string;
    originalText?: string;
    enhancedText?: string;
  };
};

// ============================================================================
// Constants
// ============================================================================

const OVERLAY_ROOT_ID = 'emotifyai-overlay-root';
const KEYBOARD_SHORTCUT = { ctrl: true, shift: true, key: 'E' };
const MESSAGE_TYPES = {
  WINDOW: {
    SHOW_LOADING: 'EMOTIFYAI_SHOW_LOADING',
    SHOW_SUCCESS: 'EMOTIFYAI_SHOW_SUCCESS',
    SHOW_ERROR: 'EMOTIFYAI_SHOW_ERROR',
    UNDO: 'EMOTIFYAI_UNDO',
  },
  RUNTIME: {
    SHOW_LOADING: 'SHOW_LOADING',
    REPLACE_TEXT: 'REPLACE_TEXT',
    SHOW_ERROR: 'SHOW_ERROR',
    ENHANCE_TEXT: 'ENHANCE_TEXT',
  },
} as const;

// ============================================================================
// Overlay Manager
// ============================================================================

class OverlayManager {
  private root: Root | null = null;
  private container: HTMLDivElement | null = null;

  initialize(): void {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.id = OVERLAY_ROOT_ID;
    document.body.appendChild(this.container);

    this.root = createRoot(this.container);
    this.root.render(<UIOverlay />);
  }
}

// ============================================================================
// Enhancement Popup Manager
// ============================================================================

class EnhancementPopupManager {
  private root: Root | null = null;
  private container: HTMLDivElement | null = null;
  private popupState: any = null;

  initialize(): void {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.id = 'emotifyai-popup-root';
    document.body.appendChild(this.container);

    this.root = createRoot(this.container);
    this.renderPopup();
  }

  private renderPopup(): void {
    if (!this.root) return;

    this.root.render(
      <EnhancementPopupComponent 
        manager={this}
      />
    );
  }

  showPopup(text: string, selection: Selection): void {
    this.initialize();
    // Trigger popup show via state management
    window.postMessage({
      type: 'EMOTIFYAI_SHOW_POPUP',
      payload: { text, selection }
    }, '*');
  }

  hidePopup(): void {
    window.postMessage({
      type: 'EMOTIFYAI_HIDE_POPUP'
    }, '*');
  }
}

// Enhancement Popup Component with hooks
function EnhancementPopupComponent({ manager }: { manager: EnhancementPopupManager }) {
  const [state, setState] = React.useState({
    visible: false,
    position: { x: 0, y: 0 },
    originalText: '',
    enhancedText: '',
    isLoading: false,
    error: undefined as string | undefined
  });

  React.useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.source !== window) return;

      switch (event.data.type) {
        case 'EMOTIFYAI_SHOW_POPUP':
          const { text } = event.data.payload;
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setState({
              visible: true,
              position: { 
                x: Math.max(10, rect.left), 
                y: Math.max(10, rect.top - 10) 
              },
              originalText: text,
              enhancedText: '',
              isLoading: false,
              error: undefined
            });
          }
          break;

        case 'EMOTIFYAI_HIDE_POPUP':
          setState(prev => ({ ...prev, visible: false }));
          break;

        case 'EMOTIFYAI_SET_LOADING':
          setState(prev => ({ ...prev, isLoading: true, error: undefined }));
          break;

        case 'EMOTIFYAI_SET_RESULT':
          setState(prev => ({ 
            ...prev, 
            enhancedText: event.data.payload.enhancedText, 
            isLoading: false, 
            error: undefined 
          }));
          break;

        case 'EMOTIFYAI_SET_ERROR':
          setState(prev => ({ 
            ...prev, 
            error: event.data.payload.error, 
            isLoading: false 
          }));
          break;
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleReplace = () => {
    window.postMessage({
      type: 'EMOTIFYAI_REPLACE_TEXT',
      payload: {
        originalText: state.originalText,
        enhancedText: state.enhancedText
      }
    }, '*');
  };

  const handleCancel = () => {
    setState(prev => ({ ...prev, visible: false }));
  };

  const handleRetry = async (options: any) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const response = await browser.runtime.sendMessage({
        type: 'ENHANCE_TEXT',
        payload: { 
          text: state.originalText, 
          options: {
            language: options.language === 'auto' ? undefined : options.language,
            tone: options.tone
          }
        }
      });

      if (response.success) {
        setState(prev => ({ 
          ...prev, 
          enhancedText: response.enhancedText, 
          isLoading: false 
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          error: response.error || 'Enhancement failed', 
          isLoading: false 
        }));
      }
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Enhancement failed', 
        isLoading: false 
      }));
    }
  };

  const handleUndo = () => {
    window.postMessage({ type: 'EMOTIFYAI_UNDO' }, '*');
  };

  return (
    <EnhancementPopup
      visible={state.visible}
      position={state.position}
      originalText={state.originalText}
      enhancedText={state.enhancedText}
      isLoading={state.isLoading}
      error={state.error}
      onReplace={handleReplace}
      onCancel={handleCancel}
      onRetry={handleRetry}
      onUndo={handleUndo}
    />
  );
}

// ============================================================================
// Message Sender
// ============================================================================

class MessageSender {
  private sendWindowMessage(type: string, payload?: unknown): void {
    window.postMessage({ type, payload }, '*');
  }

  showLoading(): void {
    this.sendWindowMessage(MESSAGE_TYPES.WINDOW.SHOW_LOADING);
  }

  showSuccess(message: string = 'Text enhanced!'): void {
    this.sendWindowMessage(MESSAGE_TYPES.WINDOW.SHOW_SUCCESS, { message });
  }

  showError(error: string): void {
    this.sendWindowMessage(MESSAGE_TYPES.WINDOW.SHOW_ERROR, { error });
  }
}

// ============================================================================
// Selection Manager
// ============================================================================

class SelectionManager {
  getSelection(): Selection | null {
    return window.getSelection();
  }

  getSelectedText(): string {
    return this.getSelection()?.toString() || '';
  }

  getRange(): Range | null {
    const selection = this.getSelection();
    return selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
  }

  clearSelection(): void {
    this.getSelection()?.removeAllRanges();
  }

  setCaretAfter(node: Node): void {
    const selection = this.getSelection();
    if (!selection) return;

    const range = document.createRange();
    range.setStartAfter(node);
    range.collapse(true);
    selection.addRange(range);
  }

  validateSelection(expectedText: string): boolean {
    return this.getSelectedText() === expectedText;
  }
}

// ============================================================================
// Text Replacement Manager
// ============================================================================

class TextReplacementManager {
  private undoStack: UndoAction[] = [];
  private selectionManager: SelectionManager;
  private messageSender: MessageSender;

  constructor(selectionManager: SelectionManager, messageSender: MessageSender) {
    this.selectionManager = selectionManager;
    this.messageSender = messageSender;
  }

  replace(originalText: string, enhancedText: string): boolean {
    const range = this.selectionManager.getRange();
    if (!range) {
      logger.warn('No selection found');
      return false;
    }

    // Verify selection matches
    if (!this.selectionManager.validateSelection(originalText)) {
      logger.warn('Selected text does not match original text');
      this.messageSender.showError('Selection changed. Please try again.');
      return false;
    }

    // Save to undo stack
    this.saveToUndoStack(range, originalText);

    // Perform replacement
    this.performReplacement(range, enhancedText);

    // Update UI
    this.messageSender.showSuccess();
    logger.info('Text replaced successfully');

    return true;
  }

  private saveToUndoStack(range: Range, text: string): void {
    this.undoStack.push({
      node: range.startContainer,
      text,
      range: range.cloneRange(),
    });
  }

  private performReplacement(range: Range, newText: string): void {
    range.deleteContents();
    const newTextNode = document.createTextNode(newText);
    range.insertNode(newTextNode);

    // Clear selection and place cursor
    this.selectionManager.clearSelection();
    this.selectionManager.setCaretAfter(newTextNode);
  }

  undo(): boolean {
    if (this.undoStack.length === 0) {
      logger.warn('Nothing to undo');
      return false;
    }

    const lastAction = this.undoStack.pop();
    if (!lastAction) return false;

    try {
      this.restoreOriginalText(lastAction);
      logger.info('Undo successful');
      this.messageSender.showSuccess('Undone!');
      return true;
    } catch (error) {
      logger.error('Undo failed', error);
      this.messageSender.showError('Undo failed');
      return false;
    }
  }

  private restoreOriginalText(action: UndoAction): void {
    const { node, text } = action;
    if (node.nodeType === Node.TEXT_NODE) {
      node.textContent = text;
    }
  }
}

// ============================================================================
// Enhancement Service
// ============================================================================

class EnhancementService {
  async enhance(text: string, options = { language: 'auto' }) {
    return browser.runtime.sendMessage({
      type: MESSAGE_TYPES.RUNTIME.ENHANCE_TEXT,
      payload: { text, options },
    });
  }
}

// ============================================================================
// Message Handlers
// ============================================================================

class RuntimeMessageHandler {
  constructor(
    private overlayManager: OverlayManager,
    private enhancementPopupManager: EnhancementPopupManager,
    private messageSender: MessageSender,
    private textReplacementManager: TextReplacementManager,
    private selectionManager: SelectionManager
  ) {}

  handle(message: RuntimeMessage): void {
    const { type, payload } = message;

    switch (type) {
      case 'SHOW_ENHANCEMENT_POPUP':
        this.handleShowEnhancementPopup(payload);
        break;

      case MESSAGE_TYPES.RUNTIME.SHOW_LOADING:
        this.handleShowLoading();
        break;

      case MESSAGE_TYPES.RUNTIME.REPLACE_TEXT:
        this.handleReplaceText(payload);
        break;

      case MESSAGE_TYPES.RUNTIME.SHOW_ERROR:
        this.handleShowError(payload);
        break;

      default:
        logger.warn('Unknown message type', { type });
    }
  }

  private handleShowEnhancementPopup(payload?: RuntimeMessage['payload']): void {
    if (!payload?.text) {
      logger.error('Missing text in SHOW_ENHANCEMENT_POPUP message');
      return;
    }

    const selection = this.selectionManager.getSelection();
    if (selection && selection.rangeCount > 0) {
      this.enhancementPopupManager.showPopup(payload.text, selection);
    } else {
      this.messageSender.showError('Please select some text first');
    }
  }

  private handleShowLoading(): void {
    this.overlayManager.initialize();
    this.messageSender.showLoading();
  }

  private handleReplaceText(payload?: RuntimeMessage['payload']): void {
    if (!payload?.originalText || !payload?.enhancedText) {
      logger.error('Missing text data in REPLACE_TEXT message');
      return;
    }

    this.textReplacementManager.replace(payload.originalText, payload.enhancedText);
  }

  private handleShowError(payload?: RuntimeMessage['payload']): void {
    if (payload?.error) {
      this.messageSender.showError(payload.error);
    }
  }
}

class WindowMessageHandler {
  constructor(
    private textReplacementManager: TextReplacementManager,
    private enhancementPopupManager: EnhancementPopupManager
  ) {}

  handle(event: MessageEvent<WindowMessage>): void {
    // Only handle messages from same window
    if (event.source !== window) return;

    switch (event.data.type) {
      case MESSAGE_TYPES.WINDOW.UNDO:
      case 'EMOTIFYAI_UNDO':
        this.textReplacementManager.undo();
        break;

      case 'EMOTIFYAI_REPLACE_TEXT':
        const { originalText, enhancedText } = event.data.payload || {};
        if (originalText && enhancedText) {
          this.textReplacementManager.replace(originalText, enhancedText);
          this.enhancementPopupManager.hidePopup();
        }
        break;

      case 'EMOTIFYAI_AUTH_SUCCESS':
        console.log('🦆 DUCK: Content script received auth success message');
        console.log('🦆 DUCK: Payload:', event.data.payload);
        // Forward the auth success message to the background script
        browser.runtime.sendMessage({
          type: 'EMOTIFYAI_AUTH_SUCCESS',
          payload: event.data.payload,
          source: 'content_script'
        }).catch(error => {
          console.log('🦆 DUCK: Failed to forward auth message to background:', error);
        });
        break;
    }
  }
}

// ============================================================================
// Keyboard Shortcut Handler
// ============================================================================

class KeyboardShortcutHandler {
  constructor(
    private selectionManager: SelectionManager,
    private messageSender: MessageSender,
    private enhancementService: EnhancementService,
    private textReplacementManager: TextReplacementManager,
    private overlayManager: OverlayManager
  ) {}

  async handle(event: KeyboardEvent): Promise<void> {
    if (!this.isShortcutPressed(event)) return;

    event.preventDefault();

    const selectedText = this.selectionManager.getSelectedText();
    if (!selectedText) {
      this.messageSender.showError('Please select some text first');
      return;
    }

    await this.enhanceSelectedText(selectedText);
  }

  private isShortcutPressed(event: KeyboardEvent): boolean {
    return (
      event.ctrlKey === KEYBOARD_SHORTCUT.ctrl &&
      event.shiftKey === KEYBOARD_SHORTCUT.shift &&
      event.key === KEYBOARD_SHORTCUT.key
    );
  }

  private async enhanceSelectedText(text: string): Promise<void> {
    this.overlayManager.initialize();
    this.messageSender.showLoading();

    try {
      const response = await this.enhancementService.enhance(text);

      if (response.success) {
        this.textReplacementManager.replace(text, response.enhancedText);
      } else {
        this.messageSender.showError(response.error || 'Enhancement failed');
      }
    } catch (error) {
      logger.error('Enhancement failed', error);
      this.messageSender.showError('Enhancement failed. Please try again.');
    }
  }
}

// ============================================================================
// Main Content Script
// ============================================================================

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    logger.info('Content script loaded');

    // Initialize managers
    const overlayManager = new OverlayManager();
    const enhancementPopupManager = new EnhancementPopupManager();
    const messageSender = new MessageSender();
    const selectionManager = new SelectionManager();
    const textReplacementManager = new TextReplacementManager(selectionManager, messageSender);
    const enhancementService = new EnhancementService();

    // Initialize handlers
    const runtimeMessageHandler = new RuntimeMessageHandler(
      overlayManager,
      enhancementPopupManager,
      messageSender,
      textReplacementManager,
      selectionManager
    );
    const windowMessageHandler = new WindowMessageHandler(
      textReplacementManager,
      enhancementPopupManager
    );
    const keyboardShortcutHandler = new KeyboardShortcutHandler(
      selectionManager,
      messageSender,
      enhancementService,
      textReplacementManager,
      overlayManager
    );

    // Setup listeners
    browser.runtime.onMessage.addListener((message: RuntimeMessage) => {
      runtimeMessageHandler.handle(message);
    });

    window.addEventListener('message', (event: MessageEvent<WindowMessage>) => {
      windowMessageHandler.handle(event);
    });

    // Also listen for custom events as a fallback
    window.addEventListener('emotifyai-auth-success', (event: CustomEvent) => {
      console.log('🦆 DUCK: Content script received custom auth success event');
      console.log('🦆 DUCK: Event detail:', event.detail);
      // Forward to background script
      browser.runtime.sendMessage({
        type: 'EMOTIFYAI_AUTH_SUCCESS',
        payload: event.detail.payload,
        source: 'content_script_custom_event'
      }).catch(error => {
        console.log('🦆 DUCK: Failed to forward custom event auth message:', error);
      });
    });

    document.addEventListener('keydown', (event: KeyboardEvent) => {
      keyboardShortcutHandler.handle(event);
    });

    logger.info('Content script initialized');
  },
});