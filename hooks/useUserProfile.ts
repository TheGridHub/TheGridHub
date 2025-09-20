'use client'

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { ProfileWithUsage, ProfileUpdate } from '@/lib/types/database'
import toast from 'react-hot-toast'

export function useUserProfile() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  // Fetch user profile with comprehensive data from dashboard view
  const {
    data: profile,
    isLoading,
    error,
    refetch
  } = useQuery<ProfileWithUsage | null>({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      try {
        // First try to get comprehensive data from user_dashboard view
        const { data, error } = await supabase
          .from('user_dashboard')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (!error && data) {
          // Return comprehensive profile data with unlimited limits
          return {
            ...data,
            user_id: data.user_id,
            id: data.user_id,
            storage_used: 0,
            storage_limit: -1, // Unlimited
            ai_requests_used: data.ai_requests_this_month || 0,
            ai_requests_limit: -1, // Unlimited
            // Map plan to plan_type for backward compatibility
            plan_type: data.plan_type || 'free'
          }
        }
        
        // Fallback: get basic profile data and user info separately
        const [profileResult, userResult] = await Promise.all([
          supabase.from('profiles').select('*').eq('user_id', user.id).single(),
          supabase.auth.getUser()
        ])
        
        const profileData = profileResult.data
        const userData = userResult.data.user
        
        if (profileData) {
          return {
            ...profileData,
            id: profileData.user_id,
            // Get user info from auth
            first_name: userData?.user_metadata?.first_name || userData?.user_metadata?.full_name?.split(' ')[0] || userData?.email?.split('@')[0] || 'User',
            last_name: userData?.user_metadata?.last_name || userData?.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
            email: userData?.email || '',
            avatar_url: userData?.user_metadata?.avatar_url || userData?.user_metadata?.picture || null,
            plan_type: profileData.plan || 'free',
            storage_used: 0,
            storage_limit: -1, // Unlimited
            ai_requests_used: 0,
            ai_requests_limit: -1, // Unlimited
            projects_count: 0,
            tasks_count: 0,
            contacts_count: 0,
            ai_requests_this_month: 0
          }
        }
      } catch (error) {
        console.error('Profile fetch error:', error)
        throw error
      }
      
      return null
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: ProfileUpdate) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (updatedProfile) => {
      // Update the cache
      queryClient.setQueryData(['user-profile'], updatedProfile)
      toast.success('Profile updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update profile')
    }
  })

  // Complete onboarding mutation
  const completeOnboardingMutation = useMutation({
    mutationFn: async (teamId?: string) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const updates: ProfileUpdate = {
        onboarding_complete: true,
        ...(teamId && { team_id: teamId })
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['user-profile'], updatedProfile)
      toast.success('Welcome to TheGridHub!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to complete onboarding')
    }
  })

  return {
    profile,
    isLoading,
    error,
    refetch,
    updateProfile: updateProfileMutation.mutate,
    isUpdatingProfile: updateProfileMutation.isPending,
    completeOnboarding: completeOnboardingMutation.mutate,
    isCompletingOnboarding: completeOnboardingMutation.isPending,
    isFreePlan: profile?.plan_type === 'free',
    isProPlan: profile?.plan_type !== 'free',
    planType: profile?.plan_type || 'free'
  }
}
