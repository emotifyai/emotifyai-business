-- =============================================================================
-- CREDIT-BASED SUBSCRIPTION MODEL MIGRATION
-- =============================================================================
-- This migration updates the subscription system to support the new credit-based model
-- with proper tier columns, credit tracking, and lifetime subscriber management
--
-- Requirements: 3.1, 3.2, 3.7, 12.1, 12.2, 12.3
-- Run with: psql -d your_database -f 003_credit_based_subscription_model.sql

-- =============================================================================
-- UPDATE SUBSCRIPTION TIER ENUM
-- =============================================================================

-- Add 'free' tier to replace 'trial' for consistency
ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'free';

-- =============================================================================
-- ALTER SUBSCRIPTIONS TABLE FOR CREDIT SYSTEM
-- =============================================================================

-- Add new credit-based columns
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS tier_name TEXT,
ADD COLUMN IF NOT EXISTS credits_limit INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS credits_used INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS credits_reset_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS validity_days INTEGER;

-- Update tier_name based on existing tier enum
UPDATE public.subscriptions 
SET tier_name = CASE tier
    WHEN 'trial' THEN 'free'
    WHEN 'lifetime_launch' THEN 'lifetime_launch'
    WHEN 'basic_monthly' THEN 'basic_monthly'
    WHEN 'pro_monthly' THEN 'pro_monthly'
    WHEN 'business_monthly' THEN 'business_monthly'
    WHEN 'basic_annual' THEN 'basic_annual'
    WHEN 'pro_annual' THEN 'pro_annual'
    WHEN 'business_annual' THEN 'business_annual'
    ELSE 'free'
END
WHERE tier_name IS NULL;

-- Set credits_limit based on tier
UPDATE public.subscriptions 
SET credits_limit = CASE tier_name
    WHEN 'free' THEN 50
    WHEN 'lifetime_launch' THEN 500
    WHEN 'basic_monthly' THEN 350
    WHEN 'pro_monthly' THEN 700
    WHEN 'business_monthly' THEN 1500
    WHEN 'basic_annual' THEN 350
    WHEN 'pro_annual' THEN 700
    WHEN 'business_annual' THEN 1500
    ELSE 50
END
WHERE credits_limit = 0;

-- Set validity_days for free plan
UPDATE public.subscriptions 
SET validity_days = 10
WHERE tier_name = 'free' AND validity_days IS NULL;

-- Set credits_reset_date for monthly/annual plans
UPDATE public.subscriptions 
SET credits_reset_date = CASE 
    WHEN tier_name LIKE '%_monthly' THEN NOW() + INTERVAL '1 month'
    WHEN tier_name LIKE '%_annual' THEN NOW() + INTERVAL '1 year'
    WHEN tier_name = 'lifetime_launch' THEN NOW() + INTERVAL '1 month'
    ELSE NULL
END
WHERE credits_reset_date IS NULL AND tier_name != 'free';

-- =============================================================================
-- LIFETIME SUBSCRIBERS TRACKING TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.lifetime_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subscriber_number INTEGER NOT NULL UNIQUE,
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on lifetime_subscribers
ALTER TABLE public.lifetime_subscribers ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own lifetime subscription record
CREATE POLICY "Users can view own lifetime subscription"
    ON public.lifetime_subscribers FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Service role can manage lifetime subscriptions
CREATE POLICY "Service role can manage lifetime subscriptions"
    ON public.lifetime_subscribers FOR ALL
    USING (auth.role() = 'service_role');

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Subscription credit tracking indexes
CREATE INDEX IF NOT EXISTS subscriptions_tier_name_idx ON public.subscriptions(tier_name);
CREATE INDEX IF NOT EXISTS subscriptions_credits_reset_idx ON public.subscriptions(credits_reset_date);
CREATE INDEX IF NOT EXISTS subscriptions_validity_idx ON public.subscriptions(validity_days);

-- Lifetime subscribers indexes
CREATE INDEX IF NOT EXISTS lifetime_subscribers_user_id_idx ON public.lifetime_subscribers(user_id);
CREATE INDEX IF NOT EXISTS lifetime_subscribers_number_idx ON public.lifetime_subscribers(subscriber_number);
CREATE INDEX IF NOT EXISTS lifetime_subscribers_date_idx ON public.lifetime_subscribers(subscribed_at);

-- =============================================================================
-- DATABASE FUNCTIONS
-- =============================================================================

