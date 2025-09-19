// TypeScript types aligned to Supabase public schema you shared

export type Plan = 'FREE' | 'PRO' | 'TEAM' | 'ENTERPRISE'

export interface UsersRow {
  id: string
  supabaseId: string
  email: string
  name: string | null
  avatar: string | null
  // other columns may exist; we only use these
}

export interface SubscriptionsRow {
  id: string
  userId: string
  stripeSubscriptionId: string | null
  plan: string // 'FREE' | 'PRO' | 'TEAM' | 'ENTERPRISE' (text in DB)
  status: string // e.g. 'active', 'trialing', 'canceled'
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  trialEnd: string | null
  createdAt: string
  updatedAt: string
}

export interface TasksRow {
  id: string
  title: string
  description: string | null
  status: string // 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' (text in DB)
  priority: string // 'LOW' | 'MEDIUM' | 'HIGH'
  progress: number
  dueDate: string | null
  createdAt: string
  updatedAt: string
  userId: string
  projectId: string | null
  jiraIssueKey: string | null
  jiraIssueUrl: string | null
}

export interface ProjectsRow {
  id: string
  name: string
  description: string | null
  color: string
  createdAt: string
  updatedAt: string
  userId: string
  slackDefaultChannelId: string | null
  jiraProjectKey: string | null
}

export interface GoalsRow {
  id: string
  title: string
  description: string | null
  target: number
  current: number
  type: string // 'TASK'
  deadline: string | null
  createdAt: string
  updatedAt: string
  userId: string
}

export interface NotificationsRow {
  id: string
  userId: string
  type: string
  title: string
  message: string
  data: string | null
  read: boolean
  createdAt: string
}

export interface IntegrationsRow {
  id: string
  userId: string
  type: string
  name: string
  status: string // 'connected' etc
  accessToken: string
  refreshToken: string | null
  userEmail: string
  expiresAt: string | null
  connectedAt: string
  lastSync: string | null
  features: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

// Narrow integration shape used by the dashboard UI
export interface IntegrationSummary {
  id?: string
  type: string
  status?: string
  connectedAt?: string | null
  lastSync?: string | null
  userEmail?: string | null
}

export interface TeamMembershipsRow {
  id: string
  userId: string
  role: string // 'owner' | 'admin' | 'member'
  createdAt: string
}

export interface UserOnboardingRow {
  id: string
  userId: string
}

// View: public.user_effective_plan
export interface UserEffectivePlanRow {
  userId: string
  plan: string // we cast to Plan in code
}

// Convenience aliases used in imports
export type TaskRow = TasksRow
export type ProjectRow = ProjectsRow
export type GoalRow = GoalsRow
export type NotificationRow = NotificationsRow

// New CRM/Notes/Analytics tables
export interface CompaniesRow {
  id: string
  userId: string
  name: string
  domain: string | null
  website: string | null
  industry: string | null
  size: string | null
  tags: string[]
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface ContactsRow {
  id: string
  userId: string
  companyId: string | null
  firstName: string | null
  lastName: string | null
  email: string | null
  phone: string | null
  title: string | null
  status: string // 'lead' | 'active' | 'customer' | 'archived'
  tags: string[]
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface NotesRow {
  id: string
  userId: string
  entityType: string // 'contact' | 'company' | 'project' | 'task'
  entityId: string
  content: string
  pinned: boolean
  createdAt: string
  updatedAt: string
}

export interface ActivityEventsRow {
  id: string
  userId: string
  type: string // 'created' | 'updated' | 'deleted' | 'completed' | 'note_added' | ...
  targetType: string // 'project' | 'task' | 'contact' | 'company' | 'note' | ...
  targetId: string | null
  metadata: Record<string, unknown>
  createdAt: string
}

export type CompanyRow = CompaniesRow
export type ContactRow = ContactsRow
export type NoteRow = NotesRow
export type ActivityEventRow = ActivityEventsRow

