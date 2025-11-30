-- =============================================================================
-- SUBSCRIPTION TIERS MIGRATION
-- =============================================================================
-- This migration adds support for the new subscription tier system:
-- - Free Trial (50 generations, 10 days)
-- - Lifetime Launch Offer (500/month, first 500 subscribers)
-- - Basic/Pro/Business Monthly
-- - Basic/Pro/Business Annual
--
-- Run with: psql -d your_database -f 002_subscription_tiers.sql
-- Or through Supabase dashboard

-- =============================================================================
-- UPDATE ENUMS
-- =============================================================================

-- Add new subscription tiers
ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'lifetime_launch';
ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'basic_monthly';
ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'pro_monthly';
ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'business_monthly';
ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'basic_annual';
ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'pro_annual';
ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'business_annual';

-- =============================================================================
-- ALTER SUBSCRIPTIONS TABLE
-- =============================================================================

-- Add trial tracking columns
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMPTZ;

-- Add monthly quota tracking
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS monthly_quota INTEGER,
ADD COLUMN IF NOT EXISTS quota_used_this_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS quota_reset_at TIMESTAMPTZ;

-- Add prompt cache tracking
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS cache_enabled BOOLEAN DEFAULT true;

-- =============================================================================
-- LIFETIME SUBSCRIPTION SLOTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.lifetime_subscription_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  total_slots INTEGER NOT NULL DEFAULT 500,
  used_slots INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT slots_limit CHECK (used_slots <= total_slots)
);

-- Initialize lifetime slots counter
INSERT INTO public.lifetime_subscription_slots (total_slots, used_slots)
VALUES (500, 0)
ON CONFLICT DO NOTHING;

-- Enable RLS on lifetime slots
ALTER TABLE public.lifetime_subscription_slots ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read slot information (for display purposes)
CREATE POLICY "Anyone can view lifetime slots"
  ON public.lifetime_subscription_slots FOR SELECT
  USING (true);

-- =============================================================================
-- USAGE LOGS ENHANCEMENTS
-- =============================================================================

-- Add cache tracking to usage logs
ALTER TABLE public.usage_logs
ADD COLUMN IF NOT EXISTS cached BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tokens_saved INTEGER DEFAULT 0;

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Subscription quota indexes
CREATE INDEX IF NOT EXISTS subscriptions_tier_idx ON public.subscriptions(tier);
CREATE INDEX IF NOT EXISTS subscriptions_quota_reset_idx ON public.subscriptions(quota_reset_at);
CREATE INDEX IF NOT EXISTS subscriptions_trial_expires_idx ON public.subscriptions(trial_expires_at);

-- Usage logs cache index
CREATE INDEX IF NOT EXISTS usage_logs_cached_idx ON public.usage_logs(cached);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to reset monthly quota
CREATE OR REPLACE FUNCTION public.reset_monthly_quota()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if quota reset date has passed
  IF NEW.quota_reset_at IS NOT NULL AND NEW.quota_reset_at <= NOW() THEN
    NEW.quota_used_this_month = 0;
    NEW.quota_reset_at = NOW() + INTERVAL '1 month';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic quota reset
DROP TRIGGER IF EXISTS quota_reset_trigger ON public.subscriptions;
CREATE TRIGGER quota_reset_trigger
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.reset_monthly_quota();

