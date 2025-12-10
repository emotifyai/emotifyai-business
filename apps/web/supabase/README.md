# EmotifyAI Database Schema Documentation

This directory contains the complete database schema, migrations, and documentation for the EmotifyAI application.

## Overview

The EmotifyAI database uses PostgreSQL (via Supabase) with a credit-based subscription model. The schema supports:

- **6 subscription tiers** with flexible credit allocations
- **Lifetime subscription tracking** (limited to 500 subscribers)
- **Comprehensive usage logging** with credit consumption tracking
- **Row Level Security (RLS)** for data protection
- **Lemon Squeezy integration** for payment processing

## Files Structure

```
supabase/
├── README.md                           # This documentation file
├── schema.sql                          # Complete database schema
├── seed.sql                           # Development seed data
└── migrations/
    ├── 001_initial_schema.sql         # Initial database setup
    ├── 002_subscription_tiers.sql     # Added subscription tiers
    └── 003_credit_based_subscription_model.sql  # Credit-based system
```

## Database Schema

### Core Tables

#### `profiles`
Extends Supabase's `auth.users` with additional user information.

```sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `subscriptions`
Credit-based subscription management with Lemon Squeezy integration.

```sql
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    lemon_squeezy_id TEXT UNIQUE,
    status subscription_status DEFAULT 'trial',
    tier subscription_tier DEFAULT 'free',
    tier_name TEXT,
    credits_limit INTEGER DEFAULT 50,
    credits_used INTEGER DEFAULT 0,
    credits_reset_date TIMESTAMPTZ,
    validity_days INTEGER, -- For free plan
    -- ... additional columns
);
```

#### `lifetime_subscribers`
Tracks lifetime subscribers with sequential numbering (limited to 500).

```sql
CREATE TABLE public.lifetime_subscribers (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) UNIQUE,
    subscriber_number INTEGER UNIQUE CHECK (subscriber_number BETWEEN 1 AND 500),
    subscribed_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `usage_logs`
Comprehensive logging of all text enhancement requests.

```sql
CREATE TABLE public.usage_logs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    input_text TEXT NOT NULL,
    output_text TEXT NOT NULL,
    language TEXT DEFAULT 'en',
    credits_consumed INTEGER DEFAULT 1,
    success BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `api_keys`
API keys for programmatic access to the enhancement service.

```sql
CREATE TABLE public.api_keys (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    key_hash TEXT UNIQUE,
    name TEXT,
    last_used_at TIMESTAMPTZ,
    revoked BOOLEAN DEFAULT false
);
```

### Subscription Tiers

The system supports 6 subscription tiers with different credit allocations:

| Tier | Credits/Month | Price | Duration | Notes |
|------|---------------|-------|----------|-------|
| `free` | 50 | $0 | 10 days | One-time trial |
| `basic_monthly` | 350 | $17 | 1 month | Basic plan |
| `pro_monthly` | 700 | $37 | 1 month | Most popular |
| `business_monthly` | 1500 | $57 | 1 month | High volume |
| `basic_annual` | 350 | $153 | 1 year | 25% discount |
| `pro_annual` | 700 | $333 | 1 year | 25% discount |
| `business_annual` | 1500 | $513 | 1 year | 25% discount |
| `lifetime_launch` | 500 | $97 | Lifetime | Limited to 500 subscribers |

### Key Functions

#### Credit Management
- `can_use_credits(user_uuid)` - Check if user can consume credits
- `consume_credits(user_uuid, credits)` - Consume credits for a user
- `get_user_credit_status(user_uuid)` - Get complete credit status
- `reset_user_credits(user_uuid)` - Reset credits for new billing period

#### Lifetime Subscription Management
- `get_lifetime_subscriber_count()` - Get total lifetime subscribers
- `get_remaining_lifetime_slots()` - Get remaining slots (max 500)
- `reserve_lifetime_subscriber_slot(user_uuid)` - Reserve a lifetime slot
- `get_lifetime_offer_status()` - Get complete offer status with urgency flags

## Setup Instructions

### 1. New Project Setup

For a new Supabase project:

```sql
-- Run the complete schema
\i schema.sql

-- Optional: Add seed data for development
\i seed.sql
```

### 2. Existing Project Migration

For existing projects, run migrations in order:

```sql
-- Apply migrations sequentially
\i migrations/001_initial_schema.sql
\i migrations/002_subscription_tiers.sql
\i migrations/003_credit_based_subscription_model.sql
```

### 3. Environment Variables

Ensure these environment variables are configured:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Lemon Squeezy
LEMONSQUEEZY_API_KEY=your-api-key
LEMONSQUEEZY_STORE_ID=your-store-id
LEMONSQUEEZY_WEBHOOK_SECRET=your-webhook-secret

# Subscription Variant IDs
LEMONSQUEEZY_LIFETIME_LAUNCH_VARIANT_ID=variant-id
LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID=variant-id
LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID=variant-id
LEMONSQUEEZY_BUSINESS_MONTHLY_VARIANT_ID=variant-id
LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID=variant-id
LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID=variant-id
LEMONSQUEEZY_BUSINESS_ANNUAL_VARIANT_ID=variant-id
```

## Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:

- **Users can only access their own data**
- **Service role has full access** for admin operations
- **Public functions** are available for specific operations (lifetime counter, etc.)

