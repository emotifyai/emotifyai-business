import { logger } from '@/utils/logger';
import { getSettings, setSettings } from '@/utils/storage';
import type { Settings } from '@/types';
import { browser } from 'wxt/browser';

/**
 * Settings Synchronization Service
 * 
 * Handles syncing settings between local storage and chrome.storage.sync
 * to ensure user preferences are consistent across devices.
 */

const SYNC_KEY = 'sync:settings';

export interface SyncStatus {
    lastSynced: string | null;
    status: 'synced' | 'syncing' | 'error' | 'offline';
    error?: string;
}

/**
 * Initialize settings sync
 * Should be called when the extension starts or user logs in
 */
export async function initSettingsSync(): Promise<void> {
    try {
        // Check if sync is enabled in local settings
        const localSettings = await getSettings();

        // If we have synced data, merge it
        const syncedData = await browser.storage.sync.get(SYNC_KEY);
        const remoteSettings = syncedData[SYNC_KEY] as Partial<Settings> | undefined;

        if (remoteSettings) {
            logger.info('Found remote settings, merging...', remoteSettings);
            // Merge strategy: Remote wins for now, or we could use timestamps
            // For simplicity, we'll just merge remote into local
            await setSettings({ ...localSettings, ...remoteSettings });
        }

        // Watch for changes in sync storage (from other devices)
        browser.storage.onChanged.addListener((changes: any, areaName: string) => {
            if (areaName === 'sync' && changes[SYNC_KEY]) {
                const newValue = changes[SYNC_KEY].newValue;
                if (newValue) {
                    logger.info('Received settings update from sync', newValue);
                    // Update local settings without triggering a sync back
                    // We need a way to update local storage without triggering the watcher
                    // For now, we'll just set it and let the debounce handle it or ignore loops
                    setSettings(newValue).catch(err => logger.error('Failed to apply synced settings', err));
                }
            }
        });

        logger.info('Settings sync initialized');
    } catch (error) {
        logger.error('Failed to initialize settings sync', error);
    }
}

/**
 * Sync local settings to remote
 * Should be called whenever local settings change
 */
export async function syncSettingsToRemote(settings: Settings): Promise<void> {
    try {
        logger.debug('Syncing settings to remote...', settings);
        await browser.storage.sync.set({ [SYNC_KEY]: settings });
        logger.debug('Settings synced to remote');
    } catch (error) {
        logger.error('Failed to sync settings to remote', error);
        throw error;
    }
}

/**
 * Force a manual sync
 */
export async function forceSync(): Promise<void> {
    await initSettingsSync();
}
