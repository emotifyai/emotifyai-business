import ky, { type KyInstance, type Options } from 'ky';
import { getAuthToken } from '@/utils/storage';
import { logger } from '@/utils/logger';
import { APIError, AuthenticationError } from '@/utils/errors';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
// Create ky instance with default configuration
const createAPIClient = (): KyInstance => {
    return ky.create({
        prefixUrl: API_BASE_URL,
        timeout: 30000,
        retry: {
            limit: 2,
            methods: ['get', 'post'],
            statusCodes: [408, 413, 429, 500, 502, 503, 504],
        },
        hooks: {
            beforeRequest: [
                async (request) => {
                    // Add auth token if available
                    const token = await getAuthToken();
                    if (token) {
                        request.headers.set('Authorization', `Bearer ${token}`);
                    }

                    // Add extension ID for backend verification
                    const extensionId = import.meta.env.VITE_EXTENSION_ID;
                    if (extensionId) {
                        request.headers.set('X-Extension-ID', extensionId);
                    }

                    // Note: Cannot log request body here as it would consume the stream

                    logger.debug(`API Request: ${request.method} ${request.url}`);
                },
            ],
            beforeRetry: [
                async ({ request, error, retryCount }) => {
                    logger.warn(`Retrying request (${retryCount}): ${request.url}`, error);
                },
            ],
            afterResponse: [
                async (request, options, response) => {
                    logger.debug(`API Response: ${response.status} ${request.url}`);

                    // Handle non-2xx responses
                    if (!response.ok) {
                        // Try to get response text first to see raw error
                        const responseText = await response.clone().text();
                        const errorData = await response.json().catch(() => ({})) as any;
                        if (response.status === 401) {
                            throw new AuthenticationError(errorData.message || 'Unauthorized');
                        }

                        console.error('API Error:', {
                            code: errorData.code || 'API_ERROR',
                            message: errorData.message || `Request failed with status ${response.status}`,
                            status: response.status,
                            details: errorData.details
                        });

                        throw new APIError(
                            errorData.code || 'API_ERROR',
                            errorData.message || `Request failed with status ${response.status}`,
                            response.status,
                            errorData.details
                        );
                    }
                    return response;
                },
            ],
        },
    });
};

// Singleton instance
let apiClient: KyInstance | null = null;

export function getAPIClient(): KyInstance {
    if (!apiClient) {
        apiClient = createAPIClient();
    }
    return apiClient;
}

// Type-safe request methods
export async function apiGet<T>(endpoint: string, options?: Options): Promise<T> {
    const client = getAPIClient();
    return client.get(endpoint, options).json<T>();
}

export async function apiPost<T>(endpoint: string, data?: unknown, options?: Options): Promise<T> {
    const client = getAPIClient();
    const result = await client.post(endpoint, { json: data, ...options }).json<T>();
    return result;
}

export async function apiPut<T>(endpoint: string, data?: unknown, options?: Options): Promise<T> {
    const client = getAPIClient();
    return client.put(endpoint, { json: data, ...options }).json<T>();
}

export async function apiDelete<T>(endpoint: string, options?: Options): Promise<T> {
    const client = getAPIClient();
    return client.delete(endpoint, options).json<T>();
}
