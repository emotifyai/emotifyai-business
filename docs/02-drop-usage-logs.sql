-- =============================================================================
-- DROP USAGE_LOGS TABLE AND CLEANUP
-- =============================================================================
-- This script removes the usage_logs table and all related references
-- Safe to run on existing database to clean up unused functionality

-- =============================================================================
-- DROP USAGE_LOGS TABLE AND RELATED ITEMS
-- =============================================================================

-- Drop usage_logs table if it exists
DROP TABLE IF EXISTS public.usage_logs CASCADE;

-- Drop enhancement_mode enum since it's no longer used
DROP TYPE IF EXISTS enhancement_mode CASCADE;

-- =============================================================================
-- CLEAN UP SUBSCRIPTIONS TABLE LEGACY COLUMNS
-- =============================================================================
-- Remove legacy quota columns that are no longer used in the application

-- Check if legacy columns exist and drop them
DO $$ 
BEGIN
    -- Drop trial_started_at if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'subscriptions' 
               AND column_name = 'trial_started_at' 
               AND table_schema = 'public') THEN
        ALTER TABLE public.subscriptions DROP COLUMN trial_started_at;
    END IF;
    
    -- Drop trial_expires_at if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'subscriptions' 
               AND column_name = 'trial_expires_at' 
               AND table_schema = 'public') THEN
        ALTER TABLE public.subscriptions DROP COLUMN trial_expires_at;
    END IF;
    
    -- Drop monthly_quota if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'subscriptions' 
               AND column_name = 'monthly_quota' 
               AND table_schema = 'public') THEN
        ALTER TABLE public.subscriptions DROP COLUMN monthly_quota;
    END IF;
    
    -- Drop quota_used_this_month if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'subscriptions' 
               AND column_name = 'quota_used_this_month' 
               AND table_schema = 'public') THEN
        ALTER TABLE public.subscriptions DROP COLUMN quota_used_this_month;
    END IF;
    
    -- Drop quota_reset_at if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'subscriptions' 
               AND column_name = 'quota_reset_at' 
               AND table_schema = 'public') THEN
        ALTER TABLE public.subscriptions DROP COLUMN quota_reset_at;
    END IF;
    
    -- Drop cache_enabled if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'subscriptions' 
               AND column_name = 'cache_enabled' 
               AND table_schema = 'public') THEN
        ALTER TABLE public.subscriptions DROP COLUMN cache_enabled;
    END IF;
    
    -- Drop updated_at from profiles if it exists (not in current schema)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'profiles' 
               AND column_name = 'updated_at' 
               AND table_schema = 'public') THEN
        ALTER TABLE public.profiles DROP COLUMN updated_at;
    END IF;
    
    -- Drop updated_at from subscriptions if it exists (not in current schema)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'subscriptions' 
               AND column_name = 'updated_at' 
               AND table_schema = 'public') THEN
        ALTER TABLE public.subscriptions DROP COLUMN updated_at;
    END IF;
    
    -- Drop updated_at from lifetime_subscribers if it exists (not in current schema)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'lifetime_subscribers' 
               AND column_name = 'updated_at' 
               AND table_schema = 'public') THEN
        ALTER TABLE public.lifetime_subscribers DROP COLUMN updated_at;
    END IF;
    
    -- Add onboarded column to profiles if it doesn't exist (required by current schema)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' 
                   AND column_name = 'onboarded' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.profiles ADD COLUMN onboarded BOOLEAN NOT NULL DEFAULT false;
    END IF;
    
    -- Add subscribed_at to lifetime_subscribers if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'lifetime_subscribers' 
                   AND column_name = 'subscribed_at' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.lifetime_subscribers ADD COLUMN subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    END IF;
END $$;

-- =============================================================================
-- DROP UNUSED TRIGGERS AND FUNCTIONS
-- =============================================================================

-- Drop triggers that reference updated_at columns
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
DROP TRIGGER IF EXISTS update_lifetime_subscribers_updated_at ON public.lifetime_subscribers;

-- Drop the update_updated_at_column function if no tables use it
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop any auto_reset_credits function if it exists
DROP FUNCTION IF EXISTS public.auto_reset_credits() CASCADE;

-- Drop reset_user_credits function if it exists (not used in current implementation)
DROP FUNCTION IF EXISTS public.reset_user_credits(UUID) CASCADE;

-- =============================================================================
-- VERIFY CLEANUP
-- =============================================================================

-- Show remaining tables to verify cleanup
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'subscriptions', 'lifetime_subscribers', 'api_keys')
ORDER BY table_name, ordinal_position;

-- Show remaining functions
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%credit%' OR routine_name LIKE '%lifetime%'
ORDER BY routine_name;

-- =============================================================================
-- DONE!
-- =============================================================================

SELECT 'Usage logs table and legacy columns have been cleaned up successfully!' as status;