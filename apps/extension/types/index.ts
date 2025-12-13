// Core Types
export interface User {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
    createdAt: string;
}

/**
 * Unified Subscription Tier System
 * Matches the backend credit-based model
 */
export type SubscriptionTier =
    | 'trial'
    | 'free'
    | 'lifetime_launch'
    | 'basic_monthly'
    | 'pro_monthly'
    | 'business_monthly'
    | 'basic_annual'
    | 'pro_annual'
    | 'business_annual';

export type SubscriptionStatus =
    | 'active'
    | 'cancelled'
    | 'expired'
    | 'past_due'
    | 'paused'
    | 'trial';

export interface Subscription {
    tier: SubscriptionTier;
    status: SubscriptionStatus;
    startDate: string;
    endDate?: string;
    usageLimit: number; // generations per month
    currentUsage: number; // current month usage
    resetDate?: string | null; // when quota resets
}

export interface UsageStats {
    used: number;
    limit: number;
    resetDate?: string | null;
    lastUsed?: string;
}

// API Types
export interface EnhanceOptions {
    language?: 'en' | 'ar' | 'fr' | 'auto';
    context?: string;
    tone?: 'professional' | 'casual' | 'formal' | 'friendly';
}

export interface RewriteRequest {
    text: string;
    options: EnhanceOptions;
}

export interface RewriteResponse {
    enhancedText: string;
    detectedLanguage: string;
    confidence: number;
    tokensUsed: number;
}

export interface APIError {
    code: string;
    message: string;
    details?: unknown;
}

// Context Menu Types
export enum ContextMenuAction {
    ENHANCE_TEXT = 'enhance_text',
}

// Storage Schema
export interface StorageSchema {
    'local:authToken': string | null;
    'local:user': User | null;
    'local:subscription': Subscription | null;
    'local:usageStats': UsageStats | null;
    'local:settings': Settings;
}

// Settings Types
export interface Settings {
    keyboardShortcutEnabled: boolean;
    keyboardShortcut: string;
    theme: 'light' | 'dark' | 'auto';
    preferredLanguage: 'en' | 'ar' | 'fr' | 'auto';
    autoDetectLanguage: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
    keyboardShortcutEnabled: true,
    keyboardShortcut: 'Ctrl+Shift+E',
    theme: 'auto',
    preferredLanguage: 'auto',
    autoDetectLanguage: true,
};

// Message Types for extension communication
export enum MessageType {
    ENHANCE_TEXT = 'ENHANCE_TEXT',
    GET_AUTH_STATUS = 'GET_AUTH_STATUS',
    UPDATE_USAGE = 'UPDATE_USAGE',
}

export interface Message<T = unknown> {
    type: MessageType;
    payload: T;
}

export interface EnhanceTextMessage {
    text: string;
    options: EnhanceOptions;
}

export interface EnhanceTextResponse {
    success: boolean;
    enhancedText?: string;
    error?: string;
}