-- Function to get lifetime subscriber count
CREATE OR REPLACE FUNCTION public.get_lifetime_subscriber_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM public.lifetime_subscribers
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get remaining lifetime slots
CREATE OR REPLACE FUNCTION public.get_remaining_lifetime_slots()
RETURNS INTEGER AS $$
DECLARE
    total_slots INTEGER := 500;
    used_slots INTEGER;
BEGIN
    SELECT COUNT(*) INTO used_slots
    FROM public.lifetime_subscribers;
    
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

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Apply updated_at trigger to lifetime_subscribers
CREATE TRIGGER update_lifetime_subscribers_updated_at
    BEFORE UPDATE ON public.lifetime_subscribers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

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
DROP TRIGGER IF EXISTS auto_reset_credits_trigger ON public.subscriptions;
CREATE TRIGGER auto_reset_credits_trigger
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_reset_credits();

-- =============================================================================
-- UPDATE USAGE LOGS FOR CREDIT TRACKING
-- =============================================================================

-- Add credit tracking to usage logs
ALTER TABLE public.usage_logs
ADD COLUMN IF NOT EXISTS credits_consumed INTEGER NOT NULL DEFAULT 1;

-- Update existing usage logs to have credits_consumed = 1
UPDATE public.usage_logs 
SET credits_consumed = 1 
WHERE credits_consumed IS NULL OR credits_consumed = 0;

-- =============================================================================
-- MIGRATE EXISTING DATA
-- =============================================================================

-- Migrate existing quota data to credit system
UPDATE public.subscriptions
SET 
    credits_used = COALESCE(quota_used_this_month, 0),
    credits_limit = COALESCE(monthly_quota, 
        CASE tier_name
            WHEN 'free' THEN 50
            WHEN 'lifetime_launch' THEN 500
            WHEN 'basic_monthly' THEN 350
            WHEN 'pro_monthly' THEN 700
            WHEN 'business_monthly' THEN 1500
            WHEN 'basic_annual' THEN 350
            WHEN 'pro_annual' THEN 700
            WHEN 'business_annual' THEN 1500
            ELSE 50
        END
    ),
    credits_reset_date = COALESCE(quota_reset_at, 
        CASE 
            WHEN tier_name LIKE '%_monthly' OR tier_name = 'lifetime_launch' THEN NOW() + INTERVAL '1 month'
            WHEN tier_name LIKE '%_annual' THEN NOW() + INTERVAL '1 year'
            ELSE NULL
        END
    )
WHERE tier_name IS NOT NULL;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE public.lifetime_subscribers IS 'Tracks lifetime subscribers with sequential numbering (limited to 500)';
COMMENT ON COLUMN public.subscriptions.tier_name IS 'Human-readable subscription tier name';
COMMENT ON COLUMN public.subscriptions.credits_limit IS 'Maximum credits available per billing period';
COMMENT ON COLUMN public.subscriptions.credits_used IS 'Credits consumed in current billing period';
COMMENT ON COLUMN public.subscriptions.credits_reset_date IS 'When credits will reset for next billing period';
COMMENT ON COLUMN public.subscriptions.validity_days IS 'Number of days the subscription is valid (for free plan)';
COMMENT ON COLUMN public.lifetime_subscribers.subscriber_number IS 'Sequential number from 1-500 for lifetime subscribers';
COMMENT ON COLUMN public.usage_logs.credits_consumed IS 'Number of credits consumed by this enhancement';

COMMENT ON FUNCTION public.get_lifetime_subscriber_count() IS 'Returns total number of lifetime subscribers';
COMMENT ON FUNCTION public.get_remaining_lifetime_slots() IS 'Returns remaining lifetime subscription slots (max 500)';
COMMENT ON FUNCTION public.reserve_lifetime_subscriber_slot(UUID) IS 'Reserves a lifetime slot for a user and returns subscriber number';
COMMENT ON FUNCTION public.is_lifetime_offer_available() IS 'Checks if lifetime offer is still available';
COMMENT ON FUNCTION public.get_lifetime_offer_status() IS 'Returns complete lifetime offer status including urgency flag';
COMMENT ON FUNCTION public.can_use_credits(UUID) IS 'Checks if user can consume credits (not expired, under limit)';
COMMENT ON FUNCTION public.consume_credits(UUID, INTEGER) IS 'Consumes credits for a user, returns success status';
COMMENT ON FUNCTION public.get_user_credit_status(UUID) IS 'Returns complete credit status for a user';
