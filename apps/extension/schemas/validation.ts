import { z } from 'zod';

// User Schema
export const UserSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    avatarUrl: z.string().url().optional(),
    createdAt: z.string().datetime(),
});

// Subscription Schema
export const SubscriptionSchema = z.object({
    tier: z.enum(['trial', 'free', 'lifetime_launch', 'basic_monthly', 'pro_monthly', 'business_monthly', 'basic_annual', 'pro_annual', 'business_annual']),
    status: z.enum(['active', 'cancelled', 'expired', 'past_due', 'paused', 'trial']),
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional(),
    usageLimit: z.number().int().positive(),
    currentUsage: z.number().int().nonnegative(),
    resetDate: z.string().datetime().nullable().optional(),
});

// Usage Stats Schema
export const UsageStatsSchema = z.object({
    used: z.number().int().nonnegative(),
    limit: z.number().int().positive(),
    resetDate: z.string().datetime().nullable().optional(),
    lastUsed: z.string().datetime().optional(),
});

// Rewrite Response Schema
export const RewriteResponseSchema = z.object({
    enhancedText: z.string(),
    detectedLanguage: z.string(),
    confidence: z.number().min(0).max(1),
    tokensUsed: z.number().int().positive(),
});

// API Error Schema
export const APIErrorSchema = z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
});

// Settings Schema
export const SettingsSchema = z.object({
    keyboardShortcutEnabled: z.boolean(),
    keyboardShortcut: z.string(),
    theme: z.enum(['light', 'dark', 'auto']),
    preferredLanguage: z.enum(['en', 'ar', 'fr', 'auto']),
    autoDetectLanguage: z.boolean(),
});

// Auth Response Schema
export const AuthResponseSchema = z.object({
    token: z.string(),
    user: UserSchema,
    subscription: SubscriptionSchema,
});
