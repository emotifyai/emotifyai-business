import { logger } from '@/utils/logger';
import { createRoot } from 'react-dom/client';
import UIOverlay from './content/ui-overlay';
import type { Root } from 'react-dom/client';

// ============================================================================
// Types
// ============================================================================

type UndoAction = {
  node: Node;
  text: string;
  range: Range;
};

type MessageType = 'SHOW_LOADING' | 'REPLACE_TEXT' | 'SHOW_ERROR';

type RuntimeMessage = {
  type: MessageType;
  payload?: {
    originalText?: string;
    enhancedText?: string;
    error?: string;
  };
};

type WindowMessage = {
  type: string;
  payload?: {
    message?: string;
    error?: string;
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
    private messageSender: MessageSender,
    private textReplacementManager: TextReplacementManager
  ) {}

  handle(message: RuntimeMessage): void {
    const { type, payload } = message;

    switch (type) {
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
  constructor(private textReplacementManager: TextReplacementManager) {}

  handle(event: MessageEvent<WindowMessage>): void {
    // Only handle messages from same window
    if (event.source !== window) return;

    if (event.data.type === MESSAGE_TYPES.WINDOW.UNDO) {
      this.textReplacementManager.undo();
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
    const messageSender = new MessageSender();
    const selectionManager = new SelectionManager();
    const textReplacementManager = new TextReplacementManager(selectionManager, messageSender);
    const enhancementService = new EnhancementService();

    // Initialize handlers
    const runtimeMessageHandler = new RuntimeMessageHandler(
      overlayManager,
      messageSender,
      textReplacementManager
    );
    const windowMessageHandler = new WindowMessageHandler(textReplacementManager);
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

    document.addEventListener('keydown', (event: KeyboardEvent) => {
      keyboardShortcutHandler.handle(event);
    });

    logger.info('Content script initialized');
  },
});