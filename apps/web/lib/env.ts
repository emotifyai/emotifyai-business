import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

/**
 * Type-safe Environment Variables for Verba Web Application
 * 
 * This module uses @t3-oss/env-nextjs to provide type-safe environment variables
 * with runtime validation. It separates client and server variables for security.
 * 
 * Usage:
 * import { env } from '@/lib/env';
 * console.log(env.NEXT_PUBLIC_APP_URL); // Type-safe!
 */

export const env = createEnv({
    /**
     * Server-side environment variables
     * These are only available on the server and never exposed to the client
     */
    server: {
        // Supabase
        SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, {
            message: 'SUPABASE_SERVICE_ROLE_KEY is required',
        }),

        // Lemon Squeezy
        LEMONSQUEEZY_API_KEY: z.string().min(1, {
            message: 'LEMONSQUEEZY_API_KEY is required',
        }),
        LEMONSQUEEZY_STORE_ID: z.string().min(1, {
            message: 'LEMONSQUEEZY_STORE_ID is required',
        }),
        LEMONSQUEEZY_WEBHOOK_SECRET: z.string().min(1, {
            message: 'LEMONSQUEEZY_WEBHOOK_SECRET is required',
        }),
        LEMONSQUEEZY_MONTHLY_VARIANT_ID: z.string().min(1, {
            message: 'LEMONSQUEEZY_MONTHLY_VARIANT_ID is required',
        }),
        LEMONSQUEEZY_LIFETIME_VARIANT_ID: z.string().min(1, {
            message: 'LEMONSQUEEZY_LIFETIME_VARIANT_ID is required',
        }),

        // Anthropic (Claude)
        ANTHROPIC_API_KEY: z.string().min(1, {
            message: 'ANTHROPIC_API_KEY is required (unless MOCK_AI_RESPONSES=true)',
        }).optional(),
        ANTHROPIC_MODEL: z.string().default('claude-3-5-sonnet-20241022'),
        ANTHROPIC_MAX_TOKENS: z.coerce.number().int().min(1).max(4096).default(1024),

        // Usage Limits
        TRIAL_ENHANCEMENT_LIMIT: z.coerce.number().int().positive().default(10),
        MONTHLY_ENHANCEMENT_LIMIT: z.coerce.number().int().default(1000),
        LIFETIME_ENHANCEMENT_LIMIT: z.coerce.number().int().default(-1),

        // Rate Limiting
        RATE_LIMIT_RPM: z.coerce.number().int().positive().default(10),
        RATE_LIMIT_WINDOW: z.coerce.number().int().positive().default(60),

        // Optional: Email Configuration
        EMAIL_PROVIDER: z.string().optional(),
        EMAIL_API_KEY: z.string().optional(),
        EMAIL_FROM_ADDRESS: z.string().email().optional(),
        EMAIL_FROM_NAME: z.string().optional(),

        // Development Only
        DEBUG: z
            .string()
            .optional()
            .transform((val) => val === 'true')
            .pipe(z.boolean().optional()),
        SKIP_AUTH: z
            .string()
            .optional()
            .transform((val) => val === 'true')
            .pipe(z.boolean().optional()),
        MOCK_AI_RESPONSES: z
            .string()
            .optional()
            .transform((val) => val === 'true')
            .pipe(z.boolean().optional()),
        DISABLE_RATE_LIMIT: z
            .string()
            .optional()
            .transform((val) => val === 'true')
            .pipe(z.boolean().optional()),
        LOG_SQL_QUERIES: z
            .string()
            .optional()
            .transform((val) => val === 'true')
            .pipe(z.boolean().optional()),
    },

    /**
     * Client-side environment variables
     * These are exposed to the browser and must be prefixed with NEXT_PUBLIC_
     */
    client: {
        // Supabase
        NEXT_PUBLIC_SUPABASE_URL: z.string().url({
            message: 'NEXT_PUBLIC_SUPABASE_URL must be a valid URL',
        }),
        NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, {
            message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required',
        }),

        // Application
        NEXT_PUBLIC_APP_URL: z.string().url({
            message: 'NEXT_PUBLIC_APP_URL must be a valid URL',
        }),

        // Optional: Feature Flags
        NEXT_PUBLIC_ENABLE_SHOPIFY_APP: z
            .string()
            .optional()
            .transform((val) => val === 'true')
            .pipe(z.boolean().optional()),
    },

    /**
     * Runtime environment variables
     * Map environment variables to their values
     */
    runtimeEnv: {
        // Server
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
        LEMONSQUEEZY_API_KEY: process.env.LEMONSQUEEZY_API_KEY,
        LEMONSQUEEZY_STORE_ID: process.env.LEMONSQUEEZY_STORE_ID,
        LEMONSQUEEZY_WEBHOOK_SECRET: process.env.LEMONSQUEEZY_WEBHOOK_SECRET,
        LEMONSQUEEZY_MONTHLY_VARIANT_ID: process.env.LEMONSQUEEZY_MONTHLY_VARIANT_ID,
        LEMONSQUEEZY_LIFETIME_VARIANT_ID: process.env.LEMONSQUEEZY_LIFETIME_VARIANT_ID,
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
        ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL,
        ANTHROPIC_MAX_TOKENS: process.env.ANTHROPIC_MAX_TOKENS,
        TRIAL_ENHANCEMENT_LIMIT: process.env.TRIAL_ENHANCEMENT_LIMIT,
        MONTHLY_ENHANCEMENT_LIMIT: process.env.MONTHLY_ENHANCEMENT_LIMIT,
        LIFETIME_ENHANCEMENT_LIMIT: process.env.LIFETIME_ENHANCEMENT_LIMIT,
        RATE_LIMIT_RPM: process.env.RATE_LIMIT_RPM,
        RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW,
        EMAIL_PROVIDER: process.env.EMAIL_PROVIDER,
        EMAIL_API_KEY: process.env.EMAIL_API_KEY,
        EMAIL_FROM_ADDRESS: process.env.EMAIL_FROM_ADDRESS,
        EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
        DEBUG: process.env.DEBUG,
        SKIP_AUTH: process.env.SKIP_AUTH,
        MOCK_AI_RESPONSES: process.env.MOCK_AI_RESPONSES,
        DISABLE_RATE_LIMIT: process.env.DISABLE_RATE_LIMIT,
        LOG_SQL_QUERIES: process.env.LOG_SQL_QUERIES,

        // Client
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        NEXT_PUBLIC_ENABLE_SHOPIFY_APP: process.env.NEXT_PUBLIC_ENABLE_SHOPIFY_APP,
    },

    /**
     * Skip validation during build if using Docker or CI
     * Set SKIP_ENV_VALIDATION=true to skip validation
     */
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,

    /**
     * Makes it so that empty strings are treated as undefined.
     * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
     */
    emptyStringAsUndefined: true,
});

/**
 * Helper functions for environment checks
 */
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';
