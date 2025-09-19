-- =============================================
-- TheGridHub Database Schema
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Core Tables
-- =============================================

-- Teams table (represents workspaces/organizations)
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  industry TEXT DEFAULT 'Other',
  size TEXT DEFAULT '1-10',
  owner_id UUID NOT NULL,
  plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'enterprise')),
  settings JSONB DEFAULT '{}',
  branding JSONB DEFAULT '{"primaryColor": "#873bff", "secondaryColor": "#7a35e6"}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table (user profiles with team association)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE, -- References auth.users(id)
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  company TEXT,
  location TEXT,
  website TEXT,
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en-US',
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  team_name TEXT, -- Denormalized for performance
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'enterprise')),
  onboarding_complete BOOLEAN DEFAULT FALSE,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  color TEXT DEFAULT '#873bff',
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  created_by UUID NOT NULL, -- References auth.users(id)
  start_date DATE,
  due_date DATE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  budget DECIMAL(10,2),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done', 'blocked')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  assigned_to UUID, -- References auth.users(id)
  created_by UUID NOT NULL, -- References auth.users(id)
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  estimated_hours INTEGER,
  actual_hours INTEGER,
  tags TEXT[],
  position INTEGER DEFAULT 0, -- For Kanban ordering
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contacts table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company_id UUID,
  job_title TEXT,
  department TEXT,
  notes TEXT,
  tags TEXT[],
  social_links JSONB DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  created_by UUID NOT NULL, -- References auth.users(id)
  last_contacted TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  size TEXT,
  website TEXT,
  logo_url TEXT,
  address JSONB DEFAULT '{}',
  phone TEXT,
  email TEXT,
  social_links JSONB DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  tags TEXT[],
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  created_by UUID NOT NULL, -- References auth.users(id)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Link contacts to companies
ALTER TABLE contacts ADD CONSTRAINT fk_contacts_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;

-- Notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  content_html TEXT DEFAULT '', -- Rich text HTML version
  category TEXT DEFAULT 'general',
  tags TEXT[],
  is_favorite BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  created_by UUID NOT NULL, -- References auth.users(id)
  shared_with UUID[],
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL, -- References auth.users(id)
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'task', 'project', 'team', 'system')),
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members table (for managing team membership)
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- References auth.users(id)
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invited_by UUID, -- References auth.users(id)
  UNIQUE(team_id, user_id)
);

-- =============================================
-- Indexes for Performance
-- =============================================

-- Profiles indexes
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_team_id ON profiles(team_id);
CREATE INDEX idx_profiles_email ON profiles(email);

-- Projects indexes
CREATE INDEX idx_projects_team_id ON projects(team_id);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_status ON projects(status);

