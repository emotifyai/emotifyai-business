import { z } from 'zod';

/**
 * Environment Variable Schema
 * 
 * This schema defines and validates all environment variables used in the extension.
 * It provides type-safety and runtime validation to catch configuration errors early.
 */

// Define the schema for environment variables
const envSchema = z.object({
    // API Configuration
    VITE_API_BASE_URL: z.string().url({
        message: 'VITE_API_BASE_URL must be a valid URL',
    }),

    VITE_MOCK_API_ENABLED: z
        .string()
        .transform((val) => val === 'true'),

    // OAuth Configuration
    VITE_OAUTH_CLIENT_ID: z.string().min(1, {
        message: 'VITE_OAUTH_CLIENT_ID is required',
    }),

    VITE_WEB_APP_URL: z.string().url({
        message: 'VITE_WEB_APP_URL must be a valid URL',
    }),

    // Extension Configuration
    VITE_EXTENSION_ID: z.string().optional(),

    // Logging Configuration
    VITE_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

    // Optional Feature Flags
    VITE_ENABLE_EXPERIMENTAL_FEATURES: z
        .string()
        .optional()
        .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),

    VITE_ENABLE_ANALYTICS: z
        .string()
        .optional()
        .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),

    VITE_ENABLE_ERROR_REPORTING: z
        .string()
        .optional()
        .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),

    VITE_SENTRY_DSN: z.string().url().optional(),

    // Development Only
    VITE_SKIP_AUTH: z
        .string()
        .optional()
        .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),

    VITE_DEBUG: z
        .string()
        .optional()
        .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
});

/**
 * Validate and parse environment variables
 * 
 * This function validates the environment variables against the schema
 * and throws a detailed error if validation fails.
 */
function validateEnv() {
    try {
        return envSchema.parse(import.meta.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.issues
                .map((err) => `  - ${err.path.join('.')}: ${err.message}`)
                .join('\n');

            throw new Error(
                `❌ Invalid environment variables:\n${errorMessages}\n\n` +
                `Please check your .env file and ensure all required variables are set correctly.\n` +
                `See .env.example for reference.`
            );
        }
        throw error;
    }
}

/**
 * Type-safe environment variables
 * 
 * Use this object to access environment variables throughout the extension.
 * All values are validated and typed.
 */
export const env = validateEnv();

/**
 * Environment variable type
 * 
 * Use this type for type-safe environment variable access.
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Check if running in development mode
 */
export const isDevelopment = import.meta.env.DEV;

/**
 * Check if running in production mode
 */
export const isProduction = import.meta.env.PROD;

/**
 * Check if running in test mode
 */
export const isTest = import.meta.env.MODE === 'test';

/**
 * Get the current environment mode
 */
export const mode = import.meta.env.MODE;
