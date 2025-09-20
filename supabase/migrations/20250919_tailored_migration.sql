-- Dashboard Migration - Tailored to Your Schema
-- Based on your actual profiles table structure

-- =====================================================
-- 1. CREATE USAGE STATS FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION get_usage_stats(p_user_id UUID, p_workspace_id UUID DEFAULT NULL)
RETURNS TABLE (
  projects_count BIGINT,
  tasks_count BIGINT,
  contacts_count BIGINT,
  ai_requests_count BIGINT,
  storage_used BIGINT,
  calculated_at TIMESTAMPTZ
) AS $$
DECLARE
  proj_count BIGINT := 0;
  task_count BIGINT := 0;
  contact_count BIGINT := 0;
BEGIN
  -- Count projects (try different column names)
  BEGIN
    SELECT COUNT(*) INTO proj_count FROM projects WHERE user_id = p_user_id;
  EXCEPTION WHEN OTHERS THEN
    BEGIN
      SELECT COUNT(*) INTO proj_count FROM projects WHERE created_by = p_user_id;
    EXCEPTION WHEN OTHERS THEN
      proj_count := 0;
    END;
  END;
  
  -- Count tasks (try different column names)  
  BEGIN
    SELECT COUNT(*) INTO task_count FROM tasks WHERE user_id = p_user_id;
  EXCEPTION WHEN OTHERS THEN
    BEGIN
      SELECT COUNT(*) INTO task_count FROM tasks WHERE created_by = p_user_id;
    EXCEPTION WHEN OTHERS THEN
      task_count := 0;
    END;
  END;
  
  -- Count contacts (if table exists)
  BEGIN
    SELECT COUNT(*) INTO contact_count FROM contacts WHERE user_id = p_user_id;
  EXCEPTION WHEN OTHERS THEN
    BEGIN
      SELECT COUNT(*) INTO contact_count FROM contacts WHERE created_by = p_user_id;
    EXCEPTION WHEN OTHERS THEN
      contact_count := 0;
    END;
  END;
  
  RETURN QUERY SELECT 
    proj_count,
    task_count,
    contact_count,
    0::BIGINT as ai_requests_count,
    0::BIGINT as storage_used,
    CURRENT_TIMESTAMP as calculated_at;
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_usage_stats(UUID, UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_usage_stats(UUID, UUID) TO authenticated;

-- =====================================================
-- 2. CREATE USER DASHBOARD VIEW BASED ON YOUR SCHEMA
-- =====================================================

-- Create view using your actual profiles table columns
CREATE OR REPLACE VIEW user_dashboard AS
SELECT 
    p.user_id,
    
    -- Extract first name from any available data (we'll get it from auth.users if needed)
    COALESCE(
        (SELECT raw_user_meta_data->>'first_name' FROM auth.users WHERE id = p.user_id),
        (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = p.user_id),
        (SELECT email FROM auth.users WHERE id = p.user_id)
    ) as first_name,
    
    -- Extract last name
    COALESCE(
        (SELECT raw_user_meta_data->>'last_name' FROM auth.users WHERE id = p.user_id),
        ''
    ) as last_name,
    
    -- Get email from auth.users
    (SELECT email FROM auth.users WHERE id = p.user_id) as email,
    
    -- Get avatar
    COALESCE(
        (SELECT raw_user_meta_data->>'avatar_url' FROM auth.users WHERE id = p.user_id),
        (SELECT raw_user_meta_data->>'picture' FROM auth.users WHERE id = p.user_id)
    ) as avatar_url,
    
    -- Use your actual plan column (mapped to plan_type for compatibility)
    p.plan as plan_type,
    
    -- Workspace information using your team_name
    p.user_id as workspace_id,  -- Use user_id as workspace_id for now
    COALESCE(p.team_name, 'My Workspace') as workspace_name,
    COALESCE(p.team_name, 'My Workspace') as workspace_display_name,
    p.preferences as workspace_settings,
    
    -- Usage counts (calculated dynamically)
    COALESCE((
        SELECT COUNT(*)::INTEGER 
        FROM projects 
        WHERE user_id = p.user_id OR created_by = p.user_id
    ), 0) as projects_count,
    
    COALESCE((
        SELECT COUNT(*)::INTEGER 
        FROM tasks 
        WHERE user_id = p.user_id OR created_by = p.user_id
    ), 0) as tasks_count,
    
    COALESCE((
        SELECT COUNT(*)::INTEGER 
        FROM contacts 
        WHERE user_id = p.user_id OR created_by = p.user_id
    ), 0) as contacts_count,
    
    0::INTEGER as ai_requests_this_month

FROM profiles p;

-- Grant access to the view
GRANT SELECT ON user_dashboard TO anon;
GRANT SELECT ON user_dashboard TO authenticated;

-- =====================================================
-- 3. ADD HELPFUL COMMENTS
-- =====================================================

COMMENT ON FUNCTION get_usage_stats(UUID, UUID) IS 'Returns usage statistics for a user';
COMMENT ON VIEW user_dashboard IS 'Dashboard view based on your actual profiles schema';
