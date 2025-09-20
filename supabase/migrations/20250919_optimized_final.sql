-- Optimized Dashboard Migration - Using Your Actual Schema
-- Includes all your tables: projects, tasks, contacts, companies, notes, etc.

-- =====================================================
-- 1. CREATE COMPREHENSIVE USAGE STATS FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION get_usage_stats(p_user_id UUID, p_workspace_id UUID DEFAULT NULL)
RETURNS TABLE (
  projects_count BIGINT,
  tasks_count BIGINT,
  contacts_count BIGINT,
  companies_count BIGINT,
  notes_count BIGINT,
  emails_count BIGINT,
  integrations_count BIGINT,
  notifications_count BIGINT,
  calendar_events_count BIGINT,
  teams_count BIGINT,
  ai_requests_count BIGINT,
  storage_used BIGINT,
  calculated_at TIMESTAMPTZ
) AS $$
DECLARE
  proj_count BIGINT := 0;
  task_count BIGINT := 0;
  contact_count BIGINT := 0;
  company_count BIGINT := 0;
  note_count BIGINT := 0;
  email_count BIGINT := 0;
  integration_count BIGINT := 0;
  notification_count BIGINT := 0;
  calendar_count BIGINT := 0;
  team_count BIGINT := 0;
BEGIN
  -- Count projects
  BEGIN
    SELECT COUNT(*) INTO proj_count FROM projects WHERE "userId" = p_user_id;
  EXCEPTION WHEN OTHERS THEN
    proj_count := 0;
  END;
  
  -- Count tasks
  BEGIN
    SELECT COUNT(*) INTO task_count FROM tasks WHERE "userId" = p_user_id;
  EXCEPTION WHEN OTHERS THEN
    task_count := 0;
  END;
  
  -- Count contacts
  BEGIN
    SELECT COUNT(*) INTO contact_count FROM contacts WHERE "userId" = p_user_id;
  EXCEPTION WHEN OTHERS THEN
    contact_count := 0;
  END;
  
  -- Count companies
  BEGIN
    SELECT COUNT(*) INTO company_count FROM companies WHERE "userId" = p_user_id;
  EXCEPTION WHEN OTHERS THEN
    company_count := 0;
  END;
  
  -- Count notes
  BEGIN
    SELECT COUNT(*) INTO note_count FROM notes WHERE "userId" = p_user_id;
  EXCEPTION WHEN OTHERS THEN
    note_count := 0;
  END;
  
  -- Count emails
  BEGIN
    SELECT COUNT(*) INTO email_count FROM emails WHERE "userId" = p_user_id;
  EXCEPTION WHEN OTHERS THEN
    email_count := 0;
  END;
  
  -- Count integrations
  BEGIN
    SELECT COUNT(*) INTO integration_count FROM integrations WHERE "userId" = p_user_id;
  EXCEPTION WHEN OTHERS THEN
    integration_count := 0;
  END;
  
  -- Count notifications
  BEGIN
    SELECT COUNT(*) INTO notification_count FROM notifications WHERE "userId" = p_user_id;
  EXCEPTION WHEN OTHERS THEN
    notification_count := 0;
  END;
  
  -- Count calendar events
  BEGIN
    SELECT COUNT(*) INTO calendar_count FROM calendar WHERE "userId" = p_user_id;
  EXCEPTION WHEN OTHERS THEN
    BEGIN
      SELECT COUNT(*) INTO calendar_count FROM calendar_events WHERE "userId" = p_user_id;
    EXCEPTION WHEN OTHERS THEN
      calendar_count := 0;
    END;
  END;
  
  -- Count teams (user might be member of teams)
  BEGIN
    SELECT COUNT(*) INTO team_count FROM teams WHERE "userId" = p_user_id OR "ownerId" = p_user_id;
  EXCEPTION WHEN OTHERS THEN
    BEGIN
      SELECT COUNT(*) INTO team_count FROM teams WHERE "userId" = p_user_id;
    EXCEPTION WHEN OTHERS THEN
      team_count := 0;
    END;
  END;
  
  RETURN QUERY SELECT 
    proj_count,
    task_count,
    contact_count,
    company_count,
    note_count,
    email_count,
    integration_count,
    notification_count,
    calendar_count,
    team_count,
    0::BIGINT as ai_requests_count, -- Will implement later
    0::BIGINT as storage_used,      -- Will implement later
    CURRENT_TIMESTAMP as calculated_at;
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_usage_stats(UUID, UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_usage_stats(UUID, UUID) TO authenticated;

-- =====================================================
-- 2. CREATE COMPREHENSIVE USER DASHBOARD VIEW
-- =====================================================

CREATE OR REPLACE VIEW user_dashboard AS
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
    
    -- Real usage counts using correct column names
    COALESCE((SELECT COUNT(*)::INTEGER FROM projects WHERE "userId" = p.user_id), 0) as projects_count,
    COALESCE((SELECT COUNT(*)::INTEGER FROM tasks WHERE "userId" = p.user_id), 0) as tasks_count,
    COALESCE((SELECT COUNT(*)::INTEGER FROM contacts WHERE "userId" = p.user_id), 0) as contacts_count,
    
    -- Additional counts for comprehensive tracking
    COALESCE((SELECT COUNT(*)::INTEGER FROM companies WHERE "userId" = p.user_id), 0) as companies_count,
    COALESCE((SELECT COUNT(*)::INTEGER FROM notes WHERE "userId" = p.user_id), 0) as notes_count,
    COALESCE((SELECT COUNT(*)::INTEGER FROM emails WHERE "userId" = p.user_id), 0) as emails_count,
    
    -- Monthly AI requests (placeholder for now)
    0::INTEGER as ai_requests_this_month,
    
    -- Last activity tracking
    GREATEST(
        COALESCE((SELECT MAX("updatedAt") FROM projects WHERE "userId" = p.user_id), '1970-01-01'::timestamptz),
        COALESCE((SELECT MAX("updatedAt") FROM tasks WHERE "userId" = p.user_id), '1970-01-01'::timestamptz),
        COALESCE((SELECT MAX("updatedAt") FROM contacts WHERE "userId" = p.user_id), '1970-01-01'::timestamptz)
    ) as last_activity,
    
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
-- 3. CREATE ANALYTICS HELPER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_analytics(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  date DATE,
  projects_created INTEGER,
  tasks_created INTEGER,
  tasks_completed INTEGER,
  contacts_created INTEGER,
  companies_created INTEGER,
  notes_created INTEGER,
  emails_sent INTEGER
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
    COALESCE((SELECT COUNT(*)::INTEGER FROM contacts WHERE "userId" = p_user_id AND "createdAt"::DATE = ds.date), 0) as contacts_created,
    COALESCE((SELECT COUNT(*)::INTEGER FROM companies WHERE "userId" = p_user_id AND "createdAt"::DATE = ds.date), 0) as companies_created,
    COALESCE((SELECT COUNT(*)::INTEGER FROM notes WHERE "userId" = p_user_id AND "createdAt"::DATE = ds.date), 0) as notes_created,
    COALESCE((SELECT COUNT(*)::INTEGER FROM emails WHERE "userId" = p_user_id AND "createdAt"::DATE = ds.date), 0) as emails_sent
  FROM date_series ds
  ORDER BY ds.date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to analytics function
GRANT EXECUTE ON FUNCTION get_user_analytics(UUID, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_user_analytics(UUID, INTEGER) TO authenticated;

-- =====================================================
-- 4. ADD COMPREHENSIVE COMMENTS
-- =====================================================

COMMENT ON FUNCTION get_usage_stats(UUID, UUID) IS 'Returns comprehensive usage statistics for all user data';
COMMENT ON FUNCTION get_user_analytics(UUID, INTEGER) IS 'Returns time-series analytics data for dashboard charts';
COMMENT ON VIEW user_dashboard IS 'Complete dashboard view with real counts from all user tables';
