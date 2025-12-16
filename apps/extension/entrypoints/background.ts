import { enhanceText } from '@/services/api/ai';
import { checkLimit } from '@/services/api/subscription';
import { getAuthToken, incrementUsage, watchStorage } from '@/utils/storage';
import { logger } from '@/utils/logger';
import { SubscriptionError, LanguageNotSupportedError, AuthenticationError } from '@/utils/errors';
import type { EnhanceTextMessage, EnhanceTextResponse } from '@/types';
import {browser} from "wxt/browser";

export default defineBackground(() => {
  console.log('🦆 DUCK: Background script starting');
  logger.info('Background script initialized');
  
  // Log extension ID for debugging
  console.log('🦆 DUCK: Extension ID:', browser.runtime.id);
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
    console.log('🦆 DUCK: Context menu clicked');
    console.log('🦆 DUCK: Menu item ID:', info.menuItemId);
    console.log('🦆 DUCK: Selection text:', info.selectionText?.substring(0, 50) + '...');
    console.log('🦆 DUCK: Tab info:', { id: tab?.id, url: tab?.url });
    
    if (info.menuItemId === 'enhance-text' && info.selectionText) {
      console.log('🦆 DUCK: ✅ Valid context menu click, calling handleEnhanceText');
      await handleEnhanceText(info.selectionText, tab?.id);
    } else {
      console.log('🦆 DUCK: ❌ Invalid context menu click or no selection');
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
  browser.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    console.log('🦆 DUCK: External message received in background script');
    console.log('🦆 DUCK: Message:', message);
    console.log('🦆 DUCK: Sender URL:', sender.url);
    logger.info('Received external message', { message, sender: sender.url });
    
    // Only accept messages from allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'https://emotifyai.com'
    ];
    
    const senderOrigin = sender.url ? new URL(sender.url).origin : '';
    console.log('🦆 DUCK: Sender origin:', senderOrigin);
    console.log('🦆 DUCK: Allowed origins:', allowedOrigins);
    
    if (!allowedOrigins.includes(senderOrigin)) {
      console.log('🦆 DUCK: ❌ Rejected message from unauthorized origin');
      logger.warn('Rejected message from unauthorized origin', { origin: senderOrigin });
      sendResponse({ success: false, error: 'Unauthorized origin' });
      return;
    }
    
    console.log('🦆 DUCK: ✅ Origin authorized, processing message');

    handleMessage(message, sender)
      .then(sendResponse)
      .catch((error) => {
        logger.error('External message handling failed', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep channel open for async response
  });
});

// Create context menu
async function createContextMenu(): Promise<void> {
  try {
    console.log('🦆 DUCK: Creating context menu');
    await browser.contextMenus.removeAll();

    const isAuthenticated = !!(await getAuthToken());
    console.log('🦆 DUCK: Is authenticated:', isAuthenticated);

    browser.contextMenus.create({
      id: 'enhance-text',
      title: '✨ Enhance with Verba',
      contexts: ['selection'],
      enabled: isAuthenticated,
    });

    console.log('🦆 DUCK: ✅ Context menu created successfully');
    logger.debug('Context menu created', { enabled: isAuthenticated });
  } catch (error) {
    logger.error('Failed to create context menu', error);
  }
}

// Update context menu state
async function updateContextMenuState(isAuthenticated: boolean): Promise<void> {
  try {
    console.log('🦆 DUCK: Updating context menu state');
    console.log('🦆 DUCK: Is authenticated:', isAuthenticated);
    
    await browser.contextMenus.update('enhance-text', {
      enabled: isAuthenticated,
    });
    
    console.log('🦆 DUCK: ✅ Context menu state updated');
    logger.debug('Context menu updated', { enabled: isAuthenticated });
  } catch (error) {
    logger.error('Failed to update context menu', error);
  }
}

// Handle text enhancement from context menu
async function handleEnhanceText(text: string, tabId?: number): Promise<void> {
  try {
    console.log('🦆 DUCK: handleEnhanceText called');
    console.log('🦆 DUCK: Text:', text.substring(0, 50) + '...');
    console.log('🦆 DUCK: Tab ID:', tabId);
    
    logger.info('Showing enhancement popup from context menu', { textLength: text.length });

    // Check authentication first
    const token = await getAuthToken();
    console.log('🦆 DUCK: Auth token available:', !!token);
    
    if (!token) {
      console.log('🦆 DUCK: ❌ No auth token, showing error');
      if (tabId) {
        await browser.tabs.sendMessage(tabId, {
          type: 'SHOW_ERROR',
          payload: { error: 'Please log in to use Verba' },
        });
      }
      return;
    }

    console.log('🦆 DUCK: ✅ Auth token found, sending SHOW_ENHANCEMENT_POPUP message');
    
    // Show enhancement popup in content script
    if (tabId) {
      console.log('🦆 DUCK: Sending message to tab:', tabId);
      const message = {
        type: 'SHOW_ENHANCEMENT_POPUP',
        payload: { text },
      };
      console.log('🦆 DUCK: Message:', message);
      
      await browser.tabs.sendMessage(tabId, message);
      console.log('🦆 DUCK: ✅ Message sent successfully');
    } else {
      console.log('🦆 DUCK: ❌ No tab ID available');
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
        console.log('🦆 DUCK: Processing EMOTIFYAI_AUTH_SUCCESS message');
        console.log('🦆 DUCK: Payload received:', payload);
        console.log('🦆 DUCK: User data:', payload?.user);
        console.log('🦆 DUCK: Token present:', !!payload?.token);
        logger.info('Received auth success notification from web app', { user: payload?.user });
        
        if (!payload?.user || !payload?.token) {
          console.log('🦆 DUCK: ❌ Missing user data or token');
          logger.error('Missing user data or token in auth success message');
          return { success: false, error: 'Missing user data or token' };
        }

        console.log('🦆 DUCK: Importing storage utilities');
        // Import storage utilities
        const { setUserProfile, setAuthToken } = await import('@/utils/storage');
        
        console.log('🦆 DUCK: Storing user profile and token');
        // Store the user profile and real Supabase token from the web app
        await setUserProfile(payload.user);
        await setAuthToken(payload.token);
        
        console.log('🦆 DUCK: ✅ Authentication data stored successfully');
        logger.info('Extension authentication updated from web app notification');
        
        // Update context menu state
        console.log('🦆 DUCK: Updating context menu state');
        await updateContextMenuState(true);
        
        console.log('🦆 DUCK: ✅ Auth success handling complete');
        return { success: true, message: 'Authentication updated' };
      } catch (error: any) {
        console.log('🦆 DUCK: ❌ Error handling auth success:', error);
        logger.error('Failed to handle auth success notification', error);
        return { success: false, error: error.message };
      }
    }

    default:
      logger.warn('Unknown message type', { type });
      return { success: false, error: 'Unknown message type' };
  }
}
