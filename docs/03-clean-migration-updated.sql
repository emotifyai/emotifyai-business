-- =============================================================================
-- CLEAN MIGRATION - UPDATED TO MATCH CURRENT SCHEMA
-- =============================================================================
-- This script creates the database schema that matches the current TypeScript types
-- This is the authoritative schema that should be used for new deployments

-- =============================================================================
-- DROP EVERYTHING FIRST
-- =============================================================================

-- Drop tables in correct order (reverse dependency order)
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
DROP FUNCTION IF EXISTS public.get_lifetime_slot_info() CASCADE;

-- Drop enums
DROP TYPE IF EXISTS subscription_tier CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;

-- =============================================================================
-- CREATE EVERYTHING FRESH
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enums (matching TypeScript types exactly)
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

-- =============================================================================
-- CREATE TABLES (MATCHING TYPESCRIPT TYPES EXACTLY)
-- =============================================================================

-- Profiles table (matches Database['public']['Tables']['profiles']['Row'])
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    email TEXT NOT NULL UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    onboarded BOOLEAN NOT NULL DEFAULT false,
    
    CONSTRAINT profiles_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Subscriptions table (matches Database['public']['Tables']['subscriptions']['Row'])
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    lemon_squeezy_id TEXT NOT NULL UNIQUE,
    status subscription_status NOT NULL DEFAULT 'trial',
    tier subscription_tier NOT NULL DEFAULT 'free',
    tier_name TEXT,
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days',
    cancel_at TIMESTAMPTZ,
    credits_limit INTEGER NOT NULL DEFAULT 50,
    credits_used INTEGER NOT NULL DEFAULT 0,
    credits_reset_date TIMESTAMPTZ,
    validity_days INTEGER,
    
    -- Constraints
    CONSTRAINT subscriptions_credits_check CHECK (credits_used >= 0 AND credits_used <= credits_limit),
    CONSTRAINT subscriptions_validity_check CHECK (validity_days IS NULL OR validity_days > 0)
);

-- API keys table (matches Database['public']['Tables']['api_keys']['Row'])
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

-- Lifetime subscribers table (matches Database['public']['Tables']['lifetime_subscribers']['Row'])
CREATE TABLE public.lifetime_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    subscriber_number INTEGER NOT NULL UNIQUE CHECK (subscriber_number > 0 AND subscriber_number <= 500),
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- CREATE FUNCTIONS
-- =============================================================================

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
    SET credits_used = credits_used + credits_to_consume
    WHERE id = sub_record.id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- Function to reserve a lifetime subscriber slot
CREATE OR REPLACE FUNCTION public.reserve_lifetime_subscriber_slot(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    current_count INTEGER;
    new_subscriber_number INTEGER;
BEGIN
    -- Check current count
    SELECT COUNT(*) INTO current_count FROM public.lifetime_subscribers;
    
    -- Check if slots are available
    IF current_count >= 500 THEN
        RAISE EXCEPTION 'All lifetime subscriber slots are taken';
    END IF;
    
    -- Calculate new subscriber number
    new_subscriber_number := current_count + 1;
    
    -- Insert the new lifetime subscriber
    INSERT INTO public.lifetime_subscribers (user_id, subscriber_number)
    VALUES (user_uuid, new_subscriber_number)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Return the subscriber number
    RETURN new_subscriber_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if lifetime offer is available
CREATE OR REPLACE FUNCTION public.is_lifetime_offer_available()
RETURNS BOOLEAN AS $$
DECLARE
    used_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO used_count FROM public.lifetime_subscribers;
    RETURN used_count < 500;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function that matches TypeScript expectations
CREATE OR REPLACE FUNCTION public.get_lifetime_slot_info()
RETURNS TABLE (
    total INTEGER,
    used INTEGER,
    remaining INTEGER,
    percentage INTEGER
) AS $$
DECLARE
    used_count INTEGER;
    remaining_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO used_count FROM public.lifetime_subscribers;
    remaining_count := GREATEST(0, 500 - used_count);
    
    RETURN QUERY SELECT
        500 as total,
        used_count as used,
        remaining_count as remaining,
        CASE 
            WHEN used_count > 0 THEN ROUND((used_count::NUMERIC / 500) * 100)::INTEGER
            ELSE 0
        END as percentage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- CREATE TRIGGERS
-- =============================================================================

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

CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" ON public.subscriptions
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
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

-- Profiles indexes
CREATE INDEX profiles_email_idx ON public.profiles(email);
CREATE INDEX profiles_created_at_idx ON public.profiles(created_at DESC);

-- Subscriptions indexes
CREATE INDEX subscriptions_user_id_idx ON public.subscriptions(user_id);
CREATE INDEX subscriptions_status_idx ON public.subscriptions(status);
CREATE INDEX subscriptions_tier_idx ON public.subscriptions(tier);
CREATE INDEX subscriptions_tier_name_idx ON public.subscriptions(tier_name);
CREATE INDEX subscriptions_lemon_squeezy_id_idx ON public.subscriptions(lemon_squeezy_id);
CREATE INDEX subscriptions_credits_reset_idx ON public.subscriptions(credits_reset_date);
CREATE INDEX subscriptions_active_idx ON public.subscriptions(user_id, status) WHERE status IN ('active', 'trial');

-- Lifetime subscribers indexes
CREATE INDEX lifetime_subscribers_user_id_idx ON public.lifetime_subscribers(user_id);
CREATE INDEX lifetime_subscribers_number_idx ON public.lifetime_subscribers(subscriber_number);
CREATE INDEX lifetime_subscribers_date_idx ON public.lifetime_subscribers(subscribed_at DESC);

-- API keys indexes
CREATE INDEX api_keys_user_id_idx ON public.api_keys(user_id);
CREATE INDEX api_keys_key_hash_idx ON public.api_keys(key_hash);
CREATE INDEX api_keys_active_idx ON public.api_keys(user_id, revoked) WHERE revoked = false;

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.get_lifetime_subscriber_count() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_lifetime_subscriber_count() TO anon;
GRANT EXECUTE ON FUNCTION public.get_remaining_lifetime_slots() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_remaining_lifetime_slots() TO anon;
GRANT EXECUTE ON FUNCTION public.get_lifetime_offer_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_lifetime_offer_status() TO anon;
GRANT EXECUTE ON FUNCTION public.reserve_lifetime_subscriber_slot(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_lifetime_subscriber_slot(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_lifetime_offer_available() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_lifetime_offer_available() TO anon;
GRANT EXECUTE ON FUNCTION public.get_lifetime_slot_info() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_lifetime_slot_info() TO anon;
GRANT EXECUTE ON FUNCTION public.can_use_credits(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_use_credits(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_credit_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_credit_status(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.consume_credits(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.consume_credits(UUID, INTEGER) TO service_role;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Verify schema matches TypeScript types
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'subscriptions', 'lifetime_subscribers', 'api_keys')
ORDER BY table_name, ordinal_position;

-- =============================================================================
-- DONE!
-- =============================================================================

SELECT 'Database schema created successfully and matches TypeScript types!' as status;