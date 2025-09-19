'use client'

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useUserProfile } from './useUserProfile'
import toast from 'react-hot-toast'

export function useWorkspace() {
  const { profile } = useUserProfile()
  const queryClient = useQueryClient()
  const supabase = createClient()

  // Fetch team/workspace data
  const {
    data: workspace,
    isLoading,
    error
  } = useQuery({
    queryKey: ['workspace', profile?.team_id],
    queryFn: async () => {
      if (!profile?.team_id) {
        // Return personal workspace
        return {
          id: profile?.user_id || '',
          name: 'Personal Workspace',
          owner_id: profile?.user_id || '',
          plan_type: profile?.plan_type || 'free',
          created_at: new Date().toISOString(),
          member_count: 1,
          project_count: 0,
          task_count: 0,
          storage_used: 0
        }
      }

      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', profile.team_id)
        .single()

      if (teamError) throw teamError

      // Get team stats
      const { data: stats } = await supabase
        .from('team_stats')
        .select('*')
        .eq('team_id', profile.team_id)
        .single()

      return {
        ...team,
        member_count: stats?.member_count || 0,
        project_count: stats?.project_count || 0,
        task_count: stats?.task_count || 0,
        storage_used: 0 // TODO: Calculate from storage
      }
    },
    enabled: !!profile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Update workspace name mutation
  const updateWorkspaceNameMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!workspace) throw new Error('No workspace to update')
      if (!profile) throw new Error('No profile found')

      if (workspace.id === profile.user_id) {
        // Personal workspace - update profile team_name
        const { error } = await supabase
          .from('profiles')
          .update({ team_name: name })
          .eq('user_id', profile.user_id)
        
        if (error) throw error
      } else {
        // Team workspace - update team name
        const { error } = await supabase
          .from('teams')
          .update({ name })
          .eq('id', workspace.id)
        
        if (error) throw error
      }
      
      return { ...workspace, name }
    },
    onSuccess: (updatedWorkspace) => {
      queryClient.setQueryData(['workspace', profile?.team_id], updatedWorkspace)
      toast.success('Workspace name updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update workspace name')
    }
  })

  return {
    workspace,
    isLoading,
    error,
    updateWorkspaceName: updateWorkspaceNameMutation.mutate,
    isUpdatingName: updateWorkspaceNameMutation.isPending,
    isPersonalWorkspace: workspace?.member_count === 1,
    isTeamWorkspace: (workspace?.member_count || 0) > 1
  }
}
