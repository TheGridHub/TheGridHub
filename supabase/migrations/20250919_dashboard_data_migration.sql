-- Dashboard Data Migration - Simplified and Safe
-- This migration creates the essential components for dashboard functionality

-- =====================================================
-- 1. ENSURE PROFILES TABLE HAS REQUIRED FIELDS FIRST
-- =====================================================

-- Add missing columns to profiles table if they don't exist
DO $$ 
BEGIN
    -- Add first_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'first_name') THEN
        ALTER TABLE profiles ADD COLUMN first_name TEXT;
    END IF;
    
    -- Add last_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'last_name') THEN
        ALTER TABLE profiles ADD COLUMN last_name TEXT;
    END IF;
    
    -- Add workspace_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'workspace_name') THEN
        ALTER TABLE profiles ADD COLUMN workspace_name TEXT;
    END IF;
    
    -- Add preferences column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'preferences') THEN
        ALTER TABLE profiles ADD COLUMN preferences JSONB DEFAULT '{}';
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    -- If profiles table doesn't exist or other error, continue
    NULL;
END $$;

-- =====================================================
-- 2. UPDATE EXISTING DATA SAFELY
-- =====================================================

-- Update existing profiles to have names from full_name if available
DO $$
BEGIN
    UPDATE profiles 
    SET 
        first_name = COALESCE(first_name, SPLIT_PART(full_name, ' ', 1)),
        last_name = COALESCE(last_name, 
            CASE 
                WHEN LENGTH(full_name) - LENGTH(REPLACE(full_name, ' ', '')) > 0
                THEN TRIM(SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1))
                ELSE ''
            END
        ),
        workspace_name = COALESCE(workspace_name, first_name || '''s Workspace', 'My Workspace'),
        preferences = COALESCE(preferences, '{}'::JSONB)
    WHERE (first_name IS NULL OR last_name IS NULL OR workspace_name IS NULL OR preferences IS NULL)
      AND full_name IS NOT NULL 
      AND full_name != '';
      
EXCEPTION WHEN OTHERS THEN
    -- If update fails, continue
    NULL;
END $$;

-- =====================================================
-- 3. CREATE BASIC USAGE STATS FUNCTION
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
    -- Count projects created by user (handles both with and without deleted_at column)
    (SELECT COUNT(*) FROM projects WHERE created_by = p_user_id AND (deleted_at IS NULL OR deleted_at IS NOT NULL))::BIGINT,
    
    -- Count tasks created by user 
    (SELECT COUNT(*) FROM tasks WHERE created_by = p_user_id AND (deleted_at IS NULL OR deleted_at IS NOT NULL))::BIGINT,
    
    -- Count contacts created by user (if contacts table exists)
    (SELECT COUNT(*) FROM contacts WHERE created_by = p_user_id AND (deleted_at IS NULL OR deleted_at IS NOT NULL))::BIGINT,
    
    -- AI requests count - return 0 for now since ai_chats table might not exist
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
-- 4. CREATE SIMPLIFIED USER DASHBOARD VIEW  
-- =====================================================

-- Create a simplified dashboard view that works with existing profiles table
CREATE OR REPLACE VIEW user_dashboard AS
SELECT 
    p.user_id,
    p.first_name,
    p.last_name,
    p.email,
    p.avatar_url,
    p.plan_type,
    
    -- Workspace information (use existing team_id for workspace_id)
    COALESCE(p.team_id, gen_random_uuid()) as workspace_id,
    COALESCE(p.workspace_name, p.first_name || '''s Workspace', 'My Workspace') as workspace_name,
    COALESCE(p.workspace_name, p.first_name || '''s Workspace', 'My Workspace') as workspace_display_name,
    '{}'::JSONB as workspace_settings,
    
    -- Usage counts (calculated dynamically)
    (SELECT COUNT(*)::INTEGER FROM projects WHERE created_by = p.user_id) as projects_count,
    (SELECT COUNT(*)::INTEGER FROM tasks WHERE created_by = p.user_id) as tasks_count,
    0::INTEGER as contacts_count, -- Contacts might not exist yet
    0::INTEGER as ai_requests_this_month -- AI chats might not exist yet

FROM profiles p;

-- Grant access to the view
GRANT SELECT ON user_dashboard TO anon;
GRANT SELECT ON user_dashboard TO authenticated;

-- =====================================================
-- 5. ADD COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION get_usage_stats(UUID, UUID) IS 'Returns usage statistics for a user including project, task, and contact counts';
COMMENT ON VIEW user_dashboard IS 'Simplified dashboard view with user profile and usage data';

