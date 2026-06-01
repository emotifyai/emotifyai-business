-- =============================================================================
-- FULL SCHEMA - CLEAN VERSION
-- =============================================================================
--
-- Migration notes (2026-06): Free funnel is 5 guest + 5 signup bonus (see packages/config/src/pricing.ts).
--   - New subscriptions: status 'active', tier 'free', credits_limit 5, validity_days NULL.
--   - Two-week / 50-credit trial and lifetime_launch checkout are retired (enum values kept for legacy rows).
--   - lifetime_subscribers table retained for historical data; new purchases must not reserve slots.
--   ALTER TABLE subscriptions ALTER COLUMN credits_limit SET DEFAULT 5;
--   ALTER TABLE subscriptions ALTER COLUMN status SET DEFAULT 'active';
--

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- ENUMS
-- =============================================================================

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
    'business_annual',
    'small_bundle',
    'large_bundle'
);

CREATE TYPE enhancement_mode AS ENUM (
    'enhance'
);

-- =============================================================================
-- TABLES
-- =============================================================================

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    email TEXT NOT NULL UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    CONSTRAINT profiles_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Lemon Squeezy integration
    lemon_squeezy_id TEXT NOT NULL UNIQUE,

    -- Subscription details
    status subscription_status NOT NULL DEFAULT 'active',
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
    credits_limit INTEGER NOT NULL DEFAULT 5,
    credits_used INTEGER NOT NULL DEFAULT 0,
    credits_reset_date TIMESTAMPTZ,
    validity_days INTEGER,

    CONSTRAINT subscriptions_credits_check CHECK (credits_used >= 0 AND credits_used <= credits_limit),
    CONSTRAINT subscriptions_validity_check CHECK (validity_days IS NULL OR validity_days > 0)
);

CREATE TABLE public.usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Enhancement details
    input_text TEXT NOT NULL,
    output_text TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'en',
    mode enhancement_mode NOT NULL DEFAULT 'enhance',
    tone TEXT,
    output_language TEXT,

    -- Token and credit tracking
    tokens_used INTEGER NOT NULL DEFAULT 0,
    credits_consumed INTEGER NOT NULL DEFAULT 1,

    -- Request status
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,

    -- Legacy cache columns
    cached BOOLEAN DEFAULT false,
    tokens_saved INTEGER DEFAULT 0,

    -- Editor history
    editor_session_id UUID DEFAULT uuid_generate_v4(),
    is_editor_session BOOLEAN DEFAULT false,

    -- Prompt router analytics
    platform TEXT,
    detected_route TEXT,

    -- Free retry (one per transformation)
    retry_used BOOLEAN NOT NULL DEFAULT false,
    is_retry BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT usage_logs_tokens_check CHECK (tokens_used >= 0),
    CONSTRAINT usage_logs_credits_check CHECK (credits_consumed >= 0),
    CONSTRAINT usage_logs_text_check CHECK (length(input_text) > 0)
);

-- Retry feedback: one row per original usage_log (enforced by UNIQUE)
CREATE TABLE public.retries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    usage_log_id UUID NOT NULL REFERENCES public.usage_logs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    retry_reason TEXT NOT NULL,
    retry_reason_other TEXT,
    CONSTRAINT retries_reason_check CHECK (length(retry_reason) > 0),
    CONSTRAINT retries_one_per_log UNIQUE (usage_log_id)
);

CREATE TABLE public.lifetime_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    subscriber_number INTEGER NOT NULL UNIQUE CHECK (subscriber_number > 0 AND subscriber_number <= 500),
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
-- INDEXES
-- =============================================================================

CREATE INDEX profiles_email_idx ON public.profiles(email);

CREATE INDEX subscriptions_user_id_idx ON public.subscriptions(user_id);
CREATE INDEX subscriptions_status_idx ON public.subscriptions(status);
CREATE INDEX subscriptions_active_idx ON public.subscriptions(user_id, status)
    WHERE status IN ('active', 'trial');

CREATE INDEX usage_logs_user_id_idx ON public.usage_logs(user_id);
CREATE INDEX usage_logs_created_at_idx ON public.usage_logs(created_at DESC);
CREATE INDEX usage_logs_editor_history_idx ON public.usage_logs(user_id, created_at DESC)
    WHERE is_editor_session = true;

CREATE INDEX retries_user_id_idx ON public.retries(user_id);
CREATE INDEX retries_usage_log_id_idx ON public.retries(usage_log_id);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Trigger helper: auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create profile on user signup
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

