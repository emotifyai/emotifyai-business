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

    console.log('🦆 DUCK: Initializing EnhancementPopupManager');
    this.container = document.createElement('div');
    this.container.id = 'emotifyai-popup-root';
    document.body.appendChild(this.container);

    this.root = createRoot(this.container);
    this.renderPopup();
    console.log('🦆 DUCK: EnhancementPopupManager initialized');
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
    console.log('🦆 DUCK: EnhancementPopupManager.showPopup called');
    console.log('🦆 DUCK: Text:', text.substring(0, 50) + '...');
    console.log('🦆 DUCK: Selection:', selection);
    
    // Don't initialize here - should already be initialized
    console.log('🦆 DUCK: Popup should already be initialized, sending window message');
    
    // Extract serializable data from selection with smart positioning
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // Smart positioning logic
    const POPUP_WIDTH = 384; // w-96 = 384px
    const POPUP_HEIGHT = 400; // estimated popup height
    const MARGIN = 10; // minimum margin from viewport edges
    
    let x = rect.left + window.scrollX;
    let y = rect.top + window.scrollY;
    
    // Adjust horizontal position if popup would go off-screen
    if (x + POPUP_WIDTH > window.innerWidth) {
      x = window.innerWidth - POPUP_WIDTH - MARGIN;
    }
    if (x < MARGIN) {
      x = MARGIN;
    }
    
    // Smart vertical positioning
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    
    if (spaceAbove >= POPUP_HEIGHT || spaceAbove > spaceBelow) {
      // Position above selection
      y = rect.top + window.scrollY - POPUP_HEIGHT - MARGIN;
      if (y < window.scrollY + MARGIN) {
        y = window.scrollY + MARGIN;
      }
    } else {
      // Position below selection
      y = rect.bottom + window.scrollY + MARGIN;
      if (y + POPUP_HEIGHT > window.scrollY + window.innerHeight) {
        y = window.scrollY + window.innerHeight - POPUP_HEIGHT - MARGIN;
      }
    }
    
    console.log('🦆 DUCK: Smart positioning calculated:', {
      original: { x: rect.left, y: rect.top },
      adjusted: { x, y },
      viewport: { width: window.innerWidth, height: window.innerHeight },
      spaceAbove,
      spaceBelow
    });
    
    const selectionData = {
      text: selection.toString(),
      rangeCount: selection.rangeCount,
      position: {
        x,
        y,
        width: rect.width,
        height: rect.height
      }
    };
    
    console.log('🦆 DUCK: Selection data prepared:', selectionData);
    
    // Trigger popup show via state management
    window.postMessage({
      type: 'EMOTIFYAI_SHOW_POPUP',
      payload: { text, selection: selectionData }
    }, '*');
    
    console.log('🦆 DUCK: Window message sent');
  }

  hidePopup(): void {
    window.postMessage({
      type: 'EMOTIFYAI_HIDE_POPUP'
    }, '*');
  }
}