-- Tasks indexes
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_team_id ON tasks(team_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_position ON tasks(position);

-- Contacts indexes
CREATE INDEX idx_contacts_team_id ON contacts(team_id);
CREATE INDEX idx_contacts_company_id ON contacts(company_id);
CREATE INDEX idx_contacts_email ON contacts(email);

-- Companies indexes
CREATE INDEX idx_companies_team_id ON companies(team_id);
CREATE INDEX idx_companies_name ON companies(name);

-- Notes indexes
CREATE INDEX idx_notes_team_id ON notes(team_id);
CREATE INDEX idx_notes_created_by ON notes(created_by);
CREATE INDEX idx_notes_project_id ON notes(project_id);
CREATE INDEX idx_notes_task_id ON notes(task_id);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Team members indexes
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Teams policies
CREATE POLICY "Users can view teams they belong to" ON teams
  FOR SELECT USING (
    id IN (
      SELECT team_id FROM profiles WHERE user_id = auth.uid()
      UNION
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners can update their teams" ON teams
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can create teams" ON teams
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Profiles policies
CREATE POLICY "Users can view profiles in their team" ON profiles
  FOR SELECT USING (
    user_id = auth.uid() OR
    team_id IN (
      SELECT team_id FROM profiles WHERE user_id = auth.uid()
      UNION
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Projects policies
CREATE POLICY "Users can view projects in their team" ON projects
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM profiles WHERE user_id = auth.uid()
      UNION
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create projects" ON projects
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT team_id FROM profiles WHERE user_id = auth.uid()
      UNION
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can update projects" ON projects
  FOR UPDATE USING (
    team_id IN (
      SELECT team_id FROM profiles WHERE user_id = auth.uid()
      UNION
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Project creators and team admins can delete projects" ON projects
  FOR DELETE USING (
    created_by = auth.uid() OR
    team_id IN (
      SELECT team_id FROM profiles WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      UNION
      SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Tasks policies
CREATE POLICY "Users can view tasks in their team" ON tasks
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM profiles WHERE user_id = auth.uid()
      UNION
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create tasks" ON tasks
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT team_id FROM profiles WHERE user_id = auth.uid()
      UNION
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can update tasks" ON tasks
  FOR UPDATE USING (
    team_id IN (
      SELECT team_id FROM profiles WHERE user_id = auth.uid()
      UNION
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Task creators and team admins can delete tasks" ON tasks
  FOR DELETE USING (
    created_by = auth.uid() OR
    team_id IN (
      SELECT team_id FROM profiles WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      UNION
      SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Contacts policies
CREATE POLICY "Users can view contacts in their team" ON contacts
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM profiles WHERE user_id = auth.uid()
      UNION
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can manage contacts" ON contacts
  FOR ALL USING (
    team_id IN (
      SELECT team_id FROM profiles WHERE user_id = auth.uid()
      UNION
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

-- Companies policies  
CREATE POLICY "Users can view companies in their team" ON companies
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM profiles WHERE user_id = auth.uid()
      UNION
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can manage companies" ON companies
  FOR ALL USING (
    team_id IN (
      SELECT team_id FROM profiles WHERE user_id = auth.uid()
      UNION
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

-- Notes policies
CREATE POLICY "Users can view notes in their team or shared with them" ON notes
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM profiles WHERE user_id = auth.uid()
      UNION
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    ) OR
    auth.uid() = ANY(shared_with)
  );

CREATE POLICY "Team members can create notes" ON notes
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT team_id FROM profiles WHERE user_id = auth.uid()
      UNION
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Note creators can update their notes" ON notes
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Note creators and team admins can delete notes" ON notes
  FOR DELETE USING (
    created_by = auth.uid() OR
    team_id IN (
      SELECT team_id FROM profiles WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      UNION
      SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true); -- Controlled by application logic

-- Team members policies
CREATE POLICY "Users can view team members of their teams" ON team_members
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM profiles WHERE user_id = auth.uid()
      UNION
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners and admins can manage team members" ON team_members
  FOR ALL USING (
    team_id IN (
      SELECT team_id FROM profiles WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      UNION
      SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- =============================================
-- Functions and Triggers
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all relevant tables
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically set team_name in profiles
CREATE OR REPLACE FUNCTION sync_profile_team_name()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.team_id IS NOT NULL THEN
        SELECT name INTO NEW.team_name FROM teams WHERE id = NEW.team_id;
    ELSE
        NEW.team_name = NULL;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER sync_profile_team_name_trigger 
    BEFORE INSERT OR UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION sync_profile_team_name();

-- Function to create a profile when a user signs up
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (user_id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create profile when user signs up
CREATE TRIGGER create_profile_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_profile_for_user();

-- =============================================
-- Views for Common Queries
-- =============================================

-- View for team statistics
CREATE VIEW team_stats AS
SELECT 
    t.id as team_id,
    t.name as team_name,
    COUNT(DISTINCT p.id) as member_count,
    COUNT(DISTINCT pr.id) as project_count,
    COUNT(DISTINCT ta.id) as task_count,
    COUNT(DISTINCT c.id) as contact_count,
    COUNT(DISTINCT co.id) as company_count,
    COUNT(DISTINCT n.id) as note_count
FROM teams t
LEFT JOIN profiles p ON t.id = p.team_id
LEFT JOIN projects pr ON t.id = pr.team_id
LEFT JOIN tasks ta ON t.id = ta.team_id
LEFT JOIN contacts c ON t.id = c.team_id
LEFT JOIN companies co ON t.id = co.team_id
LEFT JOIN notes n ON t.id = n.team_id
GROUP BY t.id, t.name;

-- View for user dashboard data
CREATE VIEW user_dashboard AS
SELECT 
    p.user_id,
    p.full_name,
    p.team_id,
    p.team_name,
    p.plan_type,
    ts.project_count,
    ts.task_count,
    ts.member_count,
    (SELECT COUNT(*) FROM notifications WHERE user_id = p.user_id AND read = false) as unread_notifications,
    (SELECT COUNT(*) FROM tasks WHERE assigned_to = p.user_id AND status NOT IN ('done', 'completed')) as active_tasks
FROM profiles p
LEFT JOIN team_stats ts ON p.team_id = ts.team_id;

-- =============================================
-- Initial Data
-- =============================================

-- This would be populated during onboarding
-- Example data is not included to keep schema clean
