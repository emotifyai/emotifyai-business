-- Drop the NOT NULL constraint on current_period_end to support unlimited free and lifetime plans
ALTER TABLE public.subscriptions ALTER COLUMN current_period_end DROP NOT NULL;
