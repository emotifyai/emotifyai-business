-- =============================================================================
-- EMOTIFYAI COMPLETE DATABASE SCHEMA
-- =============================================================================
-- This file contains the complete database schema for the EmotifyAI application
-- including all tables, indexes, RLS policies, functions, and triggers.
--
-- Version: 3.0 (Credit-based subscription model)
-- Last Updated: December 2024
-- 
-- To apply this schema:
-- 1. Create a new Supabase project
-- 2. Run this file in the SQL editor
-- 3. Verify all tables and functions are created
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- ENUMS
-- =============================================================================

-- Subscription status enum
CREATE TYPE subscription_status AS ENUM (
    'active',       -- Subscription is active and user can use credits
    'cancelled',    -- Subscription cancelled but may still be active until period end
    'expired',      -- Subscription has expired
    'past_due',     -- Payment failed, subscription in grace period
    'paused',       -- Subscription temporarily paused
    'trial'         -- Free trial or free plan
);

-- Subscription tier enum (includes all new credit-based tiers)
CREATE TYPE subscription_tier AS ENUM (
    'trial',                -- Legacy trial (mapped to 'free')
    'free',                 -- Free plan (50 credits, 10 days)
    'lifetime_launch',      -- Lifetime launch offer (500 credits/month, $97, limited to 500)
    'basic_monthly',        -- Basic monthly (350 credits, $17/month)
    'pro_monthly',          -- Pro monthly (700 credits, $37/month)
    'business_monthly',     -- Business monthly (1500 credits, $57/month)
    'basic_annual',         -- Basic annual (350 credits, 25% discount)
    'pro_annual',           -- Pro annual (700 credits, 25% discount)
    'business_annual'       -- Business annual (1500 credits, 25% discount)
);

-- Enhancement mode enum (simplified to single mode)
CREATE TYPE enhancement_mode AS ENUM (
    'enhance'       -- Single enhancement mode for text improvement
);

-- =============================================================================
-- CORE TABLES
-- =============================================================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    email TEXT NOT NULL UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    
    -- Constraints
    CONSTRAINT profiles_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Subscriptions table (credit-based model)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Lemon Squeezy integration
    lemon_squeezy_id TEXT NOT NULL UNIQUE,
    
    -- Subscription details
    status subscription_status NOT NULL DEFAULT 'trial',
    tier subscription_tier NOT NULL DEFAULT 'free',
    tier_name TEXT, -- Human-readable tier name for easier querying
    
    -- Billing periods
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days',
    cancel_at TIMESTAMPTZ,
    
    -- Legacy quota columns (maintained for backward compatibility)
    trial_started_at TIMESTAMPTZ,
    trial_expires_at TIMESTAMPTZ,
    monthly_quota INTEGER,
    quota_used_this_month INTEGER DEFAULT 0,
    quota_reset_at TIMESTAMPTZ,
    cache_enabled BOOLEAN DEFAULT true,
    
    -- New credit-based system
    credits_limit INTEGER NOT NULL DEFAULT 50,
    credits_used INTEGER NOT NULL DEFAULT 0,
    credits_reset_date TIMESTAMPTZ,
    validity_days INTEGER, -- For free plan (10 days validity)
    
    -- Constraints
    CONSTRAINT subscriptions_credits_check CHECK (credits_used >= 0 AND credits_used <= credits_limit),
    CONSTRAINT subscriptions_validity_check CHECK (validity_days IS NULL OR validity_days > 0)
);

-- Lifetime subscribers tracking table
CREATE TABLE IF NOT EXISTS public.lifetime_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    subscriber_number INTEGER NOT NULL UNIQUE CHECK (subscriber_number > 0 AND subscriber_number <= 500),
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Usage logs table (tracks all enhancement requests)
CREATE TABLE IF NOT EXISTS public.usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Enhancement details
    input_text TEXT NOT NULL,
    output_text TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'en',
    mode enhancement_mode NOT NULL DEFAULT 'enhance',
    
    -- Token and credit tracking
    tokens_used INTEGER NOT NULL DEFAULT 0,
    credits_consumed INTEGER NOT NULL DEFAULT 1,
    
    -- Request status
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    
    -- Legacy cache columns (maintained for compatibility)
    cached BOOLEAN DEFAULT false,
    tokens_saved INTEGER DEFAULT 0,
    
    -- Constraints
    CONSTRAINT usage_logs_tokens_check CHECK (tokens_used >= 0),
    CONSTRAINT usage_logs_credits_check CHECK (credits_consumed > 0),
    CONSTRAINT usage_logs_text_check CHECK (length(input_text) > 0)
);

