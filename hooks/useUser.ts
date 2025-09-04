'use client'

import { useSupabase } from '@/components/providers/SupabaseProvider'

export function useUser() {
  const { user, loading } = useSupabase()

  return {
    user: user ? {
      id: user.id,
      email: user.email,
      firstName: user.user_metadata?.first_name || user.email?.split('@')[0],
      lastName: user.user_metadata?.last_name,
      fullName: user.user_metadata?.full_name || user.email,
      imageUrl: user.user_metadata?.avatar_url,
      // Add other Clerk-compatible fields
      primaryEmailAddress: {
        emailAddress: user.email
      }
    } : null,
    isLoaded: !loading,
    isSignedIn: !!user,
  }
}
