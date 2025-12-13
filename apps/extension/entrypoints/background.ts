import { enhanceText } from '@/services/api/ai';
import { checkLimit } from '@/services/api/subscription';
import { getAuthToken, incrementUsage, watchStorage } from '@/utils/storage';
import { logger } from '@/utils/logger';
import { SubscriptionError, LanguageNotSupportedError, AuthenticationError } from '@/utils/errors';
import type { EnhanceTextMessage, EnhanceTextResponse } from '@/types';
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
      title: '✨ Enhance with Verba',
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

// Handle text enhancement from context menu
async function handleEnhanceText(text: string, tabId?: number): Promise<void> {
  try {
    logger.info('Showing enhancement popup from context menu', { textLength: text.length });

    // Check authentication first
    const token = await getAuthToken();
    if (!token) {
      if (tabId) {
        await browser.tabs.sendMessage(tabId, {
          type: 'SHOW_ERROR',
          payload: { error: 'Please log in to use Verba' },
        });
      }
      return;
    }

    // Show enhancement popup in content script
    if (tabId) {
      await browser.tabs.sendMessage(tabId, {
        type: 'SHOW_ENHANCEMENT_POPUP',
        payload: { text },
      });
    }

    logger.info('Enhancement popup shown successfully');
  } catch (error) {
    logger.error('Failed to show enhancement popup', error);

    // Fallback to error message
    if (tabId) {
      await browser.tabs.sendMessage(tabId, {
        type: 'SHOW_ERROR',
        payload: { error: 'Failed to open enhancement popup' },
      });
    }
  }
}

// Handle messages
async function handleMessage(message: any, sender: any): Promise<any> {
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

    case 'EMOTIFYAI_AUTH_SUCCESS': {
      // Handle authentication success from web app
      try {
        logger.info('Received auth success notification from web app', { user: payload?.user });
        
        // The web app has authenticated the user, but we still need to validate
        // and get the proper auth token through our API
        const { validateSession } = await import('@/services/api/auth');
        const { setUserProfile } = await import('@/utils/storage');
        
        const session = await validateSession();
        if (session.valid && session.user) {
          await setUserProfile(session.user);
          logger.info('Extension authentication updated from web app notification');
          
          // Update context menu state
          await updateContextMenuState(true);
          
          return { success: true, message: 'Authentication updated' };
        } else {
          logger.warn('Web app auth notification received but session validation failed');
          return { success: false, error: 'Session validation failed' };
        }
      } catch (error: any) {
        logger.error('Failed to handle auth success notification', error);
        return { success: false, error: error.message };
      }
    }

    default:
      logger.warn('Unknown message type', { type });
      return { success: false, error: 'Unknown message type' };
  }
}
