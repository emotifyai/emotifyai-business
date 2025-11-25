import { storage } from 'wxt/storage';
import type { User, Subscription, UsageStats, Settings, StorageSchema } from '@/types';
import { DEFAULT_SETTINGS } from '@/types';
import { logger } from './logger';

// Auth Token
export async function getAuthToken(): Promise<string | null> {
    try {
        return await storage.getItem<string>('local:authToken');
    } catch (error) {
        logger.error('Failed to get auth token', error);
        return null;
    }
}

export async function setAuthToken(token: string): Promise<void> {
    try {
        await storage.setItem('local:authToken', token);
        logger.debug('Auth token saved');
    } catch (error) {
        logger.error('Failed to save auth token', error);
        throw error;
    }
}

export async function clearAuthToken(): Promise<void> {
    try {
        await storage.removeItem('local:authToken');
        logger.debug('Auth token cleared');
    } catch (error) {
        logger.error('Failed to clear auth token', error);
    }
}

// User Profile
export async function getUserProfile(): Promise<User | null> {
    try {
        return await storage.getItem<User>('local:user');
    } catch (error) {
        logger.error('Failed to get user profile', error);
        return null;
    }
}

export async function setUserProfile(user: User): Promise<void> {
    try {
        await storage.setItem('local:user', user);
        logger.debug('User profile saved', user);
    } catch (error) {
        logger.error('Failed to save user profile', error);
        throw error;
    }
}

export async function clearUserProfile(): Promise<void> {
    try {
        await storage.removeItem('local:user');
        logger.debug('User profile cleared');
    } catch (error) {
        logger.error('Failed to clear user profile', error);
    }
}

// Subscription
export async function getSubscription(): Promise<Subscription | null> {
    try {
        return await storage.getItem<Subscription>('local:subscription');
    } catch (error) {
        logger.error('Failed to get subscription', error);
        return null;
    }
}

export async function setSubscription(subscription: Subscription): Promise<void> {
    try {
        await storage.setItem('local:subscription', subscription);
        logger.debug('Subscription saved', subscription);
    } catch (error) {
        logger.error('Failed to save subscription', error);
        throw error;
    }
}

// Usage Stats
export async function getUsageStats(): Promise<UsageStats | null> {
    try {
        return await storage.getItem<UsageStats>('local:usageStats');
    } catch (error) {
        logger.error('Failed to get usage stats', error);
        return null;
    }
}

export async function updateUsageStats(stats: UsageStats): Promise<void> {
    try {
        await storage.setItem('local:usageStats', stats);
        logger.debug('Usage stats updated', stats);
    } catch (error) {
        logger.error('Failed to update usage stats', error);
        throw error;
    }
}

export async function incrementUsage(): Promise<UsageStats> {
    const currentStats = await getUsageStats();
    const newStats: UsageStats = {
        used: (currentStats?.used || 0) + 1,
        limit: currentStats?.limit || 10,
        resetDate: currentStats?.resetDate,
        lastUsed: new Date().toISOString(),
    };
    await updateUsageStats(newStats);
    return newStats;
}

// Settings
export async function getSettings(): Promise<Settings> {
    try {
        const settings = await storage.getItem<Settings>('local:settings');
        return settings || DEFAULT_SETTINGS;
    } catch (error) {
        logger.error('Failed to get settings', error);
        return DEFAULT_SETTINGS;
    }
}

export async function setSettings(settings: Partial<Settings>): Promise<void> {
    try {
        const currentSettings = await getSettings();
        const newSettings = { ...currentSettings, ...settings };
        await storage.setItem('local:settings', newSettings);
        logger.debug('Settings saved', newSettings);
    } catch (error) {
        logger.error('Failed to save settings', error);
        throw error;
    }
}

// Clear all data (logout)
export async function clearAllData(): Promise<void> {
    try {
        await clearAuthToken();
        await clearUserProfile();
        await storage.removeItem('local:subscription');
        await storage.removeItem('local:usageStats');
        logger.info('All user data cleared');
    } catch (error) {
        logger.error('Failed to clear all data', error);
        throw error;
    }
}

// Storage change listener
export function watchStorage<K extends keyof StorageSchema>(
    key: K,
    callback: (newValue: StorageSchema[K] | null, oldValue: StorageSchema[K] | null) => void
): () => void {
    const unwatch = storage.watch<StorageSchema[K]>(key, (newValue, oldValue) => {
        callback(newValue, oldValue);
    });
    return unwatch;
}
