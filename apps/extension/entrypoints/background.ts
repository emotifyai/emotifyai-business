import { enhanceText } from '@/services/api/ai';
import { checkLimit } from '@/services/api/subscription';
import { getAuthToken, incrementUsage, watchStorage } from '@/utils/storage';
import { logger } from '@/utils/logger';
import { env } from '@/lib/env';
import type { EnhanceTextMessage, EnhanceTextResponse } from '@/types';
import { browser } from "wxt/browser";

// Maximum text length for URL parameter (to prevent URL too long errors)
const MAX_TEXT_LENGTH_FOR_URL = 2000;

export default defineBackground(() => {
  logger.info('Background script initialized');

  // Log extension ID for debugging
  logger.info('Extension ID:', browser.runtime.id);

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
    } else {
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

  // Handle external messages from web app
  if (browser.runtime.onMessageExternal) {
    browser.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
      logger.info('Received external message', { message, sender: sender.url });

      // Only accept messages from allowed origins (production and development)
      const allowedOrigins = [
        'https://emotifyai.com',
        'http://localhost:3000',
      ];

      const senderOrigin = sender.url ? new URL(sender.url).origin : '';
      if (!allowedOrigins.includes(senderOrigin)) {
        logger.warn('Rejected message from unauthorized origin', { origin: senderOrigin });
        sendResponse({ success: false, error: 'Unauthorized origin' });
        return;
      }
      handleMessage(message, sender)
        .then(sendResponse)
        .catch((error) => {
          logger.error('External message handling failed', error);
          sendResponse({ success: false, error: error.message });
        });
      return true; // Keep channel open for async response
    });
  }
});

// Create context menu
async function createContextMenu(): Promise<void> {
  try {
    await browser.contextMenus.removeAll();

    const isAuthenticated = !!(await getAuthToken());
    browser.contextMenus.create({
      id: 'enhance-text',
      title: '✨ Enhance with EmotifyAI',
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

    logger.info('Redirecting to web editor from context menu', { textLength: text.length });

    const webAppUrl = env.VITE_WEB_APP_URL;

    // Check authentication first
    const token = await getAuthToken();
    if (!token) {
      // Redirect to login page with redirect back to editor
      const loginUrl = `${webAppUrl}/login?redirectTo=/dashboard/editor`;
      await browser.tabs.create({ url: loginUrl });
      return;
    }

    // Truncate text if too long to prevent URL issues
    const truncatedText = text.length > MAX_TEXT_LENGTH_FOR_URL 
      ? text.substring(0, MAX_TEXT_LENGTH_FOR_URL) 
      : text;
    
    // Encode the text for URL transmission
    const encodedText = encodeURIComponent(truncatedText);
    const editorUrl = `${webAppUrl}/dashboard/editor?text=${encodedText}`;

    // Create new tab with editor
    await browser.tabs.create({
      url: editorUrl
    });

    logger.info('Successfully redirected to web editor');
  } catch (error) {
    logger.error('Failed to show enhancement popup', error);

    // Fallback to error message
    if (tabId) {
      try {
        await browser.scripting.executeScript({
          target: { tabId },
          files: ['content-scripts/content.js']
        });
        
        await browser.tabs.sendMessage(tabId, {
          type: 'SHOW_ERROR',
          payload: { error: 'Failed to open enhancement popup' },
        });
      } catch (fallbackError) {
      }
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

        if (!payload?.user || !payload?.token) {
          logger.error('Missing user data or token in auth success message');
          return { success: false, error: 'Missing user data or token' };
        }
        // Import storage utilities
        const { setUserProfile, setAuthToken } = await import('@/utils/storage');
        // Store the user profile and real Supabase token from the web app
        await setUserProfile(payload.user);
        await setAuthToken(payload.token);
        logger.info('Extension authentication updated from web app notification');

        // Update context menu state
        await updateContextMenuState(true);
        return { success: true, message: 'Authentication updated' };
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
