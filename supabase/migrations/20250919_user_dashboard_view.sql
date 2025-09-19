-- Create user_dashboard view for comprehensive dashboard data
CREATE OR REPLACE VIEW user_dashboard AS
SELECT 
  p.user_id,
  p.first_name,
  p.last_name,
  p.email,
  p.avatar_url,
  p.plan_type,
  
  -- Workspace information
  w.id as workspace_id,
  w.name as workspace_name,
  w.name as workspace_display_name,
  w.settings as workspace_settings,
  
  -- Usage counts
  COALESCE(proj_count.count, 0) as projects_count,
  COALESCE(task_count.count, 0) as tasks_count,
  COALESCE(contact_count.count, 0) as contacts_count,
  
  -- AI usage this month
  COALESCE(ai_count.count, 0) as ai_requests_this_month

FROM user_profiles p

-- Join with workspace (first workspace user belongs to)
LEFT JOIN workspace_members wm ON wm.user_id = p.user_id AND wm.role IN ('owner', 'admin', 'member')
LEFT JOIN workspaces w ON w.id = wm.workspace_id

-- Count projects
LEFT JOIN (
  SELECT created_by, COUNT(*) as count
  FROM projects
  WHERE deleted_at IS NULL
  GROUP BY created_by
) proj_count ON proj_count.created_by = p.user_id

-- Count tasks  
LEFT JOIN (
  SELECT created_by, COUNT(*) as count
  FROM tasks
  WHERE deleted_at IS NULL
  GROUP BY created_by
) task_count ON task_count.created_by = p.user_id

-- Count contacts
LEFT JOIN (
  SELECT created_by, COUNT(*) as count
  FROM contacts
  WHERE deleted_at IS NULL
  GROUP BY created_by
) contact_count ON contact_count.created_by = p.user_id

-- Count AI requests this month
LEFT JOIN (
  SELECT user_id, COUNT(*) as count
  FROM ai_chats
  WHERE created_at >= date_trunc('month', CURRENT_DATE)
  GROUP BY user_id
) ai_count ON ai_count.user_id = p.user_id;

-- Grant access to the view
GRANT SELECT ON user_dashboard TO anon, authenticated;

-- Create get_usage_stats function
CREATE OR REPLACE FUNCTION get_usage_stats(
  p_user_id UUID,
  p_workspace_id UUID DEFAULT NULL
)
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
    COALESCE(proj_count.count, 0) as projects_count,
    COALESCE(task_count.count, 0) as tasks_count,
    COALESCE(contact_count.count, 0) as contacts_count,
    COALESCE(ai_count.count, 0) as ai_requests_count,
    0::BIGINT as storage_used, -- Placeholder for now
    CURRENT_TIMESTAMP as calculated_at
    
  FROM (SELECT 1) dummy -- Dummy table for FROM clause

  -- Count projects
  LEFT JOIN (
    SELECT COUNT(*) as count
    FROM projects
    WHERE created_by = p_user_id 
    AND deleted_at IS NULL
    AND (p_workspace_id IS NULL OR workspace_id = p_workspace_id)
  ) proj_count ON true

  -- Count tasks  
  LEFT JOIN (
    SELECT COUNT(*) as count
    FROM tasks
    WHERE created_by = p_user_id
    AND deleted_at IS NULL
    AND (p_workspace_id IS NULL OR project_id IN (
      SELECT id FROM projects WHERE workspace_id = p_workspace_id
    ))
  ) task_count ON true

  -- Count contacts
  LEFT JOIN (
    SELECT COUNT(*) as count
    FROM contacts
    WHERE created_by = p_user_id
    AND deleted_at IS NULL
    AND (p_workspace_id IS NULL OR workspace_id = p_workspace_id)
  ) contact_count ON true

  -- Count AI requests this month
  LEFT JOIN (
    SELECT COUNT(*) as count
    FROM ai_chats
    WHERE user_id = p_user_id
    AND created_at >= date_trunc('month', CURRENT_DATE)
    AND (p_workspace_id IS NULL OR workspace_id = p_workspace_id)
  ) ai_count ON true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_usage_stats TO anon, authenticated;
