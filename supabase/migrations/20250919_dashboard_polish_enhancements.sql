-- Enhanced Dashboard Polish & Enhancements Migration
-- Adds support for onboarding data persistence, AI chats, usage tracking, and workspace management

-- =====================================================
-- 1. PROFILES TABLE ENHANCEMENTS
-- =====================================================

-- Add missing profile fields for onboarding data
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS workspace_name TEXT,
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- Update profiles table to ensure all required fields exist
ALTER TABLE profiles 
ALTER COLUMN avatar_url SET DEFAULT NULL,
ALTER COLUMN bio SET DEFAULT NULL,
ALTER COLUMN preferences SET DEFAULT '{}';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_first_name ON profiles(first_name);
CREATE INDEX IF NOT EXISTS idx_profiles_last_name ON profiles(last_name);
CREATE INDEX IF NOT EXISTS idx_profiles_workspace_name ON profiles(workspace_name);

-- =====================================================
-- 2. WORKSPACES TABLE (if not exists)
-- =====================================================

CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    settings JSONB DEFAULT '{}',
    plan_type plan_type DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspace indexes
CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_slug ON workspaces(slug);
CREATE INDEX IF NOT EXISTS idx_workspaces_plan_type ON workspaces(plan_type);

-- =====================================================
-- 3. AI CHATS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    thread_id TEXT, -- For grouping related messages
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    tokens_used INTEGER DEFAULT 0,
    model_used TEXT DEFAULT 'gpt-3.5-turbo',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI chats indexes
CREATE INDEX IF NOT EXISTS idx_ai_chats_user_id ON ai_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chats_workspace_id ON ai_chats(workspace_id);
CREATE INDEX IF NOT EXISTS idx_ai_chats_thread_id ON ai_chats(thread_id);
CREATE INDEX IF NOT EXISTS idx_ai_chats_created_at ON ai_chats(created_at DESC);

