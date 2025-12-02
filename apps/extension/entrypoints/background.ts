import { enhanceText } from '@/services/api/ai';
import { checkLimit } from '@/services/api/subscription';
import { getAuthToken, incrementUsage, watchStorage } from '@/utils/storage';
import { logger } from '@/utils/logger';
import { SubscriptionError, LanguageNotSupportedError, AuthenticationError } from '@/utils/errors';
import type { EnhanceTextMessage, EnhanceTextResponse, MessageType } from '@/types';
import {browser} from "wxt/browser";

export default defineBackground(() => {
  logger.info('Background script initialized');

  // Create context menu on installation
  browser.runtime.onInstalled.addListener(async () => {
    await createContextMenu();
  });

  // Update context menu based on auth state
  watchStorage('local:authToken', async (newToken) => {
    await updateContextMenuState(!!newToken);
  });

  // Handle context menu clicks
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'enhance-text' && info.selectionText) {
      await handleEnhanceText(info.selectionText, tab?.id);
    }
  });

  // Handle messages from content script and popup
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleMessage(message, sender)
      .then(sendResponse)
      .catch((error) => {
        logger.error('Message handling failed', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep channel open for async response
  });
});

// Create context menu
async function createContextMenu(): Promise<void> {
  try {
    await browser.contextMenus.removeAll();

    const isAuthenticated = !!(await getAuthToken());

    browser.contextMenus.create({
      id: 'enhance-text',
      title: 'Enhance with Verba',
      contexts: ['selection'],
      enabled: isAuthenticated,
    });

    logger.debug('Context menu created', { enabled: isAuthenticated });
  } catch (error) {
    logger.error('Failed to create context menu', error);
  }
}

// Update context menu state
async function updateContextMenuState(isAuthenticated: boolean): Promise<void> {
  try {
    await browser.contextMenus.update('enhance-text', {
      enabled: isAuthenticated,
    });
    logger.debug('Context menu updated', { enabled: isAuthenticated });
  } catch (error) {
    logger.error('Failed to update context menu', error);
  }
}

// Handle text enhancement
async function handleEnhanceText(text: string, tabId?: number): Promise<void> {
  // Track total enhancement time (extension code + backend)
  const enhancementStart = performance.now();

  try {
    logger.info('Enhancing text from context menu', { textLength: text.length });

    // Check authentication
    const token = await getAuthToken();
    if (!token) {
      throw new AuthenticationError('Please log in to use Verba');
    }

    // Check usage limits
    await checkLimit();

    // Show loading state in content script
    if (tabId) {
      await browser.tabs.sendMessage(tabId, {
        type: 'SHOW_LOADING',
        payload: {},
      });
    }

    // Enhance text (backend API call is tracked inside enhanceText)
    const result = await enhanceText(text, { language: 'auto' });

    // Increment usage
    await incrementUsage();

    // Send enhanced text to content script
    if (tabId) {
      await browser.tabs.sendMessage(tabId, {
        type: 'REPLACE_TEXT',
        payload: {
          originalText: text,
          enhancedText: result.enhancedText,
        },
      });
    }

    // Log total enhancement time
    const totalDuration = performance.now() - enhancementStart;
    logger.info('Text enhanced successfully', {
      totalDuration: `${totalDuration.toFixed(2)}ms`,
    });
  } catch (error) {
    const totalDuration = performance.now() - enhancementStart;
    logger.error('Text enhancement failed', {
      error,
      totalDuration: `${totalDuration.toFixed(2)}ms`,
    });

    // Send error to content script
    if (tabId) {
      let errorMessage = 'Enhancement failed. Please try again.';

      if (error instanceof AuthenticationError) {
        errorMessage = 'Please log in to use Verba';
      } else if (error instanceof SubscriptionError) {
        errorMessage = error.message;
      } else if (error instanceof LanguageNotSupportedError) {
        errorMessage = error.message;
      }

      await browser.tabs.sendMessage(tabId, {
        type: 'SHOW_ERROR',
        payload: { error: errorMessage },
      });
    }
  }
}

// Handle messages
async function handleMessage(message: any, sender: browser.Runtime.MessageSender): Promise<any> {
  const { type, payload } = message;

  switch (type) {
    case 'ENHANCE_TEXT': {
      const { text, options } = payload as EnhanceTextMessage;
      try {
        await checkLimit();
        const result = await enhanceText(text, options);
        await incrementUsage();
        return { success: true, enhancedText: result.enhancedText } as EnhanceTextResponse;
      } catch (error: any) {
        return { success: false, error: error.message } as EnhanceTextResponse;
      }
    }

    case 'GET_AUTH_STATUS': {
      const token = await getAuthToken();
      return { authenticated: !!token };
    }

    default:
      logger.warn('Unknown message type', { type });
      return { success: false, error: 'Unknown message type' };
  }
}
