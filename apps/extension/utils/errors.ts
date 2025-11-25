export class APIError extends Error {
    constructor(
        public code: string,
        message: string,
        public statusCode?: number,
        public details?: unknown
    ) {
        super(message);
        this.name = 'APIError';
    }
}

export class AuthenticationError extends Error {
    constructor(message: string = 'Authentication failed') {
        super(message);
        this.name = 'AuthenticationError';
    }
}

export class SubscriptionError extends Error {
    constructor(
        message: string,
        public usageLimit?: number,
        public currentUsage?: number
    ) {
        super(message);
        this.name = 'SubscriptionError';
    }
}

export class LanguageNotSupportedError extends Error {
    constructor(
        public language: string,
        message: string = `Language "${language}" is not fully supported`
    ) {
        super(message);
        this.name = 'LanguageNotSupportedError';
    }
}

export function isAPIError(error: unknown): error is APIError {
    return error instanceof APIError;
}

export function isAuthenticationError(error: unknown): error is AuthenticationError {
    return error instanceof AuthenticationError;
}

export function isSubscriptionError(error: unknown): error is SubscriptionError {
    return error instanceof SubscriptionError;
}

export function isLanguageNotSupportedError(error: unknown): error is LanguageNotSupportedError {
    return error instanceof LanguageNotSupportedError;
}
