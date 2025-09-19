'use client'

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { ProfileWithUsage, ProfileUpdate } from '@/lib/types/database'
import toast from 'react-hot-toast'

export function useUserProfile() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  // Fetch user profile with usage data
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

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) throw error
      
      // Add default usage limits based on plan type
      if (data) {
        const limits = {
          free: { storage_limit: 1073741824, ai_requests_limit: 10 }, // 1GB, 10 requests
          pro: { storage_limit: 10737418240, ai_requests_limit: 100 }, // 10GB, 100 requests
          enterprise: { storage_limit: 107374182400, ai_requests_limit: 1000 } // 100GB, 1000 requests
        }
        
        const planLimits = limits[data.plan_type] || limits.free
        return {
          ...data,
          storage_used: 0, // TODO: Calculate from actual usage
          storage_limit: planLimits.storage_limit,
          ai_requests_used: 0, // TODO: Calculate from actual usage
          ai_requests_limit: planLimits.ai_requests_limit
        }
      }
      
      return data
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
    isProPlan: profile?.plan_type === 'pro' || profile?.plan_type === 'enterprise'
  }
}
