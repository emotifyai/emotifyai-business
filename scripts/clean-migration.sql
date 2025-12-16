-- =============================================================================
-- CLEAN MIGRATION - DROPS AND RECREATES ALL TABLES
-- =============================================================================
-- This script will drop all existing tables and recreate them fresh
-- Safe to run since there's no real data to preserve

-- =============================================================================
-- DROP EVERYTHING FIRST
-- =============================================================================

-- Drop tables in correct order (reverse dependency order)
DROP TABLE IF EXISTS public.usage_logs CASCADE;
DROP TABLE IF EXISTS public.api_keys CASCADE;
DROP TABLE IF EXISTS public.lifetime_subscribers CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.can_use_credits(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_credit_status(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.consume_credits(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.get_lifetime_subscriber_count() CASCADE;
DROP FUNCTION IF EXISTS public.get_remaining_lifetime_slots() CASCADE;
DROP FUNCTION IF EXISTS public.reserve_lifetime_subscriber_slot(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_lifetime_offer_available() CASCADE;
DROP FUNCTION IF EXISTS public.get_lifetime_offer_status() CASCADE;
DROP FUNCTION IF EXISTS public.reset_user_credits(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.auto_reset_credits() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop enums
DROP TYPE IF EXISTS enhancement_mode CASCADE;
DROP TYPE IF EXISTS subscription_tier CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;

-- =============================================================================
-- CREATE EVERYTHING FRESH
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enums
CREATE TYPE subscription_status AS ENUM (
    'active',
    'cancelled',
    'expired',
    'past_due',
    'paused',
    'trial'
);

CREATE TYPE subscription_tier AS ENUM (
    'trial',
    'free',
    'lifetime_launch',
    'basic_monthly',
    'pro_monthly',
    'business_monthly',
    'basic_annual',
    'pro_annual',
    'business_annual'
);

CREATE TYPE enhancement_mode AS ENUM (
    'enhance'
);

-- =============================================================================
-- CREATE TABLES
-- =============================================================================

-- Profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    email TEXT NOT NULL UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    CONSTRAINT profiles_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Lemon Squeezy integration
    lemon_squeezy_id TEXT NOT NULL UNIQUE,
    
    -- Subscription details
    status subscription_status NOT NULL DEFAULT 'trial',
    tier subscription_tier NOT NULL DEFAULT 'free',
    tier_name TEXT,
    
    -- Billing periods
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days',
    cancel_at TIMESTAMPTZ,
    
    -- Legacy quota columns (for compatibility)
    trial_started_at TIMESTAMPTZ,
    trial_expires_at TIMESTAMPTZ,
    monthly_quota INTEGER,
    quota_used_this_month INTEGER DEFAULT 0,
    quota_reset_at TIMESTAMPTZ,
    cache_enabled BOOLEAN DEFAULT true,
    
    -- Credit-based system
    credits_limit INTEGER NOT NULL DEFAULT 10,
    credits_used INTEGER NOT NULL DEFAULT 0,
    credits_reset_date TIMESTAMPTZ,
    validity_days INTEGER,
    
    -- Constraints
    CONSTRAINT subscriptions_credits_check CHECK (credits_used >= 0 AND credits_used <= credits_limit),
    CONSTRAINT subscriptions_validity_check CHECK (validity_days IS NULL OR validity_days > 0)
);

-- Usage logs table
CREATE TABLE public.usage_logs (
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
    
    -- Legacy cache columns
    cached BOOLEAN DEFAULT false,
    tokens_saved INTEGER DEFAULT 0,
    
    -- Constraints
    CONSTRAINT usage_logs_tokens_check CHECK (tokens_used >= 0),
    CONSTRAINT usage_logs_credits_check CHECK (credits_consumed > 0),
    CONSTRAINT usage_logs_text_check CHECK (length(input_text) > 0)
);

-- Lifetime subscribers table
CREATE TABLE public.lifetime_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    subscriber_number INTEGER NOT NULL UNIQUE CHECK (subscriber_number > 0 AND subscriber_number <= 500),
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- API keys table
CREATE TABLE public.api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    key_hash TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    last_used_at TIMESTAMPTZ,
    revoked BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT api_keys_name_check CHECK (length(name) > 0 AND length(name) <= 100)
);

-- =============================================================================
-- CREATE FUNCTIONS
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
            10,
            0,
            10,
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

-- =============================================================================
-- CREATE TRIGGERS
-- =============================================================================

-- Updated_at triggers
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

-- =============================================================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lifetime_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- CREATE RLS POLICIES
-- =============================================================================

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

-- Usage logs policies
CREATE POLICY "Users can view own usage logs" ON public.usage_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage logs" ON public.usage_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage usage logs" ON public.usage_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Lifetime subscribers policies
CREATE POLICY "Users can view own lifetime subscription" ON public.lifetime_subscribers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage lifetime subscriptions" ON public.lifetime_subscribers
    FOR ALL USING (auth.role() = 'service_role');

-- API keys policies
CREATE POLICY "Users can manage own API keys" ON public.api_keys
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage API keys" ON public.api_keys
    FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- CREATE INDEXES
-- =============================================================================

CREATE INDEX profiles_email_idx ON public.profiles(email);
CREATE INDEX subscriptions_user_id_idx ON public.subscriptions(user_id);
CREATE INDEX subscriptions_status_idx ON public.subscriptions(status);
CREATE INDEX subscriptions_active_idx ON public.subscriptions(user_id, status) WHERE status IN ('active', 'trial');
CREATE INDEX usage_logs_user_id_idx ON public.usage_logs(user_id);
CREATE INDEX usage_logs_created_at_idx ON public.usage_logs(created_at DESC);

-- =============================================================================
-- DONE!
-- =============================================================================

-- Fix RLS policy to allow users to insert their own subscriptions

-- Drop existing subscription policies
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;

-- Create new policies that allow users to insert their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" ON public.subscriptions
    FOR ALL USING (auth.role() = 'service_role');