-- Function to check if trial has expired
CREATE OR REPLACE FUNCTION public.is_trial_expired(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  trial_expires TIMESTAMPTZ;
BEGIN
  SELECT trial_expires_at INTO trial_expires
  FROM public.subscriptions
  WHERE user_id = user_uuid
    AND tier = 'trial'
    AND status = 'trial'
  ORDER BY created_at DESC
  LIMIT 1;

  IF trial_expires IS NULL THEN
    RETURN false;
  END IF;

  RETURN trial_expires <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get remaining quota
CREATE OR REPLACE FUNCTION public.get_remaining_quota(user_uuid UUID)
RETURNS TABLE (
  quota INTEGER,
  used INTEGER,
  remaining INTEGER,
  reset_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.monthly_quota,
    s.quota_used_this_month,
    GREATEST(0, s.monthly_quota - s.quota_used_this_month) as remaining,
    s.quota_reset_at
  FROM public.subscriptions s
  WHERE s.user_id = user_uuid
    AND s.status IN ('active', 'trial')
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment usage counter
CREATE OR REPLACE FUNCTION public.increment_usage_counter(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_quota INTEGER;
  current_used INTEGER;
BEGIN
  -- Get current quota and usage
  SELECT monthly_quota, quota_used_this_month
  INTO current_quota, current_used
  FROM public.subscriptions
  WHERE user_id = user_uuid
    AND status IN ('active', 'trial')
  ORDER BY created_at DESC
  LIMIT 1;

  -- Check if quota is available
  IF current_quota IS NULL OR current_used >= current_quota THEN
    RETURN false;
  END IF;

  -- Increment usage counter
  UPDATE public.subscriptions
  SET quota_used_this_month = quota_used_this_month + 1
  WHERE user_id = user_uuid
    AND status IN ('active', 'trial');

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reserve lifetime slot
CREATE OR REPLACE FUNCTION public.reserve_lifetime_slot()
RETURNS BOOLEAN AS $$
DECLARE
  current_used INTEGER;
  total_available INTEGER;
BEGIN
  -- Get current slot status with row lock
  SELECT used_slots, total_slots
  INTO current_used, total_available
  FROM public.lifetime_subscription_slots
  WHERE id = (SELECT id FROM public.lifetime_subscription_slots LIMIT 1)
  FOR UPDATE;

  -- Check if slots are available
  IF current_used >= total_available THEN
    RETURN false;
  END IF;

  -- Reserve a slot
  UPDATE public.lifetime_subscription_slots
  SET used_slots = used_slots + 1,
      updated_at = NOW()
  WHERE id = (SELECT id FROM public.lifetime_subscription_slots LIMIT 1);

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get lifetime slot info
CREATE OR REPLACE FUNCTION public.get_lifetime_slot_info()
RETURNS TABLE (
  total INTEGER,
  used INTEGER,
  remaining INTEGER,
  percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    total_slots,
    used_slots,
    total_slots - used_slots as remaining,
    ROUND((used_slots::NUMERIC / total_slots::NUMERIC) * 100, 2) as percentage
  FROM public.lifetime_subscription_slots
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to initialize subscription with quota
CREATE OR REPLACE FUNCTION public.initialize_subscription_quota(
  user_uuid UUID,
  tier_name subscription_tier
)
RETURNS VOID AS $$
DECLARE
  quota_amount INTEGER;
BEGIN
  -- Set quota based on tier
  CASE tier_name
    WHEN 'trial' THEN quota_amount := 50;
    WHEN 'basic_monthly' THEN quota_amount := 350;
    WHEN 'pro_monthly' THEN quota_amount := 700;
    WHEN 'business_monthly' THEN quota_amount := 1500;
    WHEN 'basic_annual' THEN quota_amount := 350;
    WHEN 'pro_annual' THEN quota_amount := 700;
    WHEN 'business_annual' THEN quota_amount := 1500;
    WHEN 'lifetime_launch' THEN quota_amount := 500;
    ELSE quota_amount := 0;
  END CASE;

  -- Update subscription with quota
  UPDATE public.subscriptions
  SET 
    monthly_quota = quota_amount,
    quota_used_this_month = 0,
    quota_reset_at = CASE 
      WHEN tier_name = 'trial' THEN NULL
      ELSE NOW() + INTERVAL '1 month'
    END,
    trial_started_at = CASE 
      WHEN tier_name = 'trial' THEN NOW()
      ELSE NULL
    END,
    trial_expires_at = CASE 
      WHEN tier_name = 'trial' THEN NOW() + INTERVAL '10 days'
      ELSE NULL
    END
  WHERE user_id = user_uuid
    AND tier = tier_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Apply updated_at trigger to lifetime slots
CREATE TRIGGER update_lifetime_slots_updated_at
  BEFORE UPDATE ON public.lifetime_subscription_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- DATA MIGRATION
-- =============================================================================

-- Update existing subscriptions to have quota tracking
UPDATE public.subscriptions
SET 
  monthly_quota = CASE tier
    WHEN 'trial' THEN 50
    WHEN 'monthly' THEN 350  -- Default to basic
    WHEN 'lifetime' THEN 500
    ELSE 0
  END,
  quota_used_this_month = 0,
  quota_reset_at = CASE 
    WHEN tier != 'trial' THEN NOW() + INTERVAL '1 month'
    ELSE NULL
  END,
  trial_started_at = CASE 
    WHEN tier = 'trial' THEN created_at
    ELSE NULL
  END,
  trial_expires_at = CASE 
    WHEN tier = 'trial' THEN created_at + INTERVAL '10 days'
    ELSE NULL
  END
WHERE monthly_quota IS NULL;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE public.lifetime_subscription_slots IS 'Tracks available lifetime subscription slots (limited to 500)';
COMMENT ON COLUMN public.subscriptions.monthly_quota IS 'Number of enhancements allowed per month';
COMMENT ON COLUMN public.subscriptions.quota_used_this_month IS 'Number of enhancements used in current month';
COMMENT ON COLUMN public.subscriptions.quota_reset_at IS 'When the monthly quota will reset';
COMMENT ON COLUMN public.subscriptions.trial_started_at IS 'When the trial period started';
COMMENT ON COLUMN public.subscriptions.trial_expires_at IS 'When the trial period expires (10 days from start)';
COMMENT ON COLUMN public.usage_logs.cached IS 'Whether this request used cached prompts';
COMMENT ON COLUMN public.usage_logs.tokens_saved IS 'Number of tokens saved through caching';
