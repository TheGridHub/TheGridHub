-- Complete Production Migration for TheGridHub
-- Creates all missing tables and comprehensive dashboard functionality

-- =====================================================
-- 1. CREATE MISSING TABLES
-- =====================================================

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    website TEXT,
    industry TEXT,
    size TEXT,
    location TEXT,
    phone TEXT,
    email TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    tags TEXT[] NOT NULL DEFAULT '{}',
    logoUrl TEXT,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    tags TEXT[] NOT NULL DEFAULT '{}',
    category TEXT DEFAULT 'general',
    priority TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'active',
    "userId" UUID NOT NULL,
    "projectId" UUID,
    "taskId" UUID,
    "contactId" UUID,
    "companyId" UUID,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Emails table
CREATE TABLE IF NOT EXISTS emails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject TEXT NOT NULL,
    content TEXT,
    "fromEmail" TEXT NOT NULL,
    "toEmails" TEXT[] NOT NULL,
    "ccEmails" TEXT[] DEFAULT '{}',
    "bccEmails" TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'draft',
    priority TEXT NOT NULL DEFAULT 'normal',
    "sentAt" TIMESTAMPTZ,
    "userId" UUID NOT NULL,
    "contactId" UUID,
    "companyId" UUID,
    "projectId" UUID,
    "integrationId" UUID,
    attachments JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Integrations table
CREATE TABLE IF NOT EXISTS integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'inactive',
    settings JSONB NOT NULL DEFAULT '{}',
    credentials JSONB NOT NULL DEFAULT '{}',
    "lastSyncAt" TIMESTAMPTZ,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT,
    type TEXT NOT NULL DEFAULT 'info',
    status TEXT NOT NULL DEFAULT 'unread',
    priority TEXT NOT NULL DEFAULT 'normal',
    "actionUrl" TEXT,
    metadata JSONB DEFAULT '{}',
    "userId" UUID NOT NULL,
    "relatedId" UUID,
    "relatedType" TEXT,
    "readAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Calendar/Events table
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    "startDate" TIMESTAMPTZ NOT NULL,
    "endDate" TIMESTAMPTZ NOT NULL,
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    location TEXT,
    attendees TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'scheduled',
    priority TEXT NOT NULL DEFAULT 'normal',
    "reminderMinutes" INTEGER DEFAULT 15,
    "userId" UUID NOT NULL,
    "projectId" UUID,
    "taskId" UUID,
    "contactId" UUID,
    "integrationId" UUID,
    "externalId" TEXT,
    metadata JSONB DEFAULT '{}',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    "ownerId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- AI Requests table
CREATE TABLE IF NOT EXISTS ai_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prompt TEXT NOT NULL,
    response TEXT,
    model TEXT DEFAULT 'gpt-4',
    tokens INTEGER DEFAULT 0,
    cost DECIMAL(10,6) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'completed',
    type TEXT DEFAULT 'general',
    "userId" UUID NOT NULL,
    "projectId" UUID,
    "taskId" UUID,
    metadata JSONB DEFAULT '{}',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- User-based indexes for fast filtering
CREATE INDEX IF NOT EXISTS companies_userId_idx ON companies("userId");
CREATE INDEX IF NOT EXISTS notes_userId_idx ON notes("userId");
CREATE INDEX IF NOT EXISTS emails_userId_idx ON emails("userId");
CREATE INDEX IF NOT EXISTS integrations_userId_idx ON integrations("userId");
CREATE INDEX IF NOT EXISTS notifications_userId_idx ON notifications("userId");
CREATE INDEX IF NOT EXISTS calendar_events_userId_idx ON calendar_events("userId");
CREATE INDEX IF NOT EXISTS teams_userId_idx ON teams("userId");
CREATE INDEX IF NOT EXISTS ai_requests_userId_idx ON ai_requests("userId");

-- Date-based indexes for analytics
CREATE INDEX IF NOT EXISTS companies_createdAt_idx ON companies("createdAt");
CREATE INDEX IF NOT EXISTS notes_createdAt_idx ON notes("createdAt");
CREATE INDEX IF NOT EXISTS emails_createdAt_idx ON emails("createdAt");
CREATE INDEX IF NOT EXISTS calendar_events_startDate_idx ON calendar_events("startDate");
CREATE INDEX IF NOT EXISTS ai_requests_createdAt_idx ON ai_requests("createdAt");

-- Status indexes for filtering
CREATE INDEX IF NOT EXISTS emails_status_idx ON emails(status);
CREATE INDEX IF NOT EXISTS notifications_status_idx ON notifications(status);
CREATE INDEX IF NOT EXISTS calendar_events_status_idx ON calendar_events(status);

-- =====================================================
-- 3. DROP EXISTING FUNCTIONS AND VIEWS
-- =====================================================

DROP FUNCTION IF EXISTS get_usage_stats(UUID, UUID);
DROP FUNCTION IF EXISTS get_user_analytics(UUID, INTEGER);
DROP VIEW IF EXISTS user_dashboard;