-- =====================================================
-- 4. USAGE TRACKING TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL, -- 'projects', 'tasks', 'contacts', 'ai_requests', 'storage'
    resource_id UUID,
    action TEXT NOT NULL, -- 'create', 'update', 'delete', 'request'
    quantity INTEGER DEFAULT 1,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking indexes
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_workspace_id ON usage_tracking(workspace_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_resource_type ON usage_tracking(resource_type);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_created_at ON usage_tracking(created_at DESC);

-- =====================================================
-- 5. ENHANCED TABLES (if modifications needed)
-- =====================================================

-- Ensure teams table has proper structure
ALTER TABLE teams 
ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- Ensure projects table has workspace reference
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;

-- Ensure tasks table has workspace reference
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;

-- Ensure contacts table has workspace reference
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;

-- Ensure companies table has workspace reference
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;

-- =====================================================
-- 6. USAGE TRACKING RPC FUNCTIONS
-- =====================================================

-- Function to get current usage for a user/workspace
CREATE OR REPLACE FUNCTION get_usage_stats(p_user_id UUID, p_workspace_id UUID DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    project_count INTEGER;
    task_count INTEGER;
    contact_count INTEGER;
    ai_requests_count INTEGER;
    storage_used BIGINT;
BEGIN
    -- Get project count
    IF p_workspace_id IS NOT NULL THEN
        SELECT COUNT(*) INTO project_count FROM projects WHERE workspace_id = p_workspace_id;
        SELECT COUNT(*) INTO task_count FROM tasks WHERE workspace_id = p_workspace_id;
        SELECT COUNT(*) INTO contact_count FROM contacts WHERE workspace_id = p_workspace_id;
    ELSE
        SELECT COUNT(*) INTO project_count FROM projects WHERE created_by = p_user_id;
        SELECT COUNT(*) INTO task_count FROM tasks WHERE created_by = p_user_id;
        SELECT COUNT(*) INTO contact_count FROM contacts WHERE created_by = p_user_id;
    END IF;

    -- Get AI requests count (last 30 days)
    SELECT COUNT(*) INTO ai_requests_count 
    FROM ai_chats 
    WHERE user_id = p_user_id 
      AND role = 'user' 
      AND created_at >= NOW() - INTERVAL '30 days';

    -- Calculate storage used (placeholder - can be enhanced)
    storage_used := 0; -- TODO: Calculate actual storage from files

    result := jsonb_build_object(
        'projects_count', project_count,
        'tasks_count', task_count,
        'contacts_count', contact_count,
        'ai_requests_count', ai_requests_count,
        'storage_used', storage_used,
        'calculated_at', NOW()
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track usage
CREATE OR REPLACE FUNCTION track_usage(
    p_user_id UUID,
    p_workspace_id UUID,
    p_resource_type TEXT,
    p_action TEXT,
    p_quantity INTEGER DEFAULT 1,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO usage_tracking (
        user_id,
        workspace_id,
        resource_type,
        action,
        quantity,
        metadata
    ) VALUES (
        p_user_id,
        p_workspace_id,
        p_resource_type,
        p_action,
        p_quantity,
        p_metadata
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. RLS POLICIES
-- =====================================================

-- Workspaces RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workspaces" ON workspaces
    FOR SELECT USING (
        owner_id = auth.uid() OR 
        id IN (
            SELECT team_id FROM profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create their own workspaces" ON workspaces
    FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Workspace owners can update their workspaces" ON workspaces
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Workspace owners can delete their workspaces" ON workspaces
    FOR DELETE USING (owner_id = auth.uid());

-- AI Chats RLS
ALTER TABLE ai_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI chats" ON ai_chats
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own AI chats" ON ai_chats
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own AI chats" ON ai_chats
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own AI chats" ON ai_chats
    FOR DELETE USING (user_id = auth.uid());

-- Usage Tracking RLS
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage" ON usage_tracking
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can track their own usage" ON usage_tracking
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- =====================================================
-- 8. TRIGGERS FOR AUTOMATIC USAGE TRACKING
-- =====================================================

-- Function to automatically track usage
CREATE OR REPLACE FUNCTION auto_track_usage()
RETURNS TRIGGER AS $$
BEGIN
    -- Track creation
    IF TG_OP = 'INSERT' THEN
        INSERT INTO usage_tracking (
            user_id,
            workspace_id,
            resource_type,
            resource_id,
            action,
            quantity,
            metadata
        ) VALUES (
            NEW.created_by,
            COALESCE(NEW.workspace_id, NEW.team_id),
            TG_TABLE_NAME,
            NEW.id,
            'create',
            1,
            '{}'::jsonb
        );
        RETURN NEW;
    END IF;

    -- Track updates
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO usage_tracking (
            user_id,
            workspace_id,
            resource_type,
            resource_id,
            action,
            quantity,
            metadata
        ) VALUES (
            NEW.created_by,
            COALESCE(NEW.workspace_id, NEW.team_id),
            TG_TABLE_NAME,
            NEW.id,
            'update',
            1,
            '{}'::jsonb
        );
        RETURN NEW;
    END IF;

    -- Track deletion
    IF TG_OP = 'DELETE' THEN
        INSERT INTO usage_tracking (
            user_id,
            workspace_id,
            resource_type,
            resource_id,
            action,
            quantity,
            metadata
        ) VALUES (
            OLD.created_by,
            COALESCE(OLD.workspace_id, OLD.team_id),
            TG_TABLE_NAME,
            OLD.id,
            'delete',
            1,
            '{}'::jsonb
        );
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for usage tracking
DROP TRIGGER IF EXISTS track_projects_usage ON projects;
CREATE TRIGGER track_projects_usage
    AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW EXECUTE FUNCTION auto_track_usage();

DROP TRIGGER IF EXISTS track_tasks_usage ON tasks;
CREATE TRIGGER track_tasks_usage
    AFTER INSERT OR UPDATE OR DELETE ON tasks
    FOR EACH ROW EXECUTE FUNCTION auto_track_usage();

DROP TRIGGER IF EXISTS track_contacts_usage ON contacts;
CREATE TRIGGER track_contacts_usage
    AFTER INSERT OR UPDATE OR DELETE ON contacts
    FOR EACH ROW EXECUTE FUNCTION auto_track_usage();

-- =====================================================
-- 9. VIEWS FOR DASHBOARD DATA
-- =====================================================

-- User dashboard view with real-time data
CREATE OR REPLACE VIEW user_dashboard AS
SELECT 
    p.user_id,
    p.first_name,
    p.last_name,
    p.email,
    p.avatar_url,
    p.workspace_name,
    p.plan_type,
    w.id as workspace_id,
    w.name as workspace_display_name,
    w.settings as workspace_settings,
    (
        SELECT COUNT(*)::INTEGER 
        FROM projects pr 
        WHERE pr.created_by = p.user_id 
           OR pr.workspace_id = w.id
    ) as projects_count,
    (
        SELECT COUNT(*)::INTEGER 
        FROM tasks t 
        WHERE t.created_by = p.user_id 
           OR t.workspace_id = w.id
    ) as tasks_count,
    (
        SELECT COUNT(*)::INTEGER 
        FROM contacts c 
        WHERE c.created_by = p.user_id 
           OR c.workspace_id = w.id
    ) as contacts_count,
    (
        SELECT COUNT(*)::INTEGER 
        FROM ai_chats ac 
        WHERE ac.user_id = p.user_id 
          AND ac.created_at >= NOW() - INTERVAL '30 days'
          AND ac.role = 'user'
    ) as ai_requests_this_month
FROM profiles p
LEFT JOIN workspaces w ON p.team_id = w.id;

-- Grant access to the view
GRANT SELECT ON user_dashboard TO authenticated;

-- =====================================================
-- 10. UPDATE EXISTING DATA
-- =====================================================

-- Update any existing profiles without first_name/last_name from full_name
UPDATE profiles 
SET 
    first_name = SPLIT_PART(full_name, ' ', 1),
    last_name = CASE 
        WHEN array_length(string_to_array(full_name, ' '), 1) > 1 
        THEN array_to_string(string_to_array(full_name, ' ')[2:], ' ')
        ELSE ''
    END
WHERE first_name IS NULL 
  AND last_name IS NULL 
  AND full_name IS NOT NULL 
  AND full_name != '';

-- Create default workspace for users who don't have one
INSERT INTO workspaces (name, owner_id, plan_type)
SELECT 
    COALESCE(p.workspace_name, p.first_name || '''s Workspace', 'My Workspace'),
    p.user_id,
    p.plan_type
FROM profiles p
WHERE p.team_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM workspaces w WHERE w.owner_id = p.user_id)
ON CONFLICT (owner_id) DO NOTHING;

-- Link profiles to their default workspaces
UPDATE profiles 
SET team_id = w.id
FROM workspaces w
WHERE profiles.user_id = w.owner_id 
  AND profiles.team_id IS NULL;

COMMENT ON TABLE ai_chats IS 'Stores AI chat conversations for the dashboard chatbot';
COMMENT ON TABLE usage_tracking IS 'Tracks resource usage for billing and analytics';
COMMENT ON TABLE workspaces IS 'User workspaces for multi-tenant organization';
COMMENT ON VIEW user_dashboard IS 'Consolidated view of user dashboard data with real-time counts';