-- Check if user can use credits (bundle-aware: bundles consumed first)
CREATE OR REPLACE FUNCTION public.can_use_credits(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    sub_record RECORD;
BEGIN
    FOR sub_record IN
        SELECT *
        FROM public.subscriptions
        WHERE user_id = user_uuid
          AND status IN ('active', 'trial')
          AND credits_used < credits_limit
        ORDER BY
            CASE tier::text
                WHEN 'small_bundle' THEN 1
                WHEN 'large_bundle' THEN 2
                ELSE 3
            END,
            created_at ASC
    LOOP
        IF sub_record.tier_name = 'free' AND sub_record.validity_days IS NOT NULL THEN
            IF sub_record.created_at + (sub_record.validity_days || ' days')::INTERVAL < NOW() THEN
                CONTINUE;
            END IF;
        END IF;
        RETURN TRUE;
    END LOOP;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get aggregated credit status across all active subscriptions
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
    total_limit INTEGER := 0;
    total_used INTEGER := 0;
    display_tier TEXT := 'free';
    display_reset TIMESTAMPTZ;
    display_validity INTEGER;
    is_free_expired BOOLEAN := FALSE;
    has_active BOOLEAN := FALSE;
BEGIN
    FOR sub_record IN
        SELECT *
        FROM public.subscriptions
        WHERE user_id = user_uuid
          AND status IN ('active', 'trial')
        ORDER BY created_at DESC
    LOOP
        has_active := TRUE;
        IF sub_record.tier_name = 'free' AND sub_record.validity_days IS NOT NULL THEN
            IF sub_record.created_at + (sub_record.validity_days || ' days')::INTERVAL < NOW() THEN
                is_free_expired := TRUE;
            ELSE
                total_limit := total_limit + sub_record.credits_limit;
                total_used := total_used + sub_record.credits_used;
            END IF;
        ELSE
            total_limit := total_limit + sub_record.credits_limit;
            total_used := total_used + sub_record.credits_used;
        END IF;

        IF display_tier = 'free' OR sub_record.tier::text IN (
            'pro_monthly', 'pro_annual', 'lifetime_launch', 'business_monthly', 'business_annual'
        ) THEN
            display_tier := COALESCE(sub_record.tier_name, sub_record.tier::text);
            display_reset := sub_record.credits_reset_date;
            display_validity := sub_record.validity_days;
        END IF;
    END LOOP;

    IF NOT has_active THEN
        RETURN QUERY SELECT 'free'::TEXT, 5, 0, 5, NULL::TIMESTAMPTZ, NULL::INTEGER, TRUE, FALSE;
        RETURN;
    END IF;

    RETURN QUERY SELECT
        display_tier,
        total_limit,
        total_used,
        GREATEST(0, total_limit - total_used),
        display_reset,
        display_validity,
        is_free_expired,
        (NOT is_free_expired AND total_used < total_limit);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Consume credits (FIFO: bundles first, then subscription)
CREATE OR REPLACE FUNCTION public.consume_credits(user_uuid UUID, credits_to_consume INTEGER DEFAULT 1)
RETURNS BOOLEAN AS $$
DECLARE
    sub_record RECORD;
    remaining INTEGER;
    available INTEGER;
    to_take INTEGER;
BEGIN
    remaining := credits_to_consume;

    FOR sub_record IN
        SELECT *
        FROM public.subscriptions
        WHERE user_id = user_uuid
          AND status IN ('active', 'trial')
          AND credits_used < credits_limit
        ORDER BY
            CASE tier::text
                WHEN 'small_bundle' THEN 1
                WHEN 'large_bundle' THEN 2
                ELSE 3
            END,
            created_at ASC
        FOR UPDATE
    LOOP
        IF sub_record.tier_name = 'free' AND sub_record.validity_days IS NOT NULL THEN
            IF sub_record.created_at + (sub_record.validity_days || ' days')::INTERVAL < NOW() THEN
                CONTINUE;
            END IF;
        END IF;

        available := sub_record.credits_limit - sub_record.credits_used;
        to_take := LEAST(available, remaining);

        UPDATE public.subscriptions
        SET credits_used = credits_used + to_take, updated_at = NOW()
        WHERE id = sub_record.id;

        remaining := remaining - to_take;
        IF remaining <= 0 THEN
            RETURN TRUE;
        END IF;
    END LOOP;

    RETURN remaining <= 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Lifetime subscriber helpers
CREATE OR REPLACE FUNCTION public.get_lifetime_subscriber_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM public.lifetime_subscribers);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

