-- Ultra Minimal Dashboard Migration
-- Creates only the usage stats function, no view dependencies

-- Create usage stats function
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
BEGIN
  -- Try to count projects
  BEGIN
    SELECT COUNT(*) INTO proj_count FROM projects WHERE user_id = p_user_id;
  EXCEPTION WHEN OTHERS THEN
    BEGIN
      SELECT COUNT(*) INTO proj_count FROM projects WHERE created_by = p_user_id;
    EXCEPTION WHEN OTHERS THEN
      proj_count := 0;
    END;
  END;
  
  -- Try to count tasks
  BEGIN
    SELECT COUNT(*) INTO task_count FROM tasks WHERE user_id = p_user_id;
  EXCEPTION WHEN OTHERS THEN
    BEGIN
      SELECT COUNT(*) INTO task_count FROM tasks WHERE created_by = p_user_id;
    EXCEPTION WHEN OTHERS THEN
      task_count := 0;
    END;
  END;
  
  RETURN QUERY SELECT 
    proj_count,
    task_count,
    0::BIGINT as contacts_count,
    0::BIGINT as ai_requests_count,
    0::BIGINT as storage_used,
    CURRENT_TIMESTAMP as calculated_at;
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_usage_stats(UUID, UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_usage_stats(UUID, UUID) TO authenticated;
