'use client'

import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useUserProfile } from './useUserProfile'
import toast from 'react-hot-toast'

// Types for dashboard data
export interface DashboardData {
  user_id: string
  first_name: string | null
  last_name: string | null
  email: string
  avatar_url: string | null
  workspace_name: string | null
  plan_type: string
  workspace_id: string | null
  workspace_display_name: string | null
  workspace_settings: any
  projects_count: number
  tasks_count: number
  contacts_count: number
  companies_count?: number
  notes_count?: number
  emails_count?: number
  ai_requests_this_month: number
  subscription_status?: string
  onboarding_complete?: boolean
  last_activity?: string
  created_at?: string
  updated_at?: string
}

export interface UsageStats {
  projects_count: number
  tasks_count: number
  contacts_count: number
  companies_count?: number
  notes_count?: number
  emails_count?: number
  integrations_count?: number
  notifications_count?: number
  calendar_events_count?: number
  teams_count?: number
  ai_requests_count: number
  storage_used: number
  calculated_at: string
}

export interface EmptyState {
  title: string
  description: string
  action?: {
    label: string
    href: string
  }
}

export function useDashboardData() {
  const { profile } = useUserProfile()
  const supabase = createClient()
  const queryClient = useQueryClient()

  // Get comprehensive dashboard data with fallbacks
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError
  } = useQuery<DashboardData | null>({
    queryKey: ['dashboard-data', profile?.user_id],
    queryFn: async () => {
      if (!profile?.user_id) return null

      try {
        // First try to get from user_dashboard view
        const { data, error } = await supabase
          .from('user_dashboard')
          .select('*')
          .eq('user_id', profile.user_id)
          .single()

        if (!error && data) {
          return data
        }

        // Fallback: construct dashboard data from profiles table and auth.users
        const [profileResult, userResult] = await Promise.all([
          supabase
            .from('profiles')
            .select(`
              user_id,
              plan,
              team_name,
              preferences,
              subscription_status,
              created_at
            `)
            .eq('user_id', profile.user_id)
            .single(),
          supabase.auth.getUser()
        ])
        
        const { data: profileData, error: profileError } = profileResult
        const userData = userResult.data.user

        if (profileError || !profileData) {
          throw new Error('Unable to load profile data')
        }

        // Get real counts from individual tables
        const countQueries = await Promise.allSettled([
          supabase.from('projects').select('*', { count: 'exact', head: true }).eq('user_id', profile.user_id),
          supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('user_id', profile.user_id),
          supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('user_id', profile.user_id),
        ])

        const projectsCount = countQueries[0].status === 'fulfilled' ? countQueries[0].value.count || 0 : 0
        const tasksCount = countQueries[1].status === 'fulfilled' ? countQueries[1].value.count || 0 : 0
        const contactsCount = countQueries[2].status === 'fulfilled' ? countQueries[2].value.count || 0 : 0

        // Try to get AI requests count for this month
        let aiRequestsThisMonth = 0
        try {
          const currentDate = new Date()
          const firstOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
          const { count: aiCount } = await supabase
            .from('ai_requests')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.user_id)
            .gte('created_at', firstOfMonth.toISOString())
          aiRequestsThisMonth = aiCount || 0
        } catch (aiError) {
          console.warn('Could not fetch AI requests count:', aiError)
        }

        // Create dashboard data with real counts using actual schema
        const firstName = userData?.user_metadata?.first_name || userData?.user_metadata?.full_name?.split(' ')[0] || userData?.email?.split('@')[0] || 'User'
        const lastName = userData?.user_metadata?.last_name || userData?.user_metadata?.full_name?.split(' ').slice(1).join(' ') || ''
        
        const fallbackData: DashboardData = {
          user_id: profileData.user_id,
          first_name: firstName,
          last_name: lastName,
          email: userData?.email || '',
          avatar_url: userData?.user_metadata?.avatar_url || userData?.user_metadata?.picture || null,
          workspace_name: profileData.team_name || null,
          plan_type: profileData.plan || 'free',
          workspace_id: profileData.user_id, // Use user_id as workspace_id
          workspace_display_name: profileData.team_name || `${firstName}'s Workspace`,
          workspace_settings: profileData.preferences || {},
          projects_count: projectsCount,
          tasks_count: tasksCount,
          contacts_count: contactsCount,
          ai_requests_this_month: aiRequestsThisMonth
        }

        return fallbackData
      } catch (error) {
        console.error('Dashboard data error:', error)
        throw error
      }
    },
    enabled: !!profile?.user_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once
  })

  // Get real-time usage stats with fallbacks
  const {
    data: usageStats,
    isLoading: usageLoading,
    error: usageError
  } = useQuery<UsageStats | null>({
    queryKey: ['usage-stats', profile?.user_id, dashboardData?.workspace_id],
    queryFn: async () => {
      if (!profile?.user_id) return null

      try {
        // First try to use the RPC function
        const { data, error } = await supabase
          .rpc('get_usage_stats', {
            p_user_id: profile.user_id,
            p_workspace_id: dashboardData?.workspace_id
          })

        if (!error && data) {
          return data
        }

        // Fallback: calculate usage stats manually from existing data
        const fallbackStats: UsageStats = {
          projects_count: dashboardData?.projects_count || 0,
          tasks_count: dashboardData?.tasks_count || 0,
          contacts_count: dashboardData?.contacts_count || 0,
          ai_requests_count: dashboardData?.ai_requests_this_month || 0,
          storage_used: 0,
          calculated_at: new Date().toISOString()
        }

        return fallbackStats
      } catch (error) {
        console.error('Usage stats error:', error)
        // Return fallback data instead of throwing
        return {
          projects_count: dashboardData?.projects_count || 0,
          tasks_count: dashboardData?.tasks_count || 0,
          contacts_count: dashboardData?.contacts_count || 0,
          ai_requests_count: dashboardData?.ai_requests_this_month || 0,
          storage_used: 0,
          calculated_at: new Date().toISOString()
        }
      }
    },
    enabled: !!profile?.user_id && !!dashboardData,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1, // Only retry once
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: {
      first_name?: string
      last_name?: string
      avatar_url?: string
      workspace_name?: string
      preferences?: any
    }) => {
      if (!profile?.user_id) throw new Error('No user ID')

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', profile.user_id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (updatedProfile) => {
      // Optimistic update
      queryClient.setQueryData(['dashboard-data', profile?.user_id], (old: DashboardData | null) => 
        old ? { ...old, ...updatedProfile } : null
      )
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      toast.success('Profile updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update profile')
    }
  })

  // Update workspace mutation
  const updateWorkspaceMutation = useMutation({
    mutationFn: async (updates: {
      name?: string
      description?: string
      settings?: any
    }) => {
      if (!dashboardData?.workspace_id) throw new Error('No workspace ID')

      const { data, error } = await supabase
        .from('workspaces')
        .update(updates)
        .eq('id', dashboardData.workspace_id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (updatedWorkspace) => {
      // Optimistic update
      queryClient.setQueryData(['dashboard-data', profile?.user_id], (old: DashboardData | null) => 
        old ? { 
          ...old, 
          workspace_display_name: updatedWorkspace.name,
          workspace_settings: updatedWorkspace.settings 
        } : null
      )
      toast.success('Workspace updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update workspace')
    }
  })

  // Helper functions for empty states
  const getEmptyState = (type: 'projects' | 'tasks' | 'contacts' | 'teams'): EmptyState => {
    const states = {
      projects: {
        title: 'No projects yet',
        description: 'Start by creating your first project to organize your work.',
        action: {
          label: 'Create Project',
          href: '/dashboard/projects'
        }
      },
      tasks: {
        title: 'No tasks yet', 
        description: 'Add your first task to get started with productivity tracking.',
        action: {
          label: 'Create Task',
          href: '/dashboard/tasks'
        }
      },
      contacts: {
        title: 'No contacts yet',
        description: 'Add your first contact to start building your network.',
        action: {
          label: 'Add Contact', 
          href: '/dashboard/contacts'
        }
      },
      teams: {
        title: 'No team members yet',
        description: 'Invite your team members here to start collaborating.',
        action: {
          label: 'Invite Team',
          href: '/dashboard/teams'
        }
      }
    }

    return states[type]
  }

  // Get display name for user
  const getDisplayName = () => {
    if (dashboardData?.first_name && dashboardData?.last_name) {
      return `${dashboardData.first_name} ${dashboardData.last_name}`
    }
    if (dashboardData?.first_name) {
      return dashboardData.first_name
    }
    return dashboardData?.email?.split('@')[0] || 'User'
  }

  // Get workspace display name
  const getWorkspaceName = () => {
    return dashboardData?.workspace_display_name || 
           dashboardData?.workspace_name || 
           `${getDisplayName()}'s Workspace`
  }

  // Check if user has any data
  const hasAnyData = () => {
    if (!dashboardData || !usageStats) return false
    return (
      usageStats.projects_count > 0 ||
      usageStats.tasks_count > 0 ||
      usageStats.contacts_count > 0
    )
  }

  // Get plan limits based on plan type (now with unlimited free)
  const getPlanLimits = () => {
    const planType = dashboardData?.plan_type || 'free'
    
    const limits = {
      free: {
        projects: -1, // unlimited
        tasks: -1, // unlimited
        contacts: -1, // unlimited
        team_members: -1, // unlimited
        storage_gb: -1, // unlimited
        ai_requests: -1 // unlimited
      },
      pro: {
        projects: -1, // unlimited
        tasks: -1, // unlimited
        contacts: -1, // unlimited
        team_members: -1, // unlimited
        storage_gb: -1, // unlimited
        ai_requests: -1 // unlimited
      },
      enterprise: {
        projects: -1, // unlimited
        tasks: -1, // unlimited
        contacts: -1, // unlimited
        team_members: -1, // unlimited
        storage_gb: -1, // unlimited
        ai_requests: -1 // unlimited
      }
    }

    return limits[planType]
  }

  // Check if user is approaching limits
  const getUsageWarnings = () => {
    if (!usageStats || !dashboardData) return []
    
    const limits = getPlanLimits()
    const warnings = []

    const checkLimit = (current: number, limit: number, type: string) => {
      if (limit === -1) return // unlimited
      const percentage = (current / limit) * 100
      if (percentage >= 90) {
        warnings.push({
          type,
          current,
          limit,
          percentage,
          message: `You're using ${current}/${limit} ${type} (${Math.round(percentage)}%)`
        })
      }
    }

    checkLimit(usageStats.projects_count, limits.projects, 'projects')
    checkLimit(usageStats.tasks_count, limits.tasks, 'tasks')
    checkLimit(usageStats.contacts_count, limits.contacts, 'contacts')
    checkLimit(usageStats.ai_requests_count, limits.ai_requests, 'AI requests this month')

    return warnings
  }

  return {
    // Data
    dashboardData,
    usageStats,
    
    // Loading states
    isLoading: dashboardLoading || usageLoading,
    dashboardLoading,
    usageLoading,
    
    // Errors
    error: dashboardError || usageError,
    
    // Mutations
    updateProfile: updateProfileMutation.mutate,
    isUpdatingProfile: updateProfileMutation.isPending,
    updateWorkspace: updateWorkspaceMutation.mutate,
    isUpdatingWorkspace: updateWorkspaceMutation.isPending,
    
    // Helper functions
    getEmptyState,
    getDisplayName,
    getWorkspaceName,
    hasAnyData,
    getPlanLimits,
    getUsageWarnings,
    
    // Refresh data
    refresh: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
      queryClient.invalidateQueries({ queryKey: ['usage-stats'] })
    }
  }
}

// Hook for real-time subscriptions
export function useDashboardSubscriptions() {
  const { profile } = useUserProfile()
  const queryClient = useQueryClient()
  const supabase = createClient()

  React.useEffect(() => {
    if (!profile?.user_id) return

    // Subscribe to projects changes
    const projectsSubscription = supabase
      .channel('projects-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'projects',
        filter: `created_by=eq.${profile.user_id}`
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
        queryClient.invalidateQueries({ queryKey: ['usage-stats'] })
      })
      .subscribe()

    // Subscribe to tasks changes
    const tasksSubscription = supabase
      .channel('tasks-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `created_by=eq.${profile.user_id}`
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
        queryClient.invalidateQueries({ queryKey: ['usage-stats'] })
      })
      .subscribe()

    // Subscribe to contacts changes
    const contactsSubscription = supabase
      .channel('contacts-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'contacts',
        filter: `created_by=eq.${profile.user_id}`
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
        queryClient.invalidateQueries({ queryKey: ['usage-stats'] })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(projectsSubscription)
      supabase.removeChannel(tasksSubscription)
      supabase.removeChannel(contactsSubscription)
    }
  }, [profile?.user_id, queryClient, supabase])
}

