export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          address: Json
          created_at: string
          created_by: string
          custom_fields: Json
          description: string | null
          email: string | null
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          phone: string | null
          size: string | null
          social_links: Json
          tags: string[] | null
          team_id: string
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: Json
          created_at?: string
          created_by: string
          custom_fields?: Json
          description?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          size?: string | null
          social_links?: Json
          tags?: string[] | null
          team_id: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: Json
          created_at?: string
          created_by?: string
          custom_fields?: Json
          description?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          size?: string | null
          social_links?: Json
          tags?: string[] | null
          team_id?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          }
        ]
      }
      contacts: {
        Row: {
          company_id: string | null
          created_at: string
          created_by: string
          custom_fields: Json
          department: string | null
          email: string | null
          id: string
          job_title: string | null
          last_contacted: string | null
          name: string
          notes: string | null
          phone: string | null
          social_links: Json
          tags: string[] | null
          team_id: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          created_by: string
          custom_fields?: Json
          department?: string | null
          email?: string | null
          id?: string
          job_title?: string | null
          last_contacted?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          social_links?: Json
          tags?: string[] | null
          team_id: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          created_by?: string
          custom_fields?: Json
          department?: string | null
          email?: string | null
          id?: string
          job_title?: string | null
          last_contacted?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          social_links?: Json
          tags?: string[] | null
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contacts_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          }
        ]
      }
      notes: {
        Row: {
          category: string
          content: string
          content_html: string
          created_at: string
          created_by: string
          id: string
          is_favorite: boolean
          is_pinned: boolean
          project_id: string | null
          shared_with: string[] | null
          tags: string[] | null
          task_id: string | null
          team_id: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          category?: string
          content?: string
          content_html?: string
          created_at?: string
          created_by: string
          id?: string
          is_favorite?: boolean
          is_pinned?: boolean
          project_id?: string | null
          shared_with?: string[] | null
          tags?: string[] | null
          task_id?: string | null
          team_id: string
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          category?: string
          content?: string
          content_html?: string
          created_at?: string
          created_by?: string
          id?: string
          is_favorite?: boolean
          is_pinned?: boolean
          project_id?: string | null
          shared_with?: string[] | null
          tags?: string[] | null
          task_id?: string | null
          team_id?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "notes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          category: Database["public"]["Enums"]["notification_category"]
          created_at: string
          expires_at: string | null
          id: string
          message: string
          metadata: Json
          read: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          action_url?: string | null
          category?: Database["public"]["Enums"]["notification_category"]
          created_at?: string
          expires_at?: string | null
          id?: string
          message: string
          metadata?: Json
          read?: boolean
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          action_url?: string | null
          category?: Database["public"]["Enums"]["notification_category"]
          created_at?: string
          expires_at?: string | null
          id?: string
          message?: string
          metadata?: Json
          read?: boolean
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          language: string
          last_active: string
          location: string | null
          onboarding_complete: boolean
          phone: string | null
          plan_type: Database["public"]["Enums"]["plan_type"]
          role: Database["public"]["Enums"]["user_role"]
          team_id: string | null
          team_name: string | null
          theme: Database["public"]["Enums"]["theme"]
          timezone: string
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          language?: string
          last_active?: string
          location?: string | null
          onboarding_complete?: boolean
          phone?: string | null
          plan_type?: Database["public"]["Enums"]["plan_type"]
          role?: Database["public"]["Enums"]["user_role"]
          team_id?: string | null
          team_name?: string | null
          theme?: Database["public"]["Enums"]["theme"]
          timezone?: string
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          language?: string
          last_active?: string
          location?: string | null
          onboarding_complete?: boolean
          phone?: string | null
          plan_type?: Database["public"]["Enums"]["plan_type"]
          role?: Database["public"]["Enums"]["user_role"]
          team_id?: string | null
          team_name?: string | null
          theme?: Database["public"]["Enums"]["theme"]
          timezone?: string
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          }
        ]
      }
      projects: {
        Row: {
          budget: number | null
          color: string
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          name: string
          priority: Database["public"]["Enums"]["priority"]
          progress: number
          settings: Json
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          team_id: string
          updated_at: string
        }
        Insert: {
          budget?: number | null
          color?: string
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          name: string
          priority?: Database["public"]["Enums"]["priority"]
          progress?: number
          settings?: Json
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          team_id: string
          updated_at?: string
        }
        Update: {
          budget?: number | null
          color?: string
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          name?: string
          priority?: Database["public"]["Enums"]["priority"]
          progress?: number
          settings?: Json
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          }
        ]
      }
      tasks: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          parent_task_id: string | null
          position: number
          priority: Database["public"]["Enums"]["priority"]
          project_id: string | null
          status: Database["public"]["Enums"]["task_status"]
          tags: string[] | null
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          parent_task_id?: string | null
          position?: number
          priority?: Database["public"]["Enums"]["priority"]
          project_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          tags?: string[] | null
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          parent_task_id?: string | null
          position?: number
          priority?: Database["public"]["Enums"]["priority"]
          project_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          tags?: string[] | null
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          }
        ]
      }
      team_members: {
        Row: {
          id: string
          invited_by: string | null
          joined_at: string
          role: Database["public"]["Enums"]["user_role"]
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          invited_by?: string | null
          joined_at?: string
          role?: Database["public"]["Enums"]["user_role"]
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          invited_by?: string | null
          joined_at?: string
          role?: Database["public"]["Enums"]["user_role"]
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          }
        ]
      }
      teams: {
        Row: {
          branding: Json
          created_at: string
          description: string | null
          id: string
          industry: string
          logo_url: string | null
          name: string
          owner_id: string
          plan_type: Database["public"]["Enums"]["plan_type"]
          settings: Json
          size: string
          updated_at: string
          website: string | null
        }
        Insert: {
          branding?: Json
          created_at?: string
          description?: string | null
          id?: string
          industry?: string
          logo_url?: string | null
          name: string
          owner_id: string
          plan_type?: Database["public"]["Enums"]["plan_type"]
          settings?: Json
          size?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          branding?: Json
          created_at?: string
          description?: string | null
          id?: string
          industry?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          plan_type?: Database["public"]["Enums"]["plan_type"]
          settings?: Json
          size?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      team_stats: {
        Row: {
          company_count: number | null
          contact_count: number | null
          member_count: number | null
          note_count: number | null
          project_count: number | null
          task_count: number | null
          team_id: string | null
          team_name: string | null
        }
        Relationships: []
      }
      user_dashboard: {
        Row: {
          active_tasks: number | null
          full_name: string | null
          member_count: number | null
          plan_type: Database["public"]["Enums"]["plan_type"] | null
          project_count: number | null
          task_count: number | null
          team_id: string | null
          team_name: string | null
          unread_notifications: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      notification_category: "general" | "task" | "project" | "team" | "system"
      notification_type: "info" | "success" | "warning" | "error"
      plan_type: "free" | "pro" | "enterprise"
      priority: "low" | "medium" | "high" | "urgent"
      project_status: "active" | "archived" | "completed"
      task_status: "todo" | "in_progress" | "review" | "done" | "blocked"
      theme: "light" | "dark" | "system"
      user_role: "owner" | "admin" | "member"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience types for common operations
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Specific table types
export type Team = Tables<'teams'>
export type Profile = Tables<'profiles'>
export type Project = Tables<'projects'>
export type Task = Tables<'tasks'>
export type Contact = Tables<'contacts'>
export type Company = Tables<'companies'>
export type Note = Tables<'notes'>
export type Notification = Tables<'notifications'>
export type TeamMember = Tables<'team_members'>

// Insert types
export type TeamInsert = TablesInsert<'teams'>
export type ProfileInsert = TablesInsert<'profiles'>
export type ProjectInsert = TablesInsert<'projects'>
export type TaskInsert = TablesInsert<'tasks'>
export type ContactInsert = TablesInsert<'contacts'>
export type CompanyInsert = TablesInsert<'companies'>
export type NoteInsert = TablesInsert<'notes'>
export type NotificationInsert = TablesInsert<'notifications'>
export type TeamMemberInsert = TablesInsert<'team_members'>

// Update types
export type TeamUpdate = TablesUpdate<'teams'>
export type ProfileUpdate = TablesUpdate<'profiles'>
export type ProjectUpdate = TablesUpdate<'projects'>
export type TaskUpdate = TablesUpdate<'tasks'>
export type ContactUpdate = TablesUpdate<'contacts'>
export type CompanyUpdate = TablesUpdate<'companies'>
export type NoteUpdate = TablesUpdate<'notes'>
export type NotificationUpdate = TablesUpdate<'notifications'>
export type TeamMemberUpdate = TablesUpdate<'team_members'>

// Enum types
export type PlanType = Enums<'plan_type'>
export type UserRole = Enums<'user_role'>
export type TaskStatus = Enums<'task_status'>
export type ProjectStatus = Enums<'project_status'>
export type Priority = Enums<'priority'>
export type Theme = Enums<'theme'>
export type NotificationType = Enums<'notification_type'>
export type NotificationCategory = Enums<'notification_category'>

// Views
export type TeamStats = Database['public']['Views']['team_stats']['Row']
export type UserDashboard = Database['public']['Views']['user_dashboard']['Row']

// Extended types with relationships
export type ProjectWithTasks = Project & {
  tasks: Task[]
}

export type TaskWithProject = Task & {
  project: Project | null
}

// Extended Profile type with usage tracking fields
export type ProfileWithUsage = Profile & {
  storage_used?: number
  storage_limit?: number
  ai_requests_used?: number
  ai_requests_limit?: number
}

export type ProfileWithTeam = ProfileWithUsage & {
  team: Team | null
}

export type TeamWithMembers = Team & {
  members: (TeamMember & { profile: Profile })[]
}

export type ContactWithCompany = Contact & {
  company: Company | null
}

export type NoteWithRelations = Note & {
  project: Project | null
  task: Task | null
}
