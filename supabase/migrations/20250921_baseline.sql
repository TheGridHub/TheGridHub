-- Baseline migration: consolidated, idempotent schema for TheGridHub
-- Safe to run on live DB (IF EXISTS/IF NOT EXISTS, guarded DO blocks)
-- Includes onboarding, settings, dashboard, and billing primitives

begin;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- PROFILES (core user settings, onboarding, plan)
CREATE TABLE IF NOT EXISTS profiles (
  user_id uuid PRIMARY KEY,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free','pro')),
  onboarding_complete boolean NOT NULL DEFAULT false,
  subscription_status text NOT NULL DEFAULT 'pending' CHECK (subscription_status IN ('active','pending','canceled')),
  team_name text,
  preferences jsonb DEFAULT '{}'::jsonb,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema='public' AND table_name='profiles' AND constraint_type='FOREIGN KEY'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema='auth' AND table_name='users'
  ) THEN
    BEGIN
      ALTER TABLE profiles
        ADD CONSTRAINT profiles_user_fk FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public._touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DO $$ BEGIN
  BEGIN
    CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION public._touch_updated_at();
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  DROP POLICY IF EXISTS profiles_select_own ON profiles;
  DROP POLICY IF EXISTS profiles_insert_own ON profiles;
  DROP POLICY IF EXISTS profiles_update_own ON profiles;
  CREATE POLICY profiles_select_own ON profiles FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY profiles_insert_own ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (auth.uid() = user_id);
END $$;

CREATE INDEX IF NOT EXISTS profiles_user_idx ON profiles(user_id);
CREATE INDEX IF NOT EXISTS profiles_plan_idx ON profiles(plan);

-- CORE APP ENTITIES
CREATE TABLE IF NOT EXISTS projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  status text DEFAULT 'active',
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid,
  title text NOT NULL,
  description text,
  status text DEFAULT 'open',
  priority text,
  due_date timestamptz,
  completed_at timestamptz,
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  email text,
  phone text,
  status text DEFAULT 'active',
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS companies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  industry text,
  size text,
  website text,
  phone text,
  email text,
  address jsonb,
  status text DEFAULT 'active' CHECK (status IN ('active','inactive','prospect','client')),
  notes text,
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  category text,
  tags text[],
  "isPrivate" boolean DEFAULT false,
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS emails (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  "fromEmail" text NOT NULL,
  "toEmail" text NOT NULL,
  "ccEmails" text[],
  "bccEmails" text[],
  body text,
  "isRead" boolean DEFAULT false,
  "isImportant" boolean DEFAULT false,
  "sentAt" timestamptz DEFAULT now(),
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS integrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL,
  status text DEFAULT 'disconnected',
  config jsonb DEFAULT '{}'::jsonb,
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text,
  type text DEFAULT 'info' CHECK (type IN ('info','success','warning','error')),
  "isRead" boolean DEFAULT false,
  "actionUrl" text,
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS calendar_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  "startTime" timestamptz NOT NULL,
  "endTime" timestamptz NOT NULL,
  "allDay" boolean DEFAULT false,
  location text,
  "attendeeEmails" text[],
  "reminderMinutes" int DEFAULT 15,
  "isRecurring" boolean DEFAULT false,
  "recurrenceRule" text,
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teams (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "ownerId" uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "userId" uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  "memberCount" int DEFAULT 1,
  settings jsonb DEFAULT '{}'::jsonb,
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  response text,
  model text DEFAULT 'gpt-3.5-turbo',
  "tokenCount" int DEFAULT 0,
  "costInCents" int DEFAULT 0,
  "requestType" text DEFAULT 'chat',
  "createdAt" timestamptz DEFAULT now(),
  "processingTime" int DEFAULT 0
);

-- BILLING TABLES (simple but functional)
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'inactive', -- inactive|active|canceled|past_due
  price_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_cents int NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL DEFAULT 'succeeded',
  stripe_payment_intent text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id text PRIMARY KEY,
  type text,
  payload jsonb,
  status text DEFAULT 'processed',
  received_at timestamptz DEFAULT now()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_projects_user ON projects("userId");
CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks("userId");
CREATE INDEX IF NOT EXISTS idx_contacts_user ON contacts("userId");
CREATE INDEX IF NOT EXISTS idx_companies_user ON companies("userId");
CREATE INDEX IF NOT EXISTS idx_notes_user ON notes("userId");
CREATE INDEX IF NOT EXISTS idx_emails_user ON emails("userId");
CREATE INDEX IF NOT EXISTS idx_integrations_user ON integrations("userId");
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications("userId");
CREATE INDEX IF NOT EXISTS idx_calendar_user ON calendar_events("userId");
CREATE INDEX IF NOT EXISTS idx_teams_user ON teams("userId");
CREATE INDEX IF NOT EXISTS idx_ai_user ON ai_requests("userId");
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);

-- RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES (owner can manage)
DO $$ BEGIN
  CREATE POLICY IF NOT EXISTS "own_projects" ON projects FOR ALL USING (auth.uid() = "userId");
  CREATE POLICY IF NOT EXISTS "own_tasks" ON tasks FOR ALL USING (auth.uid() = "userId");
  CREATE POLICY IF NOT EXISTS "own_contacts" ON contacts FOR ALL USING (auth.uid() = "userId");
  CREATE POLICY IF NOT EXISTS "own_companies" ON companies FOR ALL USING (auth.uid() = "userId");
  CREATE POLICY IF NOT EXISTS "own_notes" ON notes FOR ALL USING (auth.uid() = "userId");
  CREATE POLICY IF NOT EXISTS "own_emails" ON emails FOR ALL USING (auth.uid() = "userId");
  CREATE POLICY IF NOT EXISTS "own_integrations" ON integrations FOR ALL USING (auth.uid() = "userId");
  CREATE POLICY IF NOT EXISTS "own_notifications" ON notifications FOR ALL USING (auth.uid() = "userId");
  CREATE POLICY IF NOT EXISTS "own_calendar_events" ON calendar_events FOR ALL USING (auth.uid() = "userId");
  CREATE POLICY IF NOT EXISTS "own_teams" ON teams FOR ALL USING (auth.uid() = "ownerId" OR auth.uid() = "userId");
  CREATE POLICY IF NOT EXISTS "own_ai_requests" ON ai_requests FOR ALL USING (auth.uid() = "userId");
  CREATE POLICY IF NOT EXISTS "own_subscriptions" ON subscriptions FOR ALL USING (auth.uid() = user_id);
  CREATE POLICY IF NOT EXISTS "own_payments" ON payments FOR SELECT USING (auth.uid() = user_id);
END $$;

-- DASHBOARD FUNCTION + VIEW
DROP FUNCTION IF EXISTS get_usage_stats(UUID, UUID);
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
  BEGIN SELECT COUNT(*) INTO ai_month_count FROM ai_requests WHERE "userId" = p_user_id AND "createdAt" >= DATE_TRUNC('month', CURRENT_DATE); EXCEPTION WHEN OTHERS THEN ai_month_count := 0; END;
  RETURN QUERY SELECT proj_count, task_count, contact_count, company_count, note_count, email_count, integration_count, notification_count, calendar_count, team_count, ai_total_count, ai_month_count, 0::BIGINT, CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP VIEW IF EXISTS user_dashboard;
CREATE VIEW user_dashboard AS
SELECT 
  p.user_id,
  COALESCE((SELECT raw_user_meta_data->>'first_name' FROM auth.users WHERE id = p.user_id), (SELECT SPLIT_PART(raw_user_meta_data->>'full_name',' ',1) FROM auth.users WHERE id = p.user_id), (SELECT SPLIT_PART(email,'@',1) FROM auth.users WHERE id = p.user_id), 'User') AS first_name,
  COALESCE((SELECT raw_user_meta_data->>'last_name' FROM auth.users WHERE id = p.user_id), (SELECT CASE WHEN raw_user_meta_data->>'full_name' LIKE '% %' THEN TRIM(SUBSTRING(raw_user_meta_data->>'full_name' FROM POSITION(' ' IN raw_user_meta_data->>'full_name')+1)) ELSE '' END FROM auth.users WHERE id = p.user_id), '') AS last_name,
  (SELECT email FROM auth.users WHERE id = p.user_id) AS email,
  COALESCE(p.avatar_url, (SELECT raw_user_meta_data->>'avatar_url' FROM auth.users WHERE id = p.user_id), (SELECT raw_user_meta_data->>'picture' FROM auth.users WHERE id = p.user_id)) AS avatar_url,
  p.plan AS plan_type,
  p.user_id AS workspace_id,
  COALESCE(p.team_name, 'My Workspace') AS workspace_name,
  COALESCE(p.team_name, 'My Workspace') AS workspace_display_name,
  COALESCE(p.preferences, '{}'::jsonb) AS workspace_settings,
  COALESCE((SELECT COUNT(*)::int FROM projects WHERE "userId" = p.user_id),0) AS projects_count,
  COALESCE((SELECT COUNT(*)::int FROM tasks WHERE "userId" = p.user_id),0) AS tasks_count,
  COALESCE((SELECT COUNT(*)::int FROM contacts WHERE "userId" = p.user_id),0) AS contacts_count,
  COALESCE((SELECT COUNT(*)::int FROM companies WHERE "userId" = p.user_id),0) AS companies_count,
  COALESCE((SELECT COUNT(*)::int FROM notes WHERE "userId" = p.user_id),0) AS notes_count,
  COALESCE((SELECT COUNT(*)::int FROM emails WHERE "userId" = p.user_id),0) AS emails_count,
  COALESCE((SELECT COUNT(*)::int FROM integrations WHERE "userId" = p.user_id),0) AS integrations_count,
  COALESCE((SELECT COUNT(*)::int FROM notifications WHERE "userId" = p.user_id),0) AS notifications_count,
  COALESCE((SELECT COUNT(*)::int FROM calendar_events WHERE "userId" = p.user_id),0) AS calendar_events_count,
  COALESCE((SELECT COUNT(*)::int FROM teams WHERE "userId" = p.user_id OR "ownerId" = p.user_id),0) AS teams_count,
  COALESCE((SELECT COUNT(*)::int FROM ai_requests WHERE "userId" = p.user_id AND "createdAt" >= DATE_TRUNC('month', CURRENT_DATE)),0) AS ai_requests_this_month,
  p.subscription_status,
  p.onboarding_complete,
  p.created_at,
  p.updated_at
FROM profiles p;

GRANT EXECUTE ON FUNCTION get_usage_stats(UUID, UUID) TO anon, authenticated;
GRANT SELECT ON user_dashboard TO anon, authenticated;

commit;