-- API keys table (for programmatic access)
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Key details
    key_hash TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    last_used_at TIMESTAMPTZ,
    revoked BOOLEAN NOT NULL DEFAULT false,
    
    -- Constraints
    CONSTRAINT api_keys_name_check CHECK (length(name) > 0 AND length(name) <= 100)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON public.profiles(created_at DESC);

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS subscriptions_tier_idx ON public.subscriptions(tier);
CREATE INDEX IF NOT EXISTS subscriptions_tier_name_idx ON public.subscriptions(tier_name);
CREATE INDEX IF NOT EXISTS subscriptions_lemon_squeezy_id_idx ON public.subscriptions(lemon_squeezy_id);
CREATE INDEX IF NOT EXISTS subscriptions_credits_reset_idx ON public.subscriptions(credits_reset_date);
CREATE INDEX IF NOT EXISTS subscriptions_validity_idx ON public.subscriptions(validity_days);
CREATE INDEX IF NOT EXISTS subscriptions_active_idx ON public.subscriptions(user_id, status) WHERE status IN ('active', 'trial');

-- Lifetime subscribers indexes
CREATE INDEX IF NOT EXISTS lifetime_subscribers_user_id_idx ON public.lifetime_subscribers(user_id);
CREATE INDEX IF NOT EXISTS lifetime_subscribers_number_idx ON public.lifetime_subscribers(subscriber_number);
CREATE INDEX IF NOT EXISTS lifetime_subscribers_date_idx ON public.lifetime_subscribers(subscribed_at DESC);

-- Usage logs indexes
CREATE INDEX IF NOT EXISTS usage_logs_user_id_idx ON public.usage_logs(user_id);
CREATE INDEX IF NOT EXISTS usage_logs_created_at_idx ON public.usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS usage_logs_user_created_idx ON public.usage_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS usage_logs_success_idx ON public.usage_logs(success);
CREATE INDEX IF NOT EXISTS usage_logs_credits_idx ON public.usage_logs(credits_consumed);

-- API keys indexes
CREATE INDEX IF NOT EXISTS api_keys_user_id_idx ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS api_keys_key_hash_idx ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS api_keys_active_idx ON public.api_keys(user_id, revoked) WHERE revoked = false;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lifetime_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can manage profiles" ON public.profiles
    FOR ALL USING (auth.role() = 'service_role');

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" ON public.subscriptions
    FOR ALL USING (auth.role() = 'service_role');

-- Lifetime subscribers policies
CREATE POLICY "Users can view own lifetime subscription" ON public.lifetime_subscribers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage lifetime subscriptions" ON public.lifetime_subscribers
    FOR ALL USING (auth.role() = 'service_role');

-- Usage logs policies
CREATE POLICY "Users can view own usage logs" ON public.usage_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage logs" ON public.usage_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage usage logs" ON public.usage_logs
    FOR ALL USING (auth.role() = 'service_role');

-- API keys policies
CREATE POLICY "Users can manage own API keys" ON public.api_keys
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage API keys" ON public.api_keys
    FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- UTILITY FUNCTIONS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name)
    VALUES (
        NEW.id, 
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- CREDIT SYSTEM FUNCTIONS
-- =============================================================================

-- Function to get lifetime subscriber count
CREATE OR REPLACE FUNCTION public.get_lifetime_subscriber_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM public.lifetime_subscribers);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get remaining lifetime slots
CREATE OR REPLACE FUNCTION public.get_remaining_lifetime_slots()
RETURNS INTEGER AS $$
DECLARE
    total_slots INTEGER := 500;
    used_slots INTEGER;
BEGIN
    SELECT COUNT(*) INTO used_slots FROM public.lifetime_subscribers;
    RETURN GREATEST(0, total_slots - used_slots);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reserve lifetime subscriber slot
