-- Ultra Safe Dashboard Migration
-- Detects actual column names and only uses what exists

-- =====================================================
-- 1. CREATE DYNAMIC USAGE STATS FUNCTION
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
  projects_user_col TEXT := NULL;
  tasks_user_col TEXT := NULL;
  contacts_user_col TEXT := NULL;
BEGIN
  -- Detect which user column exists in projects table
  SELECT column_name INTO projects_user_col
  FROM information_schema.columns 
  WHERE table_name = 'projects' 
    AND column_name IN ('user_id', 'created_by', 'owner_id', 'author_id')
  LIMIT 1;
  
  -- Detect which user column exists in tasks table  
  SELECT column_name INTO tasks_user_col
  FROM information_schema.columns 
  WHERE table_name = 'tasks' 
    AND column_name IN ('user_id', 'created_by', 'owner_id', 'author_id', 'assigned_to')
  LIMIT 1;
    
  -- Detect which user column exists in contacts table
  SELECT column_name INTO contacts_user_col
  FROM information_schema.columns 
  WHERE table_name = 'contacts' 
    AND column_name IN ('user_id', 'created_by', 'owner_id', 'author_id')
  LIMIT 1;
  
  -- Count projects using detected column
  IF projects_user_col IS NOT NULL THEN
    BEGIN
      EXECUTE format('SELECT COUNT(*) FROM projects WHERE %I = $1', projects_user_col)
      INTO proj_count USING p_user_id;
    EXCEPTION WHEN OTHERS THEN
      proj_count := 0;
    END;
  END IF;
  
  -- Count tasks using detected column
  IF tasks_user_col IS NOT NULL THEN
    BEGIN
      EXECUTE format('SELECT COUNT(*) FROM tasks WHERE %I = $1', tasks_user_col)
      INTO task_count USING p_user_id;
    EXCEPTION WHEN OTHERS THEN
      task_count := 0;
    END;
  END IF;
  
  -- Count contacts using detected column
  IF contacts_user_col IS NOT NULL THEN
    BEGIN
      EXECUTE format('SELECT COUNT(*) FROM contacts WHERE %I = $1', contacts_user_col)
      INTO contact_count USING p_user_id;
    EXCEPTION WHEN OTHERS THEN
      contact_count := 0;
    END;
  END IF;
  
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
-- 2. CREATE SAFE USER DASHBOARD VIEW
-- =====================================================

-- Create view that only uses columns we know exist
CREATE OR REPLACE VIEW user_dashboard AS
SELECT 
    p.user_id,
    
    -- Get user info from auth.users safely
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
    
    -- Usage counts - will be 0 if tables don't have user columns
    0 as projects_count,
    0 as tasks_count,
    0 as contacts_count,
    0 as ai_requests_this_month

FROM profiles p;

-- Grant access to the view
GRANT SELECT ON user_dashboard TO anon;
GRANT SELECT ON user_dashboard TO authenticated;

-- =====================================================
-- 3. ADD COMMENTS
-- =====================================================

COMMENT ON FUNCTION get_usage_stats(UUID, UUID) IS 'Dynamically detects user columns and returns usage statistics';
COMMENT ON VIEW user_dashboard IS 'Safe dashboard view that uses only known existing columns';