CREATE OR REPLACE FUNCTION public.is_lifetime_offer_available()
RETURNS BOOLEAN AS $$
DECLARE
    used_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO used_count FROM public.lifetime_subscribers;
    RETURN used_count < 500;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
        500,
        used_count,
        remaining_count,
        (remaining_count > 0),
        (remaining_count < 50 AND remaining_count > 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
        500,
        used_count,
        remaining_count,
        CASE
            WHEN used_count > 0 THEN ROUND((used_count::NUMERIC / 500) * 100)::INTEGER
            ELSE 0
        END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.reserve_lifetime_subscriber_slot(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    current_count INTEGER;
    new_subscriber_number INTEGER;
BEGIN
    SELECT COUNT(*) INTO current_count FROM public.lifetime_subscribers;

    IF current_count >= 500 THEN
        RAISE EXCEPTION 'All lifetime subscriber slots are taken';
    END IF;

    new_subscriber_number := current_count + 1;

    INSERT INTO public.lifetime_subscribers (user_id, subscriber_number)
    VALUES (user_uuid, new_subscriber_number)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN new_subscriber_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Editor history helpers
CREATE OR REPLACE FUNCTION public.get_user_editor_history(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    created_at TIMESTAMPTZ,
    input_text TEXT,
    output_text TEXT,
    language TEXT,
    output_language TEXT,
    tone TEXT,
    platform TEXT,
    editor_session_id UUID,
    tokens_used INTEGER,
    retry_used BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ul.id,
        ul.created_at,
        ul.input_text,
        ul.output_text,
        ul.language,
        ul.output_language,
        ul.tone,
        ul.platform,
        ul.editor_session_id,
        ul.tokens_used,
        ul.retry_used
    FROM public.usage_logs ul
    WHERE ul.user_id = user_uuid
      AND ul.is_editor_session = true
      AND ul.created_at >= NOW() - INTERVAL '7 days'
      AND ul.success = true
    ORDER BY ul.created_at DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.cleanup_old_editor_history()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.usage_logs
    WHERE is_editor_session = true
      AND created_at < NOW() - INTERVAL '7 days';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lifetime_subscribers_updated_at
    BEFORE UPDATE ON public.lifetime_subscribers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lifetime_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can manage profiles" ON public.profiles
    FOR ALL USING (auth.role() = 'service_role');

-- Subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" ON public.subscriptions
    FOR ALL USING (auth.role() = 'service_role');

-- Usage logs
CREATE POLICY "Users can view own usage logs" ON public.usage_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage logs" ON public.usage_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage logs" ON public.usage_logs
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage usage logs" ON public.usage_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Retries (feedback)
CREATE POLICY "Users can view own retries" ON public.retries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own retries" ON public.retries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage retries" ON public.retries
    FOR ALL USING (auth.role() = 'service_role');

-- Lifetime subscribers
CREATE POLICY "Users can view own lifetime subscription" ON public.lifetime_subscribers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage lifetime subscriptions" ON public.lifetime_subscribers
    FOR ALL USING (auth.role() = 'service_role');

-- API keys
CREATE POLICY "Users can manage own API keys" ON public.api_keys
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage API keys" ON public.api_keys
    FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- GRANTS
-- =============================================================================

GRANT EXECUTE ON FUNCTION public.can_use_credits(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_credit_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.consume_credits(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_lifetime_subscriber_count() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_remaining_lifetime_slots() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_lifetime_offer_status() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_lifetime_offer_available() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_lifetime_slot_info() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.reserve_lifetime_subscriber_slot(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_editor_history(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_editor_history() TO service_role;

-- =============================================================================
-- MIGRATION (existing databases) — run once if tables already exist
-- =============================================================================
-- ALTER TABLE public.usage_logs ADD COLUMN IF NOT EXISTS retry_used BOOLEAN NOT NULL DEFAULT false;
-- ALTER TABLE public.usage_logs ADD COLUMN IF NOT EXISTS is_retry BOOLEAN NOT NULL DEFAULT false;
-- ALTER TABLE public.usage_logs DROP CONSTRAINT IF EXISTS usage_logs_credits_check;
-- ALTER TABLE public.usage_logs ADD CONSTRAINT usage_logs_credits_check CHECK (credits_consumed >= 0);
-- CREATE TABLE IF NOT EXISTS public.retries (...); — see CREATE TABLE above
-- Recreate get_user_editor_history after column changes (see function definition above).