-- =====================================================
-- 4. CREATE COMPREHENSIVE USAGE STATS FUNCTION
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
  -- Count all entities for the user
  SELECT COUNT(*) INTO proj_count FROM projects WHERE "userId" = p_user_id;
  SELECT COUNT(*) INTO task_count FROM tasks WHERE "userId" = p_user_id;
  SELECT COUNT(*) INTO contact_count FROM contacts WHERE "userId" = p_user_id;
  SELECT COUNT(*) INTO company_count FROM companies WHERE "userId" = p_user_id;
  SELECT COUNT(*) INTO note_count FROM notes WHERE "userId" = p_user_id;
  SELECT COUNT(*) INTO email_count FROM emails WHERE "userId" = p_user_id;
  SELECT COUNT(*) INTO integration_count FROM integrations WHERE "userId" = p_user_id;
  SELECT COUNT(*) INTO notification_count FROM notifications WHERE "userId" = p_user_id;
  SELECT COUNT(*) INTO calendar_count FROM calendar_events WHERE "userId" = p_user_id;
  SELECT COUNT(*) INTO team_count FROM teams WHERE "userId" = p_user_id OR "ownerId" = p_user_id;
  SELECT COUNT(*) INTO ai_total_count FROM ai_requests WHERE "userId" = p_user_id;
  
  -- Count AI requests this month
  SELECT COUNT(*) INTO ai_month_count 
  FROM ai_requests 
  WHERE "userId" = p_user_id 
    AND "createdAt" >= DATE_TRUNC('month', CURRENT_DATE);
  
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
    0::BIGINT as storage_used, -- Placeholder for future implementation
    CURRENT_TIMESTAMP as calculated_at;
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. CREATE COMPREHENSIVE USER DASHBOARD VIEW
-- =====================================================

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
    
    -- Comprehensive usage counts
    COALESCE((SELECT COUNT(*)::INTEGER FROM projects WHERE "userId" = p.user_id), 0) as projects_count,
    COALESCE((SELECT COUNT(*)::INTEGER FROM tasks WHERE "userId" = p.user_id), 0) as tasks_count,
    COALESCE((SELECT COUNT(*)::INTEGER FROM contacts WHERE "userId" = p.user_id), 0) as contacts_count,
    COALESCE((SELECT COUNT(*)::INTEGER FROM companies WHERE "userId" = p.user_id), 0) as companies_count,
    COALESCE((SELECT COUNT(*)::INTEGER FROM notes WHERE "userId" = p.user_id), 0) as notes_count,
    COALESCE((SELECT COUNT(*)::INTEGER FROM emails WHERE "userId" = p.user_id), 0) as emails_count,
    COALESCE((SELECT COUNT(*)::INTEGER FROM integrations WHERE "userId" = p.user_id), 0) as integrations_count,
    COALESCE((SELECT COUNT(*)::INTEGER FROM notifications WHERE "userId" = p.user_id), 0) as notifications_count,
    COALESCE((SELECT COUNT(*)::INTEGER FROM calendar_events WHERE "userId" = p.user_id), 0) as calendar_events_count,
    COALESCE((SELECT COUNT(*)::INTEGER FROM teams WHERE "userId" = p.user_id OR "ownerId" = p.user_id), 0) as teams_count,
    
    -- AI requests this month
    COALESCE((SELECT COUNT(*)::INTEGER FROM ai_requests 
              WHERE "userId" = p.user_id 
                AND "createdAt" >= DATE_TRUNC('month', CURRENT_DATE)), 0) as ai_requests_this_month,
    
    -- Subscription and plan info
    p.subscription_status,
    p.onboarding_complete,
    p.created_at,
    p.updated_at

FROM profiles p;

-- =====================================================
-- 6. CREATE ADVANCED ANALYTICS FUNCTION
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
  emails_sent INTEGER,
  ai_requests INTEGER,
  calendar_events INTEGER
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
    COALESCE((SELECT COUNT(*)::INTEGER FROM emails WHERE "userId" = p_user_id AND "sentAt"::DATE = ds.date), 0) as emails_sent,
    COALESCE((SELECT COUNT(*)::INTEGER FROM ai_requests WHERE "userId" = p_user_id AND "createdAt"::DATE = ds.date), 0) as ai_requests,
    COALESCE((SELECT COUNT(*)::INTEGER FROM calendar_events WHERE "userId" = p_user_id AND "createdAt"::DATE = ds.date), 0) as calendar_events
  FROM date_series ds
  ORDER BY ds.date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================

-- Grant access to tables
GRANT SELECT, INSERT, UPDATE, DELETE ON companies TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notes TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON emails TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON integrations TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON calendar_events TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON teams TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_requests TO anon, authenticated;

-- Grant access to functions and views
GRANT EXECUTE ON FUNCTION get_usage_stats(UUID, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_analytics(UUID, INTEGER) TO anon, authenticated;
GRANT SELECT ON user_dashboard TO anon, authenticated;

-- =====================================================
-- 8. ADD HELPFUL COMMENTS
-- =====================================================

COMMENT ON TABLE companies IS 'Companies and organizations managed by users';
COMMENT ON TABLE notes IS 'User notes and knowledge base entries';
COMMENT ON TABLE emails IS 'Email communications and templates';
COMMENT ON TABLE integrations IS 'Third-party service integrations';
COMMENT ON TABLE notifications IS 'System and user notifications';
COMMENT ON TABLE calendar_events IS 'Calendar events and scheduling';
COMMENT ON TABLE teams IS 'Team memberships and collaboration';
COMMENT ON TABLE ai_requests IS 'AI assistant usage tracking';

COMMENT ON FUNCTION get_usage_stats(UUID, UUID) IS 'Returns comprehensive usage statistics for all user data';
COMMENT ON FUNCTION get_user_analytics(UUID, INTEGER) IS 'Returns detailed time-series analytics for dashboard charts';
COMMENT ON VIEW user_dashboard IS 'Complete dashboard view with real-time counts from all user tables';
