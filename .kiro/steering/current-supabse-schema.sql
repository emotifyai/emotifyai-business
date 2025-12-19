create table public.api_keys (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  created_at timestamp with time zone not null default now(),
  key_hash text not null,
  name text not null,
  last_used_at timestamp with time zone null,
  revoked boolean not null default false,
  constraint api_keys_pkey primary key (id),
  constraint api_keys_key_hash_key unique (key_hash),
  constraint api_keys_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE,
  constraint api_keys_name_check check (
    (
      (length(name) > 0)
      and (length(name) <= 100)
    )
  )
) TABLESPACE pg_default;

create table public.lifetime_subscribers (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  subscriber_number integer not null,
  subscribed_at timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint lifetime_subscribers_pkey primary key (id),
  constraint lifetime_subscribers_subscriber_number_key unique (subscriber_number),
  constraint lifetime_subscribers_user_id_key unique (user_id),
  constraint lifetime_subscribers_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE,
  constraint lifetime_subscribers_subscriber_number_check check (
    (
      (subscriber_number > 0)
      and (subscriber_number <= 500)
    )
  )
) TABLESPACE pg_default;

create trigger update_lifetime_subscribers_updated_at BEFORE
update on lifetime_subscribers for EACH row
execute FUNCTION update_updated_at_column ();

create table public.profiles (
  id uuid not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  email text not null,
  display_name text null,
  avatar_url text null,
  constraint profiles_pkey primary key (id),
  constraint profiles_email_key unique (email),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint profiles_email_check check (
    (
      email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text
    )
  )
) TABLESPACE pg_default;

create index IF not exists profiles_email_idx on public.profiles using btree (email) TABLESPACE pg_default;

create trigger update_profiles_updated_at BEFORE
update on profiles for EACH row
execute FUNCTION update_updated_at_column ();

create table public.subscriptions (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  lemon_squeezy_id text not null,
  status public.subscription_status not null default 'trial'::subscription_status,
  tier public.subscription_tier not null default 'free'::subscription_tier,
  tier_name text null,
  current_period_start timestamp with time zone not null default now(),
  current_period_end timestamp with time zone not null default (now() + '30 days'::interval),
  cancel_at timestamp with time zone null,
  trial_started_at timestamp with time zone null,
  trial_expires_at timestamp with time zone null,
  monthly_quota integer null,
  quota_used_this_month integer null default 0,
  quota_reset_at timestamp with time zone null,
  cache_enabled boolean null default true,
  credits_limit integer not null default 10,
  credits_used integer not null default 0,
  credits_reset_date timestamp with time zone null,
  validity_days integer null,
  constraint subscriptions_pkey primary key (id),
  constraint subscriptions_lemon_squeezy_id_key unique (lemon_squeezy_id),
  constraint subscriptions_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE,
  constraint subscriptions_credits_check check (
    (
      (credits_used >= 0)
      and (credits_used <= credits_limit)
    )
  ),
  constraint subscriptions_validity_check check (
    (
      (validity_days is null)
      or (validity_days > 0)
    )
  )
) TABLESPACE pg_default;

create index IF not exists subscriptions_user_id_idx on public.subscriptions using btree (user_id) TABLESPACE pg_default;

create index IF not exists subscriptions_status_idx on public.subscriptions using btree (status) TABLESPACE pg_default;

create index IF not exists subscriptions_active_idx on public.subscriptions using btree (user_id, status) TABLESPACE pg_default
where
  (
    status = any (
      array[
        'active'::subscription_status,
        'trial'::subscription_status
      ]
    )
  );

create trigger update_subscriptions_updated_at BEFORE
update on subscriptions for EACH row
execute FUNCTION update_updated_at_column ();

create table public.usage_logs (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  created_at timestamp with time zone not null default now(),
  input_text text not null,
  output_text text not null,
  language text not null default 'en'::text,
  mode public.enhancement_mode not null default 'enhance'::enhancement_mode,
  tokens_used integer not null default 0,
  credits_consumed integer not null default 1,
  success boolean not null default true,
  error_message text null,
  cached boolean null default false,
  tokens_saved integer null default 0,
  constraint usage_logs_pkey primary key (id),
  constraint usage_logs_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE,
  constraint usage_logs_credits_check check ((credits_consumed > 0)),
  constraint usage_logs_text_check check ((length(input_text) > 0)),
  constraint usage_logs_tokens_check check ((tokens_used >= 0))
) TABLESPACE pg_default;

create index IF not exists usage_logs_user_id_idx on public.usage_logs using btree (user_id) TABLESPACE pg_default;

create index IF not exists usage_logs_created_at_idx on public.usage_logs using btree (created_at desc) TABLESPACE pg_default;