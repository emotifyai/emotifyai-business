import { useState, useEffect } from 'react';
import { getAuthToken, getUserProfile, watchStorage } from '@/utils/storage';
import { login, logout } from '@/services/api/auth';
import { logger } from '@/utils/logger';
import type { User } from '@/types';

interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;
}

export function useAuth() {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        user: null,
        isLoading: true,
    });

    useEffect(() => {
        // Load initial auth state
        const loadAuthState = async () => {
            const token = await getAuthToken();
            const user = await getUserProfile();

            setAuthState({
                isAuthenticated: !!token,
                user,
                isLoading: false,
            });
        };

        loadAuthState();

        // Watch for auth changes
        const unwatchToken = watchStorage('local:authToken', async (newToken) => {
            const user = await getUserProfile();
            setAuthState({
                isAuthenticated: !!newToken,
                user,
                isLoading: false,
            });
        });

        return () => {
            unwatchToken();
        };
    }, []);

    const handleLogin = async (oauthToken: string) => {
        try {
            setAuthState((prev) => ({ ...prev, isLoading: true }));
            const response = await login(oauthToken);
            setAuthState({
                isAuthenticated: true,
                user: response.user,
                isLoading: false,
            });
            return response;
        } catch (error) {
            logger.error('Login failed', error);
            setAuthState((prev) => ({ ...prev, isLoading: false }));
            throw error;
        }
    };

    const handleLogout = async () => {
        try {
            setAuthState((prev) => ({ ...prev, isLoading: true }));
            await logout();
            setAuthState({
                isAuthenticated: false,
                user: null,
                isLoading: false,
            });
        } catch (error) {
            logger.error('Logout failed', error);
            setAuthState({
                isAuthenticated: false,
                user: null,
                isLoading: false,
            });
        }
    };

    return {
        ...authState,
        login: handleLogin,
        logout: handleLogout,
    };
}
