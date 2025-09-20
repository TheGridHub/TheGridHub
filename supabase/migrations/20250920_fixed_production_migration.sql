-- Fixed Production Migration - Only creates missing tables and handles existing ones
-- Addresses the status column conflict by checking table existence first

-- =====================================================
-- CREATE MISSING TABLES (only if they don't exist)
-- =====================================================

-- Companies table (seems to be missing based on your errors)
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  industry TEXT,
  size TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  address JSONB,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'prospect', 'client')),
  notes TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Notes table (seems to be missing)
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  category TEXT,
  tags TEXT[],
  "isPrivate" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Emails table (seems to be missing)
CREATE TABLE IF NOT EXISTS emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  "fromEmail" TEXT NOT NULL,
  "toEmail" TEXT NOT NULL,
  "ccEmails" TEXT[],
  "bccEmails" TEXT[],
  body TEXT,
  "isRead" BOOLEAN DEFAULT false,
  "isImportant" BOOLEAN DEFAULT false,
  "sentAt" TIMESTAMPTZ DEFAULT NOW(),
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table (seems to be missing)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  "isRead" BOOLEAN DEFAULT false,
  "actionUrl" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar Events table (seems to be missing)
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  "startTime" TIMESTAMPTZ NOT NULL,
  "endTime" TIMESTAMPTZ NOT NULL,
  "allDay" BOOLEAN DEFAULT false,
  location TEXT,
  "attendeeEmails" TEXT[],
  "reminderMinutes" INTEGER DEFAULT 15,
  "isRecurring" BOOLEAN DEFAULT false,
  "recurrenceRule" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Teams table (seems to be missing)
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "ownerId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "userId" UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  "memberCount" INTEGER DEFAULT 1,
  settings JSONB DEFAULT '{}',
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- AI Requests table (seems to be missing)
CREATE TABLE IF NOT EXISTS ai_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  response TEXT,
  model TEXT DEFAULT 'gpt-3.5-turbo',
  "tokenCount" INTEGER DEFAULT 0,
  "costInCents" INTEGER DEFAULT 0,
  "requestType" TEXT DEFAULT 'chat',
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "processingTime" INTEGER DEFAULT 0
);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Companies indexes
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies("userId");
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies("createdAt");

-- Notes indexes
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes("userId");
CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes("createdAt");

-- Emails indexes
CREATE INDEX IF NOT EXISTS idx_emails_user_id ON emails("userId");
CREATE INDEX IF NOT EXISTS idx_emails_from ON emails("fromEmail");
CREATE INDEX IF NOT EXISTS idx_emails_to ON emails("toEmail");
CREATE INDEX IF NOT EXISTS idx_emails_sent_at ON emails("sentAt");
CREATE INDEX IF NOT EXISTS idx_emails_is_read ON emails("isRead");

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications("userId");
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications("isRead");
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications("createdAt");

-- Calendar events indexes
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events("userId");
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events("startTime");
CREATE INDEX IF NOT EXISTS idx_calendar_events_end_time ON calendar_events("endTime");

-- Teams indexes
CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON teams("ownerId");
CREATE INDEX IF NOT EXISTS idx_teams_user_id ON teams("userId");

-- AI requests indexes
CREATE INDEX IF NOT EXISTS idx_ai_requests_user_id ON ai_requests("userId");
CREATE INDEX IF NOT EXISTS idx_ai_requests_created_at ON ai_requests("createdAt");

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_requests ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS POLICIES
-- =====================================================

-- Companies policies
CREATE POLICY IF NOT EXISTS "Users can manage their own companies" ON companies
    FOR ALL USING (auth.uid() = "userId");

-- Notes policies
CREATE POLICY IF NOT EXISTS "Users can manage their own notes" ON notes
    FOR ALL USING (auth.uid() = "userId");

-- Emails policies
CREATE POLICY IF NOT EXISTS "Users can manage their own emails" ON emails
    FOR ALL USING (auth.uid() = "userId");

-- Notifications policies
CREATE POLICY IF NOT EXISTS "Users can manage their own notifications" ON notifications
    FOR ALL USING (auth.uid() = "userId");

-- Calendar events policies
CREATE POLICY IF NOT EXISTS "Users can manage their own calendar events" ON calendar_events
    FOR ALL USING (auth.uid() = "userId");

-- Teams policies
CREATE POLICY IF NOT EXISTS "Team owners and members can access teams" ON teams
    FOR ALL USING (auth.uid() = "ownerId" OR auth.uid() = "userId");

-- AI requests policies
CREATE POLICY IF NOT EXISTS "Users can manage their own AI requests" ON ai_requests
    FOR ALL USING (auth.uid() = "userId");

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT ALL ON companies TO authenticated;
GRANT ALL ON notes TO authenticated;
GRANT ALL ON emails TO authenticated;
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON calendar_events TO authenticated;
GRANT ALL ON teams TO authenticated;
GRANT ALL ON ai_requests TO authenticated;

-- =====================================================
-- ADD HELPFUL COMMENTS
-- =====================================================

COMMENT ON TABLE companies IS 'Company/client management table';
COMMENT ON TABLE notes IS 'User notes and documentation';
COMMENT ON TABLE emails IS 'Email management and tracking';
COMMENT ON TABLE notifications IS 'User notifications and alerts';
COMMENT ON TABLE calendar_events IS 'Calendar events and scheduling';
COMMENT ON TABLE teams IS 'Team collaboration and membership';
COMMENT ON TABLE ai_requests IS 'AI service usage tracking';
