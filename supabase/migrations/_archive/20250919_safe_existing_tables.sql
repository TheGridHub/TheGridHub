-- Safe Dashboard Migration - Only Using Confirmed Existing Tables
-- Based on your confirmed schema: profiles, projects, tasks, contacts

-- =====================================================
-- 1. DROP EXISTING FUNCTION FIRST
-- =====================================================

DROP FUNCTION IF EXISTS get_usage_stats(UUID, UUID);

-- =====================================================
-- 2. CREATE USAGE STATS FUNCTION (SAFE VERSION)
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
  -- Count projects (confirmed exists)
  BEGIN
    SELECT COUNT(*) INTO proj_count FROM projects WHERE "userId" = p_user_id;
  EXCEPTION WHEN OTHERS THEN
    proj_count := 0;
  END;
  
  -- Count tasks (confirmed exists)
  BEGIN
    SELECT COUNT(*) INTO task_count FROM tasks WHERE "userId" = p_user_id;
  EXCEPTION WHEN OTHERS THEN
    task_count := 0;
  END;
  
  -- Count contacts (confirmed exists)
  BEGIN
    SELECT COUNT(*) INTO contact_count FROM contacts WHERE "userId" = p_user_id;
  EXCEPTION WHEN OTHERS THEN
    contact_count := 0;
  END;
  
  RETURN QUERY SELECT 
    proj_count,
    task_count,
    contact_count,
    0::BIGINT as ai_requests_count, -- Placeholder
    0::BIGINT as storage_used,      -- Placeholder
    CURRENT_TIMESTAMP as calculated_at;
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_usage_stats(UUID, UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_usage_stats(UUID, UUID) TO authenticated;

-- =====================================================
-- 3. CREATE SAFE USER DASHBOARD VIEW
-- =====================================================

DROP VIEW IF EXISTS user_dashboard;

CREATE VIEW user_dashboard AS
SELECT 
    p.user_id,
    
    -- Get user info from auth.users
    COALESCE(
        (SELECT raw_user_meta_data->>'first_name' FROM auth.users WHERE id = p.user_id),
        (SELECT SPLIT_PART(raw_user_meta_data->>'full_name', ' ', 1) FROM auth.users WHERE id = p.user_id),
        (SELECT SPLIT_PART(email, '@', 1) FROM auth.users WHERE id = p.user_id),
        'User'
    ) as first_name,
    
    COALESCE(
        (SELECT raw_user_meta_data->>'last_name' FROM auth.users WHERE id = p.user_id),
        (SELECT CASE WHEN raw_user_meta_data->>'full_name' LIKE '% %' 
                     THEN TRIM(SUBSTRING(raw_user_meta_data->>'full_name' FROM POSITION(' ' IN raw_user_meta_data->>'full_name') + 1))
                     ELSE '' END
         FROM auth.users WHERE id = p.user_id),
        ''
    ) as last_name,
    
    (SELECT email FROM auth.users WHERE id = p.user_id) as email,
    
    COALESCE(
        (SELECT raw_user_meta_data->>'avatar_url' FROM auth.users WHERE id = p.user_id),
        (SELECT raw_user_meta_data->>'picture' FROM auth.users WHERE id = p.user_id)
    ) as avatar_url,
    
    p.plan as plan_type,
    
    -- Workspace info
    p.user_id as workspace_id,
    COALESCE(p.team_name, 'My Workspace') as workspace_name,
    COALESCE(p.team_name, 'My Workspace') as workspace_display_name,
    p.preferences as workspace_settings,
    
    -- Real usage counts using only confirmed existing tables
    COALESCE((SELECT COUNT(*)::INTEGER FROM projects WHERE "userId" = p.user_id), 0) as projects_count,
    COALESCE((SELECT COUNT(*)::INTEGER FROM tasks WHERE "userId" = p.user_id), 0) as tasks_count,
    COALESCE((SELECT COUNT(*)::INTEGER FROM contacts WHERE "userId" = p.user_id), 0) as contacts_count,
    
    -- Monthly AI requests (placeholder for now)
    0::INTEGER as ai_requests_this_month,
    
    -- Subscription and plan info
    p.subscription_status,
    p.onboarding_complete,
    p.created_at,
    p.updated_at

FROM profiles p;

-- Grant access to the view
GRANT SELECT ON user_dashboard TO anon;
GRANT SELECT ON user_dashboard TO authenticated;

-- =====================================================
-- 4. CREATE ANALYTICS FUNCTION (SAFE VERSION)
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_analytics(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  date DATE,
  projects_created INTEGER,
  tasks_created INTEGER,
  tasks_completed INTEGER,
  contacts_created INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      CURRENT_DATE - (p_days || ' days')::INTERVAL,
      CURRENT_DATE,
      '1 day'::INTERVAL
    )::DATE as date
  )
  SELECT 
    ds.date,
    COALESCE((SELECT COUNT(*)::INTEGER FROM projects WHERE "userId" = p_user_id AND "createdAt"::DATE = ds.date), 0) as projects_created,
    COALESCE((SELECT COUNT(*)::INTEGER FROM tasks WHERE "userId" = p_user_id AND "createdAt"::DATE = ds.date), 0) as tasks_created,
    COALESCE((SELECT COUNT(*)::INTEGER FROM tasks WHERE "userId" = p_user_id AND "completedAt"::DATE = ds.date), 0) as tasks_completed,
    COALESCE((SELECT COUNT(*)::INTEGER FROM contacts WHERE "userId" = p_user_id AND "createdAt"::DATE = ds.date), 0) as contacts_created
  FROM date_series ds
  ORDER BY ds.date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to analytics function
GRANT EXECUTE ON FUNCTION get_user_analytics(UUID, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_user_analytics(UUID, INTEGER) TO authenticated;

-- =====================================================
-- 5. ADD COMMENTS
-- =====================================================

COMMENT ON FUNCTION get_usage_stats(UUID, UUID) IS 'Returns usage statistics for confirmed existing tables only';
COMMENT ON FUNCTION get_user_analytics(UUID, INTEGER) IS 'Returns time-series analytics data for confirmed tables';
COMMENT ON VIEW user_dashboard IS 'Dashboard view using only confirmed existing tables';
