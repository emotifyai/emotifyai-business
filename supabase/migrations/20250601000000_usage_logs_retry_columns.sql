-- usage_logs: free-retry tracking columns (existing DBs)
ALTER TABLE public.usage_logs
  ADD COLUMN IF NOT EXISTS retry_used BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.usage_logs
  ADD COLUMN IF NOT EXISTS is_retry BOOLEAN NOT NULL DEFAULT false;

-- retries: feedback for free retry (skip if already created via docs/sql/project.sql)
CREATE TABLE IF NOT EXISTS public.retries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    usage_log_id UUID NOT NULL REFERENCES public.usage_logs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    retry_reason TEXT NOT NULL,
    retry_reason_other TEXT,
    CONSTRAINT retries_reason_check CHECK (length(retry_reason) > 0),
    CONSTRAINT retries_one_per_log UNIQUE (usage_log_id)
);

-- Recreate editor history RPC so retry_used is returned (safe if function unchanged)
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
