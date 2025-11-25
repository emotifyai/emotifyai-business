import { apiPost, apiGet } from './client';
import { setAuthToken, setUserProfile, setSubscription, clearAllData } from '@/utils/storage';
import { logger } from '@/utils/logger';
import type { User, Subscription } from '@/types';
import { AuthResponseSchema } from '@/schemas/validation';

interface LoginResponse {
    token: string;
    user: User;
    subscription: Subscription;
}

export async function login(oauthToken: string): Promise<LoginResponse> {
    try {
        logger.info('Attempting login...');

        const response = await apiPost<LoginResponse>('auth/login', {
            token: oauthToken,
        });

        // Validate response
        const validated = AuthResponseSchema.parse(response);

        // Store auth data
        await setAuthToken(validated.token);
        await setUserProfile(validated.user);
        await setSubscription(validated.subscription);

        logger.info('Login successful', { userId: validated.user.id });
        return validated;
    } catch (error) {
        logger.error('Login failed', error);
        throw error;
    }
}

export async function logout(): Promise<void> {
    try {
        logger.info('Logging out...');

        await apiPost('auth/logout');
        await clearAllData();

        logger.info('Logout successful');
    } catch (error) {
        logger.error('Logout failed', error);
        // Clear data anyway
        await clearAllData();
        throw error;
    }
}

export async function validateSession(): Promise<{ valid: boolean; user?: User }> {
    try {
        const response = await apiGet<{ valid: boolean; user?: User }>('auth/session');
        return response;
    } catch (error) {
        logger.error('Session validation failed', error);
        return { valid: false };
    }
}

export async function refreshToken(): Promise<string> {
    try {
        const response = await apiPost<{ token: string }>('auth/refresh');
        await setAuthToken(response.token);
        return response.token;
    } catch (error) {
        logger.error('Token refresh failed', error);
        throw error;
    }
}