### Example Policies

```sql
-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" 
ON subscriptions FOR SELECT 
USING (auth.uid() = user_id);

-- Service role can manage all data
CREATE POLICY "Service role can manage subscriptions" 
ON subscriptions FOR ALL 
USING (auth.role() = 'service_role');
```

## API Integration

### Webhook Handling

The system integrates with Lemon Squeezy webhooks for subscription management:

- **Subscription Created**: Creates new subscription record with proper credit allocation
- **Subscription Updated**: Updates subscription status and billing information
- **Subscription Cancelled**: Marks subscription as cancelled
- **Lifetime Subscriptions**: Automatically reserves lifetime slots

### Credit Consumption

Credits are consumed through the API:

```typescript
// Check if user can use credits
const canUse = await supabase.rpc('can_use_credits', { 
  user_uuid: userId 
});

// Consume credits
const success = await supabase.rpc('consume_credits', { 
  user_uuid: userId, 
  credits_to_consume: 1 
});
```

## Monitoring and Analytics

### Usage Tracking

All enhancement requests are logged with:
- Input/output text
- Language and mode
- Credits consumed
- Success/failure status
- Timestamps

### Subscription Analytics

Query subscription distribution:

```sql
SELECT 
    tier_name,
    COUNT(*) as subscribers,
    SUM(credits_used) as total_credits_used,
    AVG(credits_used::DECIMAL / credits_limit) as avg_usage_rate
FROM subscriptions 
WHERE status = 'active'
GROUP BY tier_name;
```

### Lifetime Offer Tracking

Monitor lifetime offer status:

```sql
SELECT * FROM get_lifetime_offer_status();
```

## Backup and Recovery

### Regular Backups

Supabase automatically handles backups, but for critical data:

```sql
-- Export subscription data
COPY (SELECT * FROM subscriptions) TO '/tmp/subscriptions_backup.csv' CSV HEADER;

-- Export usage logs (last 30 days)
COPY (
  SELECT * FROM usage_logs 
  WHERE created_at > NOW() - INTERVAL '30 days'
) TO '/tmp/usage_logs_backup.csv' CSV HEADER;
```

### Data Recovery

In case of data issues:

1. **Check RLS policies** - Ensure proper access permissions
2. **Verify function permissions** - Functions should be `SECURITY DEFINER`
3. **Monitor webhook processing** - Check Lemon Squeezy webhook logs
4. **Credit reconciliation** - Compare usage logs with subscription credits

## Performance Optimization

### Indexes

Key indexes for performance:

```sql
-- User-specific queries
CREATE INDEX subscriptions_user_active_idx 
ON subscriptions(user_id, status) 
WHERE status IN ('active', 'trial');

-- Usage analytics
CREATE INDEX usage_logs_user_created_idx 
ON usage_logs(user_id, created_at DESC);

-- Lifetime tracking
CREATE INDEX lifetime_subscribers_number_idx 
ON lifetime_subscribers(subscriber_number);
```

### Query Optimization

- Use `get_user_credit_status()` for complete user status
- Batch usage log inserts when possible
- Use proper WHERE clauses with indexed columns

## Troubleshooting

### Common Issues

1. **RLS Permission Denied**
   - Check if user is authenticated
   - Verify RLS policies are correct
   - Use service role for admin operations

2. **Credit Consumption Fails**
   - Check if user has active subscription
   - Verify credit limits not exceeded
   - Check if free plan has expired

3. **Lifetime Slots Exhausted**
   - Verify current count with `get_lifetime_subscriber_count()`
   - Check for race conditions in slot reservation
   - Monitor webhook processing for lifetime subscriptions

4. **Webhook Processing Errors**
   - Verify webhook signature validation
   - Check Lemon Squeezy variant ID mapping
   - Monitor subscription status updates

### Debug Queries

```sql
-- Check user's current subscription status
SELECT * FROM get_user_credit_status('user-uuid-here');

-- Check lifetime offer availability
SELECT * FROM get_lifetime_offer_status();

-- Recent usage for a user
SELECT * FROM usage_logs 
WHERE user_id = 'user-uuid-here' 
ORDER BY created_at DESC 
LIMIT 10;

-- Subscription health check
SELECT 
    tier_name,
    COUNT(*) as count,
    AVG(credits_used::DECIMAL / credits_limit) as avg_usage
FROM subscriptions 
WHERE status = 'active'
GROUP BY tier_name;
```

## Migration History

- **v1.0** (001_initial_schema.sql): Basic subscription model with trial/monthly/lifetime tiers
- **v2.0** (002_subscription_tiers.sql): Added quota tracking and lifetime slot management
- **v3.0** (003_credit_based_subscription_model.sql): Complete credit-based system with 6 tiers

## Security Considerations

- **Never expose service role key** in client-side code
- **Validate all webhook signatures** from Lemon Squeezy
- **Use RLS policies** for all user data access
- **Hash API keys** before storing in database
- **Audit subscription changes** through usage logs
- **Monitor for unusual credit consumption** patterns

## Support

For database-related issues:

1. Check this documentation first
2. Review Supabase logs for errors
3. Verify environment variables are correct
4. Test with seed data in development
5. Contact development team with specific error messages

---

*Last updated: December 2024*
*Schema version: 3.0*