// Enhancement Popup Component with hooks
function EnhancementPopupComponent({ manager }: { manager: EnhancementPopupManager }) {
  console.log('🦆 DUCK: EnhancementPopupComponent mounted');
  
  const [state, setState] = React.useState({
    visible: false,
    position: { x: 0, y: 0 },
    originalText: '',
    enhancedText: '',
    isLoading: false,
    error: undefined as string | undefined
  });

  React.useEffect(() => {
    console.log('🦆 DUCK: EnhancementPopupComponent useEffect - setting up message listener');
    
    function handleMessage(event: MessageEvent) {
      console.log('🦆 DUCK: EnhancementPopupComponent received message:', event.data.type);
      if (event.source !== window) return;

      switch (event.data.type) {
        case 'EMOTIFYAI_SHOW_POPUP':
          console.log('🦆 DUCK: EnhancementPopupComponent received SHOW_POPUP message');
          console.log('🦆 DUCK: Event data:', event.data);
          
          const { text, selection: selectionData } = event.data.payload;
          
          console.log('🦆 DUCK: Text from payload:', text?.substring(0, 50) + '...');
          console.log('🦆 DUCK: Selection data:', selectionData);
          if (text && selectionData && selectionData.rangeCount > 0) {
            console.log('🦆 DUCK: ✅ Valid text and selection data, showing popup');
            console.log('🦆 DUCK: Position:', selectionData.position);
            
            setState({
              visible: true,
              position: { 
                x: Math.max(10, selectionData.position.x), 
                y: Math.max(10, selectionData.position.y - 10) 
              },
              originalText: text,
              enhancedText: '',
              isLoading: false,
              error: undefined
            });
            
            console.log('🦆 DUCK: ✅ Popup state updated, should be visible now');
          } else {
            console.log('🦆 DUCK: ❌ Invalid text or selection data');
            console.log('🦆 DUCK: Text:', !!text);
            console.log('🦆 DUCK: Selection data:', selectionData);
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
    console.log('🦆 DUCK: EnhancementPopupComponent message listener added');
    
    return () => {
      console.log('🦆 DUCK: EnhancementPopupComponent message listener removed');
      window.removeEventListener('message', handleMessage);
    };
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
    console.log('🦆 DUCK: Enhancement retry called with options:', options);
    console.log('🦆 DUCK: Original text:', state.originalText);
    
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const message = {
        type: 'ENHANCE_TEXT',
        payload: { 
          text: state.originalText, 
          options: {
            language: options.language === 'auto' ? undefined : options.language,
            tone: options.tone
          }
        }
      };
      
      console.log('🦆 DUCK: Sending message to background script:', message);
      
      const response = await browser.runtime.sendMessage(message);
      
      console.log('🦆 DUCK: Background script response:', response);

      if (response.success) {
        console.log('🦆 DUCK: ✅ Enhancement successful');
        setState(prev => ({ 
          ...prev, 
          enhancedText: response.enhancedText, 
          isLoading: false 
        }));
      } else {
        console.log('🦆 DUCK: ❌ Enhancement failed:', response.error);
        setState(prev => ({ 
          ...prev, 
          error: response.error || 'Enhancement failed', 
          isLoading: false 
        }));
      }
    } catch (error: any) {
      console.log('🦆 DUCK: ❌ Enhancement error:', error);
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
    console.log('🦆 DUCK: TextReplacementManager.replace called');
    console.log('🦆 DUCK: Original text:', originalText.substring(0, 50) + '...');
    console.log('🦆 DUCK: Enhanced text:', enhancedText.substring(0, 50) + '...');
    
    // Try to get current selection first
    let range = this.selectionManager.getRange();
    console.log('🦆 DUCK: Current selection range:', !!range);
    
    // If no current selection, try to find the text in the DOM
    if (!range) {
      console.log('🦆 DUCK: No current selection, searching for text in DOM');
      range = this.findTextInDOM(originalText);
      if (!range) {
        logger.warn('Could not find text in DOM');
        this.messageSender.showError('Could not locate the text to replace. Please try selecting the text again.');
        return false;
      }
      console.log('🦆 DUCK: ✅ Found text in DOM');
    }

    // Verify selection matches (if we have a current selection)
    const currentSelection = this.selectionManager.getSelectedText();
    if (currentSelection && currentSelection !== originalText) {
      console.log('🦆 DUCK: Current selection does not match original text');
      // Try to find the text in DOM as fallback
      range = this.findTextInDOM(originalText);
      if (!range) {
        logger.warn('Selected text does not match original text and could not find in DOM');
        this.messageSender.showError('Selection changed. Please try again.');
        return false;
      }
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

  private findTextInDOM(text: string): Range | null {
    console.log('🦆 DUCK: Searching for text in DOM:', text.substring(0, 30) + '...');
    
    // First try simple search in text nodes
    const simpleRange = this.findTextInTextNodes(text);
    if (simpleRange) {
      console.log('🦆 DUCK: ✅ Found text in single text node');
      return simpleRange;
    }

    // If not found, try more advanced search across multiple nodes
    console.log('🦆 DUCK: Trying advanced search across multiple nodes');
    const advancedRange = this.findTextAcrossNodes(text);
    if (advancedRange) {
      console.log('🦆 DUCK: ✅ Found text across multiple nodes');
      return advancedRange;
    }

    // Last resort: try fuzzy matching (allowing for slight differences)
    console.log('🦆 DUCK: Trying fuzzy text matching');
    const fuzzyRange = this.findTextFuzzy(text);
    if (fuzzyRange) {
      console.log('🦆 DUCK: ✅ Found text with fuzzy matching');
      return fuzzyRange;
    }

    // Final fallback: search in input fields and textareas
    console.log('🦆 DUCK: Trying search in input fields');
    const inputRange = this.findTextInInputs(text);
    if (inputRange) {
      console.log('🦆 DUCK: ✅ Found text in input field');
      return inputRange;
    }

    console.log('🦆 DUCK: ❌ Text not found in DOM with any method');
    return null;
  }

  private findTextInTextNodes(text: string): Range | null {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node: Node | null;
    while (node = walker.nextNode()) {
      const textContent = node.textContent || '';
      const index = textContent.indexOf(text);
      
      if (index !== -1) {
        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + text.length);
        return range;
      }
    }
    return null;
  }

  private findTextAcrossNodes(text: string): Range | null {
    // Get all text content and build a map of positions to nodes
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    );

    const textNodes: { node: Node; text: string; start: number }[] = [];
    let totalText = '';
    let node: Node | null;

    while (node = walker.nextNode()) {
      const nodeText = node.textContent || '';
      if (nodeText.trim()) {
        textNodes.push({
          node,
          text: nodeText,
          start: totalText.length
        });
        totalText += nodeText;
      }
    }

    const index = totalText.indexOf(text);
    if (index === -1) return null;

    // Find which nodes contain the start and end of our text
    const startPos = index;
    const endPos = index + text.length;

    let startNode: Node | null = null;
    let startOffset = 0;
    let endNode: Node | null = null;
    let endOffset = 0;

    for (const textNode of textNodes) {
      const nodeEnd = textNode.start + textNode.text.length;
      
      if (startNode === null && startPos >= textNode.start && startPos < nodeEnd) {
        startNode = textNode.node;
        startOffset = startPos - textNode.start;
      }
      
      if (endPos >= textNode.start && endPos <= nodeEnd) {
        endNode = textNode.node;
        endOffset = endPos - textNode.start;
        break;
      }
    }

    if (startNode && endNode) {
      const range = document.createRange();
      range.setStart(startNode, startOffset);
      range.setEnd(endNode, endOffset);
      return range;
    }

    return null;
  }

  private findTextFuzzy(text: string): Range | null {
    // Try multiple normalization strategies
    const strategies = [
      // Original text
      text,
      // Normalized whitespace
      text.replace(/\s+/g, ' ').trim(),
      // Replace bullet points with different variations
      text.replace(/•/g, '*').replace(/\s+/g, ' ').trim(),
      text.replace(/•/g, '-').replace(/\s+/g, ' ').trim(),
      text.replace(/•/g, '').replace(/\s+/g, ' ').trim(),
      // Remove special characters
      text.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim(),
      // First 50 characters (partial match)
      text.substring(0, 50).trim(),
      // First 30 characters (shorter partial match)
      text.substring(0, 30).trim()
    ];
    
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    );

    for (const searchText of strategies) {
      if (searchText.length < 10) continue; // Skip very short searches
      
      walker.currentNode = document.body;
      let node: Node | null;
      
      while (node = walker.nextNode()) {
        const textContent = node.textContent || '';
        
        // Try exact match
        let index = textContent.indexOf(searchText);
        if (index !== -1) {
          console.log('🦆 DUCK: ✅ Found exact match with strategy:', searchText.substring(0, 30));
          const range = document.createRange();
          range.setStart(node, index);
          range.setEnd(node, index + searchText.length);
          return range;
        }
        
        // Try normalized match
        const normalizedContent = textContent.replace(/\s+/g, ' ').trim();
        const normalizedSearch = searchText.replace(/\s+/g, ' ').trim();
        index = normalizedContent.indexOf(normalizedSearch);
        if (index !== -1) {
          console.log('🦆 DUCK: ✅ Found normalized match with strategy:', normalizedSearch.substring(0, 30));
          const range = document.createRange();
          range.setStart(node, 0);
          range.setEnd(node, node.textContent?.length || 0);
          return range;
        }
      }
    }
    
    return null;
  }

  private findTextInInputs(text: string): Range | null {
    // Search in input fields and textareas
    const inputs = document.querySelectorAll('input[type="text"], input[type="search"], textarea, [contenteditable="true"]');
    
    for (const input of inputs) {
      const element = input as HTMLInputElement | HTMLTextAreaElement | HTMLElement;
      let value = '';
      
      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        value = element.value;
      } else {
        value = element.textContent || element.innerText || '';
      }
      
      if (value.includes(text)) {
        console.log('🦆 DUCK: Found text in input element:', element);
        
        // For input fields, we need to handle replacement differently
        // Create a range that covers the input element
        const range = document.createRange();
        
        if (element.firstChild) {
          range.setStart(element.firstChild, 0);
          range.setEnd(element.firstChild, element.firstChild.textContent?.length || 0);
        } else {
          range.selectNode(element);
        }
        
        // Store reference to the input element for special handling
        (range as any)._inputElement = element;
        (range as any)._inputText = text;
        
        return range;
      }
    }
    
    return null;
  }

  private saveToUndoStack(range: Range, text: string): void {
    this.undoStack.push({
      node: range.startContainer,
      text,
      range: range.cloneRange(),
    });
  }

  private performReplacement(range: Range, newText: string): void {
    // Check if this is an input element (special handling needed)
    const inputElement = (range as any)._inputElement;
    const inputText = (range as any)._inputText;
    
    if (inputElement && inputText) {
      console.log('🦆 DUCK: Performing replacement in input element');
      
      if (inputElement instanceof HTMLInputElement || inputElement instanceof HTMLTextAreaElement) {
        // Handle input/textarea elements
        const currentValue = inputElement.value;
        const newValue = currentValue.replace(inputText, newText);
        inputElement.value = newValue;
        
        // Focus and set cursor position
        inputElement.focus();
        const cursorPos = newValue.indexOf(newText) + newText.length;
        inputElement.setSelectionRange(cursorPos, cursorPos);
      } else {
        // Handle contenteditable elements
        const currentContent = inputElement.textContent || inputElement.innerText || '';
        const newContent = currentContent.replace(inputText, newText);
        inputElement.textContent = newContent;
        
        // Set cursor after the replaced text
        const textNode = inputElement.firstChild;
        if (textNode) {
          const selection = window.getSelection();
          const range = document.createRange();
          const cursorPos = newContent.indexOf(newText) + newText.length;
          range.setStart(textNode, Math.min(cursorPos, textNode.textContent?.length || 0));
          range.collapse(true);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
        
        inputElement.focus();
      }
    } else {
      // Normal DOM text replacement
      range.deleteContents();
      const newTextNode = document.createTextNode(newText);
      range.insertNode(newTextNode);

      // Clear selection and place cursor
      this.selectionManager.clearSelection();
      this.selectionManager.setCaretAfter(newTextNode);
    }
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
    console.log('🦆 DUCK: RuntimeMessageHandler.handle called');
    console.log('🦆 DUCK: Message type:', message.type);
    console.log('🦆 DUCK: Message payload:', message.payload);
    
    const { type, payload } = message;

    switch (type) {
      case 'SHOW_ENHANCEMENT_POPUP':
        console.log('🦆 DUCK: Handling SHOW_ENHANCEMENT_POPUP');
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
    console.log('🦆 DUCK: handleShowEnhancementPopup called');
    console.log('🦆 DUCK: Payload:', payload);
    
    if (!payload?.text) {
      console.log('🦆 DUCK: ❌ Missing text in payload');
      logger.error('Missing text in SHOW_ENHANCEMENT_POPUP message');
      return;
    }

    console.log('🦆 DUCK: Text to enhance:', payload.text.substring(0, 50) + '...');
    
    const selection = this.selectionManager.getSelection();
    console.log('🦆 DUCK: Selection:', selection);
    console.log('🦆 DUCK: Selection range count:', selection?.rangeCount);
    
    // Try to use current selection, but if not available, create a mock selection for positioning
    if (selection && selection.rangeCount > 0) {
      console.log('🦆 DUCK: ✅ Valid selection, showing popup');
      this.enhancementPopupManager.showPopup(payload.text, selection);
    } else {
      console.log('🦆 DUCK: No current selection, but showing popup anyway (text was captured from context menu)');
      // Create a mock selection for positioning - center of viewport
      const mockSelection = {
        toString: () => payload.text,
        rangeCount: 1,
        getRangeAt: () => {
          const range = document.createRange();
          // Position popup in center of viewport
          const rect = {
            left: window.innerWidth / 2 - 200,
            top: window.innerHeight / 2 - 200,
            width: 0,
            height: 0,
            bottom: window.innerHeight / 2 - 200
          };
          (range as any).getBoundingClientRect = () => rect;
          return range;
        }
      } as unknown as Selection;
      
      this.enhancementPopupManager.showPopup(payload.text, mockSelection);
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

      case 'EMOTIFYAI_SHOW_POPUP':
        console.log('🦆 DUCK: WindowMessageHandler received SHOW_POPUP message');
        console.log('🦆 DUCK: Payload:', event.data.payload);
        // Let this message pass through to the popup component
        // Don't break here - let it bubble up to other listeners
        return;

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
    console.log('🦆 DUCK: Content script main() called');
    console.log('🦆 DUCK: Current URL:', window.location.href);
    logger.info('Content script loaded');

    // Initialize managers
    const overlayManager = new OverlayManager();
    const enhancementPopupManager = new EnhancementPopupManager();
    const messageSender = new MessageSender();
    const selectionManager = new SelectionManager();
    const textReplacementManager = new TextReplacementManager(selectionManager, messageSender);
    const enhancementService = new EnhancementService();

    // Initialize theme system for content script
    console.log('🦆 DUCK: Initializing theme system for content script');
    import('@/utils/theme').then(({ initializeTheme, setupSystemThemeListener }) => {
      initializeTheme().then(() => {
        setupSystemThemeListener();
        console.log('🦆 DUCK: ✅ Theme system initialized for content script');
      });
    });

    // Initialize popup manager early so React component can mount and set up listeners
    console.log('🦆 DUCK: Initializing popup manager early');
    enhancementPopupManager.initialize();

    // Initialize popup manager early so React component can mount and set up listeners
    console.log('🦆 DUCK: Initializing popup manager early');
    enhancementPopupManager.initialize();

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
      console.log('🦆 DUCK: Content script received runtime message');
      console.log('🦆 DUCK: Message:', message);
      runtimeMessageHandler.handle(message);
    });

    window.addEventListener('message', (event: MessageEvent<WindowMessage>) => {
      console.log('🦆 DUCK: Main window message listener received:', event.data.type);
      windowMessageHandler.handle(event);
    });

    // Also listen for custom events as a fallback
    window.addEventListener('emotifyai-auth-success', (event: Event) => {
      console.log('🦆 DUCK: Content script received custom auth success event');
      const customEvent = event as CustomEvent;
      console.log('🦆 DUCK: Event detail:', customEvent.detail);
      // Forward to background script
      browser.runtime.sendMessage({
        type: 'EMOTIFYAI_AUTH_SUCCESS',
        payload: customEvent.detail.payload,
        source: 'content_script_custom_event'
      }).catch(error => {
        console.log('🦆 DUCK: Failed to forward custom event auth message:', error);
      });
    });

    document.addEventListener('keydown', (event: KeyboardEvent) => {
      keyboardShortcutHandler.handle(event);
    });

    console.log('🦆 DUCK: ✅ Content script fully initialized');
    console.log('🦆 DUCK: Runtime message listener:', !!browser.runtime.onMessage);
    console.log('🦆 DUCK: Window message listener added');
    console.log('🦆 DUCK: Keyboard listener added');
    
    logger.info('Content script initialized');
  },
});