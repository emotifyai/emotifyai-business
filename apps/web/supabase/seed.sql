-- =============================================================================
-- EMOTIFYAI DATABASE SEED DATA
-- =============================================================================
-- This file contains seed data for testing and development
-- 
-- WARNING: This file is for development/testing only!
-- DO NOT run this in production as it creates test users and data
-- =============================================================================

-- =============================================================================
-- TEST USERS
-- =============================================================================

-- Note: In a real application, users are created through Supabase Auth
-- This is just for testing the database structure

-- Insert test profiles (these would normally be created by the auth trigger)
INSERT INTO public.profiles (id, email, display_name, created_at, updated_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'free@emotifyai.com', 'Free User', NOW() - INTERVAL '5 days', NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', 'basic@emotifyai.com', 'Basic User', NOW() - INTERVAL '30 days', NOW()),
    ('550e8400-e29b-41d4-a716-446655440003', 'pro@emotifyai.com', 'Pro User', NOW() - INTERVAL '60 days', NOW()),
    ('550e8400-e29b-41d4-a716-446655440004', 'business@emotifyai.com', 'Business User', NOW() - INTERVAL '90 days', NOW()),
    ('550e8400-e29b-41d4-a716-446655440005', 'lifetime@emotifyai.com', 'Lifetime User', NOW() - INTERVAL '120 days', NOW()),
    ('550e8400-e29b-41d4-a716-446655440006', 'annual@emotifyai.com', 'Annual User', NOW() - INTERVAL '180 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- SUBSCRIPTION EXAMPLES
-- =============================================================================

-- Free Plan Example (10-day validity, 50 credits)
INSERT INTO public.subscriptions (
    id, user_id, lemon_squeezy_id, status, tier, tier_name,
    current_period_start, current_period_end,
    credits_limit, credits_used, validity_days,
    created_at, updated_at
) VALUES (
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'free_550e8400-e29b-41d4-a716-446655440001',
    'trial',
    'free',
    'free',
    NOW() - INTERVAL '5 days',
    NOW() + INTERVAL '5 days',
    50,
    15,
    10,
    NOW() - INTERVAL '5 days',
    NOW()
) ON CONFLICT (lemon_squeezy_id) DO NOTHING;

-- Basic Monthly Example (350 credits/month, $17)
INSERT INTO public.subscriptions (
    id, user_id, lemon_squeezy_id, status, tier, tier_name,
    current_period_start, current_period_end,
    credits_limit, credits_used, credits_reset_date,
    created_at, updated_at
) VALUES (
    '660e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440002',
    'ls_sub_basic_monthly_001',
    'active',
    'basic_monthly',
    'basic_monthly',
    NOW() - INTERVAL '15 days',
    NOW() + INTERVAL '15 days',
    350,
    120,
    NOW() + INTERVAL '15 days',
    NOW() - INTERVAL '30 days',
    NOW()
) ON CONFLICT (lemon_squeezy_id) DO NOTHING;

-- Pro Monthly Example (700 credits/month, $37)
INSERT INTO public.subscriptions (
    id, user_id, lemon_squeezy_id, status, tier, tier_name,
    current_period_start, current_period_end,
    credits_limit, credits_used, credits_reset_date,
    created_at, updated_at
) VALUES (
    '660e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440003',
    'ls_sub_pro_monthly_001',
    'active',
    'pro_monthly',
    'pro_monthly',
    NOW() - INTERVAL '10 days',
    NOW() + INTERVAL '20 days',
    700,
    250,
    NOW() + INTERVAL '20 days',
    NOW() - INTERVAL '60 days',
    NOW()
) ON CONFLICT (lemon_squeezy_id) DO NOTHING;

-- Business Monthly Example (1500 credits/month, $57)
INSERT INTO public.subscriptions (
    id, user_id, lemon_squeezy_id, status, tier, tier_name,
    current_period_start, current_period_end,
    credits_limit, credits_used, credits_reset_date,
    created_at, updated_at
) VALUES (
    '660e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440004',
    'ls_sub_business_monthly_001',
    'active',
    'business_monthly',
    'business_monthly',
    NOW() - INTERVAL '5 days',
    NOW() + INTERVAL '25 days',
    1500,
    500,
    NOW() + INTERVAL '25 days',
    NOW() - INTERVAL '90 days',
    NOW()
) ON CONFLICT (lemon_squeezy_id) DO NOTHING;

-- Lifetime Launch Offer Example (1000 credits/month, $97 one-time)
INSERT INTO public.subscriptions (
    id, user_id, lemon_squeezy_id, status, tier, tier_name,
    current_period_start, current_period_end,
    credits_limit, credits_used, credits_reset_date,
    created_at, updated_at
) VALUES (
    '660e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440005',
    'ls_sub_lifetime_launch_001',
    'active',
    'lifetime_launch',
    'lifetime_launch',
    NOW() - INTERVAL '120 days',
    '2099-12-31 23:59:59+00',
    500,
    150,
    NOW() + INTERVAL '10 days',
    NOW() - INTERVAL '120 days',
    NOW()
) ON CONFLICT (lemon_squeezy_id) DO NOTHING;

-- Pro Annual Example (700 credits/month, 25% discount)
INSERT INTO public.subscriptions (
    id, user_id, lemon_squeezy_id, status, tier, tier_name,
    current_period_start, current_period_end,
    credits_limit, credits_used, credits_reset_date,
    created_at, updated_at
) VALUES (
    '660e8400-e29b-41d4-a716-446655440006',
    '550e8400-e29b-41d4-a716-446655440006',
    'ls_sub_pro_annual_001',
    'active',
    'pro_annual',
    'pro_annual',
    NOW() - INTERVAL '180 days',
    NOW() + INTERVAL '185 days',
    700,
    200,
    NOW() + INTERVAL '30 days',
    NOW() - INTERVAL '180 days',
    NOW()
) ON CONFLICT (lemon_squeezy_id) DO NOTHING;

-- =============================================================================
-- LIFETIME SUBSCRIBERS
-- =============================================================================

-- Add the lifetime user to the lifetime subscribers table
INSERT INTO public.lifetime_subscribers (
    id, user_id, subscriber_number, subscribed_at, created_at, updated_at
) VALUES (
    '770e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440005',
    1,
    NOW() - INTERVAL '120 days',
    NOW() - INTERVAL '120 days',
    NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- Add a few more lifetime subscribers to show the counter working
INSERT INTO public.lifetime_subscribers (user_id, subscriber_number, subscribed_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440007', 2, NOW() - INTERVAL '119 days'),
    ('550e8400-e29b-41d4-a716-446655440008', 3, NOW() - INTERVAL '118 days'),
    ('550e8400-e29b-41d4-a716-446655440009', 4, NOW() - INTERVAL '117 days'),
    ('550e8400-e29b-41d4-a716-446655440010', 5, NOW() - INTERVAL '116 days')
ON CONFLICT (user_id) DO NOTHING;

-- Note: We need to create the corresponding profiles for these users too
INSERT INTO public.profiles (id, email, display_name, created_at, updated_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440007', 'lifetime2@emotifyai.com', 'Lifetime User 2', NOW() - INTERVAL '119 days', NOW()),
    ('550e8400-e29b-41d4-a716-446655440008', 'lifetime3@emotifyai.com', 'Lifetime User 3', NOW() - INTERVAL '118 days', NOW()),
    ('550e8400-e29b-41d4-a716-446655440009', 'lifetime4@emotifyai.com', 'Lifetime User 4', NOW() - INTERVAL '117 days', NOW()),
    ('550e8400-e29b-41d4-a716-446655440010', 'lifetime5@emotifyai.com', 'Lifetime User 5', NOW() - INTERVAL '116 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- USAGE LOGS EXAMPLES
-- =============================================================================

-- Usage logs for different users showing various enhancement patterns
INSERT INTO public.usage_logs (
    user_id, input_text, output_text, language, mode, 
    tokens_used, credits_consumed, success, created_at
) VALUES
    -- Free user usage
    ('550e8400-e29b-41d4-a716-446655440001', 'make this better', 'Please improve this text for better clarity and impact.', 'en', 'enhance', 42, 1, true, NOW() - INTERVAL '2 hours'),
    ('550e8400-e29b-41d4-a716-446655440001', 'hello world', 'Greetings, world! Welcome to our platform.', 'en', 'enhance', 38, 1, true, NOW() - INTERVAL '4 hours'),
    ('550e8400-e29b-41d4-a716-446655440001', 'quick test', 'This is a quick test of our enhancement capabilities.', 'en', 'enhance', 35, 1, true, NOW() - INTERVAL '1 day'),
    
    -- Basic user usage
    ('550e8400-e29b-41d4-a716-446655440002', 'need help with email', 'I require assistance with composing a professional email.', 'en', 'enhance', 45, 1, true, NOW() - INTERVAL '1 hour'),
    ('550e8400-e29b-41d4-a716-446655440002', 'meeting notes rough', 'These are preliminary meeting notes that require refinement.', 'en', 'enhance', 48, 1, true, NOW() - INTERVAL '3 hours'),
    ('550e8400-e29b-41d4-a716-446655440002', 'project update', 'Here is the latest project status update for your review.', 'en', 'enhance', 41, 1, true, NOW() - INTERVAL '2 days'),
    
    -- Pro user usage (more frequent)
    ('550e8400-e29b-41d4-a716-446655440003', 'client proposal draft', 'This comprehensive client proposal outlines our strategic approach and deliverables.', 'en', 'enhance', 52, 1, true, NOW() - INTERVAL '30 minutes'),
    ('550e8400-e29b-41d4-a716-446655440003', 'technical documentation', 'This technical documentation provides detailed implementation guidelines.', 'en', 'enhance', 49, 1, true, NOW() - INTERVAL '2 hours'),
    ('550e8400-e29b-41d4-a716-446655440003', 'marketing copy', 'Compelling marketing copy that drives engagement and conversions.', 'en', 'enhance', 44, 1, true, NOW() - INTERVAL '5 hours'),
    ('550e8400-e29b-41d4-a716-446655440003', 'blog post intro', 'An engaging blog post introduction that captures reader attention immediately.', 'en', 'enhance', 47, 1, true, NOW() - INTERVAL '1 day'),
    
    -- Business user usage (high volume)
    ('550e8400-e29b-41d4-a716-446655440004', 'quarterly report', 'Comprehensive quarterly business report with key performance indicators and strategic insights.', 'en', 'enhance', 58, 1, true, NOW() - INTERVAL '15 minutes'),
    ('550e8400-e29b-41d4-a716-446655440004', 'team communication', 'Important team communication regarding upcoming project milestones and deliverables.', 'en', 'enhance', 51, 1, true, NOW() - INTERVAL '1 hour'),
    ('550e8400-e29b-41d4-a716-446655440004', 'investor update', 'Monthly investor update highlighting company progress and future opportunities.', 'en', 'enhance', 54, 1, true, NOW() - INTERVAL '3 hours'),
    
    -- Lifetime user usage
    ('550e8400-e29b-41d4-a716-446655440005', 'creative writing', 'Engaging creative writing piece that captivates readers with vivid imagery and compelling narrative.', 'en', 'enhance', 61, 1, true, NOW() - INTERVAL '45 minutes'),
    ('550e8400-e29b-41d4-a716-446655440005', 'academic paper', 'Scholarly academic paper presenting research findings with rigorous methodology and analysis.', 'en', 'enhance', 67, 1, true, NOW() - INTERVAL '2 hours'),
    
    -- Annual user usage
    ('550e8400-e29b-41d4-a716-446655440006', 'product description', 'Detailed product description highlighting key features and customer benefits.', 'en', 'enhance', 46, 1, true, NOW() - INTERVAL '1 hour'),
    ('550e8400-e29b-41d4-a716-446655440006', 'social media post', 'Engaging social media post designed to increase audience engagement and brand awareness.', 'en', 'enhance', 43, 1, true, NOW() - INTERVAL '4 hours')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- API KEYS EXAMPLES
-- =============================================================================

-- Sample API keys for testing (these would be hashed in real usage)
INSERT INTO public.api_keys (
    user_id, key_hash, name, last_used_at, revoked, created_at
) VALUES
    ('550e8400-e29b-41d4-a716-446655440003', 'hashed_key_pro_user_001', 'Production Extension', NOW() - INTERVAL '2 hours', false, NOW() - INTERVAL '30 days'),
    ('550e8400-e29b-41d4-a716-446655440003', 'hashed_key_pro_user_002', 'Development Testing', NOW() - INTERVAL '1 day', false, NOW() - INTERVAL '15 days'),
    ('550e8400-e29b-41d4-a716-446655440004', 'hashed_key_business_001', 'Business API Access', NOW() - INTERVAL '1 hour', false, NOW() - INTERVAL '60 days'),
    ('550e8400-e29b-41d4-a716-446655440004', 'hashed_key_business_002', 'Legacy Key (Revoked)', NOW() - INTERVAL '30 days', true, NOW() - INTERVAL '90 days'),
    ('550e8400-e29b-41d4-a716-446655440005', 'hashed_key_lifetime_001', 'Lifetime Access Key', NOW() - INTERVAL '3 hours', false, NOW() - INTERVAL '120 days')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- These queries can be used to verify the seed data was inserted correctly

-- Check subscription tiers distribution
-- SELECT tier_name, COUNT(*) as count FROM public.subscriptions GROUP BY tier_name ORDER BY tier_name;

-- Check lifetime subscriber count
-- SELECT public.get_lifetime_subscriber_count() as lifetime_subscribers;

-- Check remaining lifetime slots
-- SELECT public.get_remaining_lifetime_slots() as remaining_slots;

-- Check credit usage by tier
-- SELECT s.tier_name, s.credits_limit, s.credits_used, 
--        ROUND((s.credits_used::DECIMAL / s.credits_limit) * 100, 1) as usage_percentage
-- FROM public.subscriptions s 
-- ORDER BY s.tier_name;

-- Check recent usage logs
-- SELECT p.email, ul.created_at, ul.input_text, ul.credits_consumed
-- FROM public.usage_logs ul
-- JOIN public.profiles p ON ul.user_id = p.id
-- ORDER BY ul.created_at DESC
-- LIMIT 10;

-- =============================================================================
-- CLEANUP (for development only)
-- =============================================================================

-- Uncomment these lines to clean up seed data if needed:
-- DELETE FROM public.usage_logs WHERE user_id IN (SELECT id FROM public.profiles WHERE email LIKE '%@emotifyai.com');
-- DELETE FROM public.api_keys WHERE user_id IN (SELECT id FROM public.profiles WHERE email LIKE '%@emotifyai.com');
-- DELETE FROM public.lifetime_subscribers WHERE user_id IN (SELECT id FROM public.profiles WHERE email LIKE '%@emotifyai.com');
-- DELETE FROM public.subscriptions WHERE user_id IN (SELECT id FROM public.profiles WHERE email LIKE '%@emotifyai.com');
-- DELETE FROM public.profiles WHERE email LIKE '%@emotifyai.com';

-- =============================================================================
-- END OF SEED DATA
-- =============================================================================