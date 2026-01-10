-- =============================================================================
-- EDITOR HISTORY MIGRATION
-- =============================================================================
-- Extends existing schema to support editor history with 7-day retention

-- Add new columns to usage_logs for editor history support
ALTER TABLE public.usage_logs ADD COLUMN IF NOT EXISTS 
  editor_session_id UUID DEFAULT uuid_generate_v4();

ALTER TABLE public.usage_logs ADD COLUMN IF NOT EXISTS 
  is_editor_session BOOLEAN DEFAULT false;

ALTER TABLE public.usage_logs ADD COLUMN IF NOT EXISTS 
  tone TEXT;

ALTER TABLE public.usage_logs ADD COLUMN IF NOT EXISTS 
  output_language TEXT;

-- Create index for efficient history queries
CREATE INDEX IF NOT EXISTS usage_logs_editor_history_idx 
  ON public.usage_logs(user_id, created_at DESC) 
  WHERE is_editor_session = true;

-- Function to get user's editor history (last 7 days)
CREATE OR REPLACE FUNCTION public.get_user_editor_history(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    created_at TIMESTAMPTZ,
    input_text TEXT,
    output_text TEXT,
    language TEXT,
    output_language TEXT,
    tone TEXT,
    editor_session_id UUID,
    tokens_used INTEGER
) AS $$
BEGIN
    RETURN QUERY SELECT
        ul.id,
        ul.created_at,
        ul.input_text,
        ul.output_text,
        ul.language,
        ul.output_language,
        ul.tone,
        ul.editor_session_id,
        ul.tokens_used
    FROM public.usage_logs ul
    WHERE ul.user_id = user_uuid
      AND ul.is_editor_session = true
      AND ul.created_at >= NOW() - INTERVAL '7 days'
      AND ul.success = true
    ORDER BY ul.created_at DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old editor history (7+ days old)
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_user_editor_history(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_editor_history() TO service_role;

-- Create a scheduled job to clean up old history (if using pg_cron extension)
-- This would typically be set up separately in production
-- SELECT cron.schedule('cleanup-editor-history', '0 2 * * *', 'SELECT public.cleanup_old_editor_history();');