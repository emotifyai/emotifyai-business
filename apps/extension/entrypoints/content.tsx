import { logger } from '@/utils/logger';
import { createRoot } from 'react-dom/client';
import UIOverlay from './content/ui-overlay';
import type { Root } from 'react-dom/client';

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    logger.info('Content script loaded');

    let overlayRoot: Root | null = null;
    let overlayContainer: HTMLDivElement | null = null;
    let undoStack: Array<{ node: Node; text: string; range: Range }> = [];

    // Initialize UI overlay
    function initializeOverlay(): void {
      if (overlayContainer) return;

      overlayContainer = document.createElement('div');
      overlayContainer.id = 'verba-overlay-root';
      document.body.appendChild(overlayContainer);

      overlayRoot = createRoot(overlayContainer);
      overlayRoot.render(<UIOverlay />);
    }

    // Show loading state
    function showLoading(): void {
      initializeOverlay();
      window.postMessage({ type: 'VERBA_SHOW_LOADING' }, '*');
    }

    // Show success message
    function showSuccess(message: string = 'Text enhanced!'): void {
      window.postMessage({ type: 'VERBA_SHOW_SUCCESS', payload: { message } }, '*');
    }

    // Show error message
    function showError(error: string): void {
      window.postMessage({ type: 'VERBA_SHOW_ERROR', payload: { error } }, '*');
    }

    // Replace selected text
    function replaceSelectedText(originalText: string, enhancedText: string): void {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        logger.warn('No selection found');
        return;
      }

      const range = selection.getRangeAt(0);
      const selectedText = selection.toString();

      // Verify the selected text matches
      if (selectedText !== originalText) {
        logger.warn('Selected text does not match original text');
        showError('Selection changed. Please try again.');
        return;
      }

      // Save to undo stack
      const textNode = range.startContainer;
      undoStack.push({
        node: textNode,
        text: originalText,
        range: range.cloneRange(),
      });

      // Replace text
      range.deleteContents();
      const newTextNode = document.createTextNode(enhancedText);
      range.insertNode(newTextNode);

      // Clear selection
      selection.removeAllRanges();

      // Place cursor at end of new text
      const newRange = document.createRange();
      newRange.setStartAfter(newTextNode);
      newRange.collapse(true);
      selection.addRange(newRange);

      showSuccess();
      logger.info('Text replaced successfully');
    }

    // Undo last replacement
    function undoLastReplacement(): void {
      if (undoStack.length === 0) {
        logger.warn('Nothing to undo');
        return;
      }

      const lastAction = undoStack.pop();
      if (!lastAction) return;

      try {
        const { node, text, range } = lastAction;

        // Restore original text
        if (node.nodeType === Node.TEXT_NODE) {
          node.textContent = text;
        }

        logger.info('Undo successful');
        showSuccess('Undone!');
      } catch (error) {
        logger.error('Undo failed', error);
        showError('Undo failed');
      }
    }

    // Listen for messages from background script
    browser.runtime.onMessage.addListener((message) => {
      const { type, payload } = message;

      switch (type) {
        case 'SHOW_LOADING':
          showLoading();
          break;

        case 'REPLACE_TEXT':
          replaceSelectedText(payload.originalText, payload.enhancedText);
          break;

        case 'SHOW_ERROR':
          showError(payload.error);
          break;

        default:
          logger.warn('Unknown message type', { type });
      }
    });

    // Listen for undo requests from overlay
    window.addEventListener('message', (event) => {
      if (event.source !== window) return;

      if (event.data.type === 'VERBA_UNDO') {
        undoLastReplacement();
      }
    });

    // Keyboard shortcut (Ctrl+Shift+E)
    document.addEventListener('keydown', async (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'E') {
        event.preventDefault();

        const selection = window.getSelection();
        const selectedText = selection?.toString();

        if (!selectedText) {
          showError('Please select some text first');
          return;
        }

        showLoading();

        try {
          const response = await browser.runtime.sendMessage({
            type: 'ENHANCE_TEXT',
            payload: { text: selectedText, options: { language: 'auto' } },
          });

          if (response.success) {
            replaceSelectedText(selectedText, response.enhancedText);
          } else {
            showError(response.error || 'Enhancement failed');
          }
        } catch (error: any) {
          logger.error('Enhancement failed', error);
          showError('Enhancement failed. Please try again.');
        }
      }
    });

    logger.info('Content script initialized');
  },
});