CREATE OR REPLACE FUNCTION public.reserve_lifetime_subscriber_slot(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    next_number INTEGER;
    remaining_slots INTEGER;
BEGIN
    -- Check if user already has a lifetime subscription
    IF EXISTS (SELECT 1 FROM public.lifetime_subscribers WHERE user_id = user_uuid) THEN
        RAISE EXCEPTION 'User already has a lifetime subscription';
    END IF;
    
    -- Check remaining slots
    SELECT public.get_remaining_lifetime_slots() INTO remaining_slots;
    IF remaining_slots <= 0 THEN
        RAISE EXCEPTION 'No lifetime slots remaining';
    END IF;
    
    -- Get next subscriber number (with row lock to prevent race conditions)
    SELECT COALESCE(MAX(subscriber_number), 0) + 1 INTO next_number
    FROM public.lifetime_subscribers
    FOR UPDATE;
    
    -- Ensure we don't exceed 500 subscribers
    IF next_number > 500 THEN
        RAISE EXCEPTION 'Lifetime subscriber limit reached';
    END IF;
    
    -- Insert new lifetime subscriber record
    INSERT INTO public.lifetime_subscribers (user_id, subscriber_number)
    VALUES (user_uuid, next_number);
    
    RETURN next_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if lifetime offer is available
CREATE OR REPLACE FUNCTION public.is_lifetime_offer_available()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.get_remaining_lifetime_slots() > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get lifetime offer status
CREATE OR REPLACE FUNCTION public.get_lifetime_offer_status()
RETURNS TABLE (
    total_slots INTEGER,
    used_slots INTEGER,
    remaining_slots INTEGER,
    is_available BOOLEAN,
    show_urgency BOOLEAN
) AS $$
DECLARE
    used_count INTEGER;
    remaining_count INTEGER;
BEGIN
    SELECT public.get_lifetime_subscriber_count() INTO used_count;
    SELECT public.get_remaining_lifetime_slots() INTO remaining_count;
    
    RETURN QUERY SELECT
        500 as total_slots,
        used_count as used_slots,
        remaining_count as remaining_slots,
        (remaining_count > 0) as is_available,
        (remaining_count < 50 AND remaining_count > 0) as show_urgency;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can use credits
CREATE OR REPLACE FUNCTION public.can_use_credits(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    sub_record RECORD;
BEGIN
    -- Get current subscription
    SELECT * INTO sub_record
    FROM public.subscriptions
    WHERE user_id = user_uuid
      AND status IN ('active', 'trial')
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check if free plan has expired
    IF sub_record.tier_name = 'free' AND sub_record.validity_days IS NOT NULL THEN
        IF sub_record.created_at + (sub_record.validity_days || ' days')::INTERVAL < NOW() THEN
            RETURN FALSE;
        END IF;
    END IF;
    
    -- Check if credits are available
    RETURN sub_record.credits_used < sub_record.credits_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to consume credits
CREATE OR REPLACE FUNCTION public.consume_credits(user_uuid UUID, credits_to_consume INTEGER DEFAULT 1)
RETURNS BOOLEAN AS $$
DECLARE
    sub_record RECORD;
BEGIN
    -- Get current subscription with row lock
    SELECT * INTO sub_record
    FROM public.subscriptions
    WHERE user_id = user_uuid
      AND status IN ('active', 'trial')
    ORDER BY created_at DESC
    LIMIT 1
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check if user can use credits
    IF NOT public.can_use_credits(user_uuid) THEN
        RETURN FALSE;
    END IF;
    
    -- Check if enough credits available
    IF sub_record.credits_used + credits_to_consume > sub_record.credits_limit THEN
        RETURN FALSE;
    END IF;
    
    -- Consume credits
    UPDATE public.subscriptions
    SET 
        credits_used = credits_used + credits_to_consume,
        updated_at = NOW()
    WHERE id = sub_record.id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user credit status
CREATE OR REPLACE FUNCTION public.get_user_credit_status(user_uuid UUID)
RETURNS TABLE (
    tier_name TEXT,
    credits_limit INTEGER,
    credits_used INTEGER,
    credits_remaining INTEGER,
    credits_reset_date TIMESTAMPTZ,
    validity_days INTEGER,
    is_expired BOOLEAN,
    can_use BOOLEAN
) AS $$
DECLARE
    sub_record RECORD;
    is_free_expired BOOLEAN := FALSE;
BEGIN
    -- Get current subscription
    SELECT * INTO sub_record
    FROM public.subscriptions
    WHERE user_id = user_uuid
      AND status IN ('active', 'trial')
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF NOT FOUND THEN
        -- Return default free plan if no subscription
        RETURN QUERY SELECT
            'free'::TEXT,
            50,
            0,
            50,
            NULL::TIMESTAMPTZ,
            10,
            TRUE,
            FALSE;
        RETURN;
    END IF;
    
    -- Check if free plan has expired
    IF sub_record.tier_name = 'free' AND sub_record.validity_days IS NOT NULL THEN
        is_free_expired := sub_record.created_at + (sub_record.validity_days || ' days')::INTERVAL < NOW();
    END IF;
    
    RETURN QUERY SELECT
        sub_record.tier_name,
        sub_record.credits_limit,
        sub_record.credits_used,
        GREATEST(0, sub_record.credits_limit - sub_record.credits_used),
        sub_record.credits_reset_date,
        sub_record.validity_days,
        is_free_expired,
        (NOT is_free_expired AND sub_record.credits_used < sub_record.credits_limit);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset user credits (for monthly/annual subscriptions)
CREATE OR REPLACE FUNCTION public.reset_user_credits(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
    sub_record RECORD;
    new_reset_date TIMESTAMPTZ;
BEGIN
    -- Get current subscription
    SELECT * INTO sub_record
    FROM public.subscriptions
    WHERE user_id = user_uuid
      AND status IN ('active', 'trial')
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No active subscription found for user';
    END IF;
    
    -- Calculate new reset date based on tier
    IF sub_record.tier_name LIKE '%_monthly' OR sub_record.tier_name = 'lifetime_launch' THEN
        new_reset_date := NOW() + INTERVAL '1 month';
    ELSIF sub_record.tier_name LIKE '%_annual' THEN
        new_reset_date := NOW() + INTERVAL '1 year';
    ELSE
        -- Free plan doesn't reset
        RETURN;
    END IF;
    
    -- Reset credits and update reset date
    UPDATE public.subscriptions
    SET 
        credits_used = 0,
        credits_reset_date = new_reset_date,
        updated_at = NOW()
    WHERE id = sub_record.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lifetime_subscribers_updated_at
    BEFORE UPDATE ON public.lifetime_subscribers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Function to automatically reset credits when reset date is reached
CREATE OR REPLACE FUNCTION public.auto_reset_credits()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if credits should be reset
    IF NEW.credits_reset_date IS NOT NULL AND NEW.credits_reset_date <= NOW() THEN
        -- Reset credits and calculate next reset date
        NEW.credits_used := 0;
        
        IF NEW.tier_name LIKE '%_monthly' OR NEW.tier_name = 'lifetime_launch' THEN
            NEW.credits_reset_date := NOW() + INTERVAL '1 month';
        ELSIF NEW.tier_name LIKE '%_annual' THEN
            NEW.credits_reset_date := NOW() + INTERVAL '1 year';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic credit reset
CREATE TRIGGER auto_reset_credits_trigger
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_reset_credits();

-- =============================================================================
-- COMMENTS AND DOCUMENTATION
-- =============================================================================

-- Table comments
COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase auth.users';
COMMENT ON TABLE public.subscriptions IS 'Credit-based subscription management with Lemon Squeezy integration';
COMMENT ON TABLE public.lifetime_subscribers IS 'Tracks lifetime subscribers with sequential numbering (limited to 500)';
COMMENT ON TABLE public.usage_logs IS 'Logs all text enhancement requests with credit consumption tracking';
COMMENT ON TABLE public.api_keys IS 'API keys for programmatic access to the enhancement service';

-- Column comments
COMMENT ON COLUMN public.subscriptions.tier_name IS 'Human-readable subscription tier name for easier querying';
COMMENT ON COLUMN public.subscriptions.credits_limit IS 'Maximum credits available per billing period';
COMMENT ON COLUMN public.subscriptions.credits_used IS 'Credits consumed in current billing period';
COMMENT ON COLUMN public.subscriptions.credits_reset_date IS 'When credits will reset for next billing period';
COMMENT ON COLUMN public.subscriptions.validity_days IS 'Number of days the subscription is valid (for free plan)';
COMMENT ON COLUMN public.lifetime_subscribers.subscriber_number IS 'Sequential number from 1-500 for lifetime subscribers';
COMMENT ON COLUMN public.usage_logs.credits_consumed IS 'Number of credits consumed by this enhancement';

-- Function comments
COMMENT ON FUNCTION public.get_lifetime_subscriber_count() IS 'Returns total number of lifetime subscribers';
COMMENT ON FUNCTION public.get_remaining_lifetime_slots() IS 'Returns remaining lifetime subscription slots (max 500)';
COMMENT ON FUNCTION public.reserve_lifetime_subscriber_slot(UUID) IS 'Reserves a lifetime slot for a user and returns subscriber number';
COMMENT ON FUNCTION public.is_lifetime_offer_available() IS 'Checks if lifetime offer is still available';
COMMENT ON FUNCTION public.get_lifetime_offer_status() IS 'Returns complete lifetime offer status including urgency flag';
COMMENT ON FUNCTION public.can_use_credits(UUID) IS 'Checks if user can consume credits (not expired, under limit)';
COMMENT ON FUNCTION public.consume_credits(UUID, INTEGER) IS 'Consumes credits for a user, returns success status';
COMMENT ON FUNCTION public.get_user_credit_status(UUID) IS 'Returns complete credit status for a user';

-- =============================================================================
-- MIGRATION HISTORY
-- =============================================================================

/*
Migration History:
- 001_initial_schema.sql: Initial database setup with basic subscription model
- 002_subscription_tiers.sql: Added new subscription tiers and quota tracking
- 003_credit_based_subscription_model.sql: Complete credit-based system with lifetime tracking

Schema Relationships:
- profiles (1) → subscriptions (many): User can have multiple subscriptions over time
- profiles (1) → lifetime_subscribers (0..1): User can have at most one lifetime subscription
- profiles (1) → usage_logs (many): User can have many enhancement requests
- profiles (1) → api_keys (many): User can have multiple API keys

Key Features:
- Credit-based subscription model with 6 tiers
- Lifetime subscription tracking (limited to 500 subscribers)
- Automatic credit reset for recurring subscriptions
- Comprehensive usage logging with credit consumption
- Row Level Security (RLS) for data protection
- Lemon Squeezy integration for payment processing
*/

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================