import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'

export type Profile = {
  user_id: string
  plan: 'free' | 'pro'
  onboarding_complete: boolean
  subscription_status: 'active' | 'pending' | 'canceled'
}

// Client-side helpers
export async function getProfileClient() {
  const supabase = createBrowserClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, profile: null }
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()
  return { user, profile: profile as Profile | null }
}

export async function upsertProfileClient(partial: Partial<Profile>) {
  const supabase = createBrowserClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const row = { user_id: user.id, ...partial }
  const { data, error } = await supabase.from('profiles').upsert(row, { onConflict: 'user_id' }).select('*').single()
  if (error) throw error
  return data as Profile
}

export async function setPlanClient(plan: 'free' | 'pro') {
  return upsertProfileClient({ plan })
}

export async function setOnboardingCompleteClient(complete: boolean) {
  return upsertProfileClient({ onboarding_complete: complete })
}

export async function setSubscriptionStatusClient(status: Profile['subscription_status']) {
  return upsertProfileClient({ subscription_status: status })
}

// Server-side helpers (for middleware/API)
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
