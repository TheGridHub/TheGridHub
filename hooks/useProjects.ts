'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useUserProfile } from './useUserProfile'
import toast from 'react-hot-toast'
import { useEffect } from 'react'

export interface Project {
  id: string
  name: string
  description?: string
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  due_date?: string
  workspace_id?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface CreateProjectData {
  name: string
  description?: string
  status?: Project['status']
  priority?: Project['priority']
  due_date?: string
  workspace_id?: string
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  id: string
}

export function useProjects() {
  const { profile } = useUserProfile()
  const queryClient = useQueryClient()
  const supabase = createClient()

  // Fetch projects
  const {
    data: projects = [],
    isLoading,
    error
  } = useQuery<Project[]>({
    queryKey: ['projects', profile?.user_id],
    queryFn: async () => {
      const response = await fetch('/api/projects')
      if (!response.ok) {
        throw new Error('Failed to fetch projects')
      }
      const data = await response.json()
      return data.projects || []
    },
    enabled: !!profile?.user_id,
    staleTime: 1 * 60 * 1000, // 1 minute
  })

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (newProject: CreateProjectData): Promise<Project> => {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create project')
      }
      
      const data = await response.json()
      return data.project
    },
    onMutate: async (newProject) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['projects'] })
      
      // Snapshot previous value
      const previousProjects = queryClient.getQueryData<Project[]>(['projects', profile?.user_id])
      
      // Optimistically update to new value
      const optimisticProject: Project = {
        id: `temp-${Date.now()}`,
        name: newProject.name,
        description: newProject.description,
        status: newProject.status || 'planning',
        priority: newProject.priority || 'medium',
        due_date: newProject.due_date,
        workspace_id: newProject.workspace_id,
        created_by: profile?.user_id || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      queryClient.setQueryData<Project[]>(
        ['projects', profile?.user_id], 
        (old = []) => [optimisticProject, ...old]
      )
      
      return { previousProjects, optimisticProject }
    },
    onSuccess: (createdProject, variables, context) => {
      // Replace optimistic update with real data
      queryClient.setQueryData<Project[]>(
        ['projects', profile?.user_id],
        (old = []) => [createdProject, ...old.filter(p => p.id !== context?.optimisticProject.id)]
      )
      
      // Refresh dashboard data
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
      queryClient.invalidateQueries({ queryKey: ['usage-stats'] })
      
      toast.success('Project created successfully!')
    },
    onError: (error: any, variables, context) => {
      // Revert optimistic update
      if (context?.previousProjects) {
        queryClient.setQueryData(['projects', profile?.user_id], context.previousProjects)
      }
      toast.error(error.message || 'Failed to create project')
    }
  })

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async (updateData: UpdateProjectData): Promise<Project> => {
      const { id, ...updates } = updateData
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update project')
      }
      
      const data = await response.json()
      return data.project
    },
    onMutate: async (updateData) => {
      await queryClient.cancelQueries({ queryKey: ['projects'] })
      
      const previousProjects = queryClient.getQueryData<Project[]>(['projects', profile?.user_id])
      
      // Optimistically update
      queryClient.setQueryData<Project[]>(
        ['projects', profile?.user_id],
        (old = []) => old.map(project => 
          project.id === updateData.id 
            ? { ...project, ...updateData, updated_at: new Date().toISOString() }
            : project
        )
      )
      
      return { previousProjects }
    },
    onSuccess: (updatedProject) => {
      // Update with real data
      queryClient.setQueryData<Project[]>(
        ['projects', profile?.user_id],
        (old = []) => old.map(project => 
          project.id === updatedProject.id ? updatedProject : project
        )
      )
      toast.success('Project updated successfully!')
    },
    onError: (error: any, variables, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(['projects', profile?.user_id], context.previousProjects)
      }
      toast.error(error.message || 'Failed to update project')
    }
  })

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string): Promise<void> => {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete project')
      }
    },
    onMutate: async (projectId) => {
      await queryClient.cancelQueries({ queryKey: ['projects'] })
      
      const previousProjects = queryClient.getQueryData<Project[]>(['projects', profile?.user_id])
      
      // Optimistically remove project
      queryClient.setQueryData<Project[]>(
        ['projects', profile?.user_id],
        (old = []) => old.filter(project => project.id !== projectId)
      )
      
      return { previousProjects }
    },
    onSuccess: () => {
      // Refresh dashboard data
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
      queryClient.invalidateQueries({ queryKey: ['usage-stats'] })
      toast.success('Project deleted successfully!')
    },
    onError: (error: any, variables, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(['projects', profile?.user_id], context.previousProjects)
      }
      toast.error(error.message || 'Failed to delete project')
    }
  })

  // Real-time subscription
  useEffect(() => {
    if (!profile?.user_id) return

    const channel = supabase
      .channel('projects-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'projects',
        filter: `created_by=eq.${profile.user_id}`
      }, (payload) => {
        console.log('Real-time project change:', payload)
        // Invalidate and refetch projects
        queryClient.invalidateQueries({ queryKey: ['projects', profile.user_id] })
        queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
        queryClient.invalidateQueries({ queryKey: ['usage-stats'] })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile?.user_id, queryClient, supabase])

  return {
    projects,
    isLoading,
    error,
    
    // Mutations
    createProject: createProjectMutation.mutate,
    isCreatingProject: createProjectMutation.isPending,
    
    updateProject: updateProjectMutation.mutate,
    isUpdatingProject: updateProjectMutation.isPending,
    
    deleteProject: deleteProjectMutation.mutate,
    isDeletingProject: deleteProjectMutation.isPending,
    
    // Utilities
    getProjectById: (id: string) => projects.find(p => p.id === id),
    getProjectsByStatus: (status: Project['status']) => projects.filter(p => p.status === status),
    
    // Refresh
    refetch: () => queryClient.invalidateQueries({ queryKey: ['projects', profile?.user_id] })
  }
}
