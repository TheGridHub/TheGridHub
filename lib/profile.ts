import { createClient as createServerClient } from '@/lib/supabase/server'

export type Profile = {
  user_id: string
  plan: 'free' | 'pro'
  onboarding_complete: boolean
  subscription_status: 'active' | 'pending' | 'canceled'
}

// Server-side helpers (for middleware/API only)
export async function getProfileServer() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, profile: null }
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()
  return { user, profile: profile as Profile | null }
}
