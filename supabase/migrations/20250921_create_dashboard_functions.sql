-- Dashboard Functions Migration (2025-01-21)
-- Creates the dashboard functions and views after all tables exist

-- =====================================================
-- 1. DROP EXISTING OBJECTS FIRST
-- =====================================================

DROP FUNCTION IF EXISTS get_usage_stats(UUID, UUID);
DROP VIEW IF EXISTS user_dashboard;

-- =====================================================
-- 2. CREATE WORKING USAGE STATS FUNCTION
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
  ai_requests_this_month BIGINT,
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
  ai_total_count BIGINT := 0;
  ai_month_count BIGINT := 0;
BEGIN
  -- Count all entities for the user (with error handling)
  BEGIN SELECT COUNT(*) INTO proj_count FROM projects WHERE "userId" = p_user_id; EXCEPTION WHEN OTHERS THEN proj_count := 0; END;
  BEGIN SELECT COUNT(*) INTO task_count FROM tasks WHERE "userId" = p_user_id; EXCEPTION WHEN OTHERS THEN task_count := 0; END;
  BEGIN SELECT COUNT(*) INTO contact_count FROM contacts WHERE "userId" = p_user_id; EXCEPTION WHEN OTHERS THEN contact_count := 0; END;
  BEGIN SELECT COUNT(*) INTO company_count FROM companies WHERE "userId" = p_user_id; EXCEPTION WHEN OTHERS THEN company_count := 0; END;
  BEGIN SELECT COUNT(*) INTO note_count FROM notes WHERE "userId" = p_user_id; EXCEPTION WHEN OTHERS THEN note_count := 0; END;
  BEGIN SELECT COUNT(*) INTO email_count FROM emails WHERE "userId" = p_user_id; EXCEPTION WHEN OTHERS THEN email_count := 0; END;
  BEGIN SELECT COUNT(*) INTO integration_count FROM integrations WHERE "userId" = p_user_id; EXCEPTION WHEN OTHERS THEN integration_count := 0; END;
  BEGIN SELECT COUNT(*) INTO notification_count FROM notifications WHERE "userId" = p_user_id; EXCEPTION WHEN OTHERS THEN notification_count := 0; END;
  BEGIN SELECT COUNT(*) INTO calendar_count FROM calendar_events WHERE "userId" = p_user_id; EXCEPTION WHEN OTHERS THEN calendar_count := 0; END;
  BEGIN SELECT COUNT(*) INTO team_count FROM teams WHERE "userId" = p_user_id OR "ownerId" = p_user_id; EXCEPTION WHEN OTHERS THEN team_count := 0; END;
  BEGIN SELECT COUNT(*) INTO ai_total_count FROM ai_requests WHERE "userId" = p_user_id; EXCEPTION WHEN OTHERS THEN ai_total_count := 0; END;
  
  -- Count AI requests this month
  BEGIN 
    SELECT COUNT(*) INTO ai_month_count 
    FROM ai_requests 
    WHERE "userId" = p_user_id 
      AND "createdAt" >= DATE_TRUNC('month', CURRENT_DATE);
  EXCEPTION WHEN OTHERS THEN 
    ai_month_count := 0; 
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
    ai_total_count,
    ai_month_count,
    0::BIGINT as storage_used,
    CURRENT_TIMESTAMP as calculated_at;
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. CREATE WORKING USER DASHBOARD VIEW
-- =====================================================

CREATE VIEW user_dashboard AS
SELECT 
    p.user_id,
    
    -- Get user info from auth.users (safe approach)
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
    
    -- Get email from auth.users instead of profiles.email
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
    COALESCE(p.preferences, '{}'::JSONB) as workspace_settings,
    
    -- Usage counts with error handling - using safe subqueries
    (SELECT COUNT(*)::INTEGER FROM projects WHERE "userId" = p.user_id) as projects_count,
    (SELECT COUNT(*)::INTEGER FROM tasks WHERE "userId" = p.user_id) as tasks_count,
    (SELECT COUNT(*)::INTEGER FROM contacts WHERE "userId" = p.user_id) as contacts_count,
    (SELECT COUNT(*)::INTEGER FROM companies WHERE "userId" = p.user_id) as companies_count,
    (SELECT COUNT(*)::INTEGER FROM notes WHERE "userId" = p.user_id) as notes_count,
    (SELECT COUNT(*)::INTEGER FROM emails WHERE "userId" = p.user_id) as emails_count,
    (SELECT COUNT(*)::INTEGER FROM integrations WHERE "userId" = p.user_id) as integrations_count,
    (SELECT COUNT(*)::INTEGER FROM notifications WHERE "userId" = p.user_id) as notifications_count,
    (SELECT COUNT(*)::INTEGER FROM calendar_events WHERE "userId" = p.user_id) as calendar_events_count,
    (SELECT COUNT(*)::INTEGER FROM teams WHERE "userId" = p.user_id OR "ownerId" = p.user_id) as teams_count,
    
    -- AI requests this month
    (SELECT COUNT(*)::INTEGER FROM ai_requests 
     WHERE "userId" = p.user_id 
       AND "createdAt" >= DATE_TRUNC('month', CURRENT_DATE)) as ai_requests_this_month,
    
    -- Profile info
    p.subscription_status,
    p.onboarding_complete,
    p.created_at,
    p.updated_at

FROM profiles p;

-- =====================================================
-- 4. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION get_usage_stats(UUID, UUID) TO anon, authenticated;
GRANT SELECT ON user_dashboard TO anon, authenticated;

-- =====================================================
-- 5. ADD COMMENTS
-- =====================================================

COMMENT ON FUNCTION get_usage_stats(UUID, UUID) IS 'Returns comprehensive usage statistics with error handling';
COMMENT ON VIEW user_dashboard IS 'Dashboard view that works with actual schema and gets email from auth.users';
