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
        // Cast to Subscription type to satisfy enum compatibility
        await setSubscription(validated.subscription as unknown as Subscription);

        logger.info('Login successful', { userId: validated.user.id });
        return validated as unknown as LoginResponse;
    } catch (error) {
        logger.error('Login failed', error);
        throw error;
    }
}

export async function loginWithGoogle(): Promise<void> {
    try {
        logger.info('Initiating Google OAuth flow...');

        // In a real implementation, this URL would be your backend auth endpoint
        // or the Supabase OAuth URL.
        // For "prepared to work" state, we define the flow but might mock the actual URL if env vars aren't set
        const redirectUrl = browser.identity.getRedirectURL();
        const clientId = import.meta.env.VITE_OAUTH_CLIENT_ID;
        const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUrl)}&scope=email profile`;

        // If we are in mock mode or missing credentials, we simulate the flow
        if (import.meta.env.VITE_MOCK_API_ENABLED === 'true' || !clientId || clientId.includes('your_')) {
            logger.info('Mocking OAuth flow (dev mode or missing credentials)');
            // Simulate delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            const mockToken = 'mock-google-oauth-token-' + Date.now();
            await login(mockToken);
            return;
        }

        const responseUrl = await browser.identity.launchWebAuthFlow({
            url: authUrl,
            interactive: true,
        });

        if (responseUrl) {
            const url = new URL(responseUrl);
            const params = new URLSearchParams(url.hash.substring(1)); // Google returns token in hash
            const accessToken = params.get('access_token');

            if (accessToken) {
                await login(accessToken);
            } else {
                throw new Error('No access token returned from Google');
            }
        }
    } catch (error) {
        logger.error('Google login failed', error);
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
