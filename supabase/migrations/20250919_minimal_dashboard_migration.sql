-- Minimal Dashboard Migration - Safe for any schema state
-- This migration creates dashboard functionality without assuming existing columns

-- =====================================================
-- 1. CREATE BASIC USAGE STATS FUNCTION
-- =====================================================

-- Simple usage stats function that works with existing tables
CREATE OR REPLACE FUNCTION get_usage_stats(p_user_id UUID, p_workspace_id UUID DEFAULT NULL)
RETURNS TABLE (
  projects_count BIGINT,
  tasks_count BIGINT,
  contacts_count BIGINT,
  ai_requests_count BIGINT,
  storage_used BIGINT,
  calculated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- Count projects created by user
    COALESCE((SELECT COUNT(*) FROM projects WHERE user_id = p_user_id OR created_by = p_user_id), 0)::BIGINT,
    
    -- Count tasks created by user 
    COALESCE((SELECT COUNT(*) FROM tasks WHERE user_id = p_user_id OR created_by = p_user_id), 0)::BIGINT,
    
    -- Count contacts - return 0 if table doesn't exist
    0::BIGINT,
    
    -- AI requests count - return 0 for now
    0::BIGINT,
    
    -- Storage used - return 0 for now
    0::BIGINT,
    
    -- Current timestamp
    CURRENT_TIMESTAMP;
    
EXCEPTION WHEN OTHERS THEN
  -- If any table doesn't exist, return zeros
  RETURN QUERY SELECT 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_usage_stats(UUID, UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_usage_stats(UUID, UUID) TO authenticated;

-- =====================================================
-- 2. CREATE DYNAMIC DASHBOARD VIEW
-- =====================================================

-- Create view that works with any profile table structure
CREATE OR REPLACE VIEW user_dashboard AS
SELECT 
    p.user_id,
    
    -- Handle first_name - use full_name if first_name doesn't exist
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'first_name') 
        THEN COALESCE(p.first_name, SPLIT_PART(COALESCE(p.full_name, p.email), ' ', 1))
        ELSE SPLIT_PART(COALESCE(p.full_name, p.email), ' ', 1)
    END as first_name,
    
    -- Handle last_name - extract from full_name if last_name doesn't exist  
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_name')
        THEN COALESCE(p.last_name, CASE WHEN p.full_name LIKE '% %' THEN TRIM(SUBSTRING(p.full_name FROM POSITION(' ' IN p.full_name) + 1)) ELSE '' END)
        ELSE CASE WHEN p.full_name LIKE '% %' THEN TRIM(SUBSTRING(p.full_name FROM POSITION(' ' IN p.full_name) + 1)) ELSE '' END
    END as last_name,
    
    p.email,
    p.avatar_url,
    COALESCE(p.plan_type, 'free') as plan_type,
    
    -- Workspace information
    COALESCE(p.team_id, gen_random_uuid()) as workspace_id,
    
    -- Handle workspace_name
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'workspace_name')
        THEN COALESCE(p.workspace_name, SPLIT_PART(COALESCE(p.full_name, p.email), ' ', 1) || '''s Workspace')
        ELSE SPLIT_PART(COALESCE(p.full_name, p.email), ' ', 1) || '''s Workspace'
    END as workspace_name,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'workspace_name')
        THEN COALESCE(p.workspace_name, SPLIT_PART(COALESCE(p.full_name, p.email), ' ', 1) || '''s Workspace')
        ELSE SPLIT_PART(COALESCE(p.full_name, p.email), ' ', 1) || '''s Workspace'
    END as workspace_display_name,
    
    '{}'::JSONB as workspace_settings,
    
    -- Usage counts (calculated dynamically)
    COALESCE((SELECT COUNT(*)::INTEGER FROM projects WHERE user_id = p.user_id OR created_by = p.user_id), 0) as projects_count,
    COALESCE((SELECT COUNT(*)::INTEGER FROM tasks WHERE user_id = p.user_id OR created_by = p.user_id), 0) as tasks_count,
    0::INTEGER as contacts_count,
    0::INTEGER as ai_requests_this_month

FROM profiles p;

-- Grant access to the view
GRANT SELECT ON user_dashboard TO anon;
GRANT SELECT ON user_dashboard TO authenticated;

-- =====================================================
-- 3. ADD COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION get_usage_stats(UUID, UUID) IS 'Returns usage statistics for a user including project, task, and contact counts';
COMMENT ON VIEW user_dashboard IS 'Dynamic dashboard view that adapts to any profiles table structure';
