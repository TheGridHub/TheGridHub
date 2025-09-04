import { createClient } from '@/lib/supabase/server'
import type { User as SupabaseAuthUser } from '@supabase/supabase-js'

// Returns a row from the `users` table. Creates it if missing.
export async function getOrCreateUser(supabaseUser: SupabaseAuthUser | null) {
  if (!supabaseUser || !supabaseUser.email) return null

  const supabase = createClient()

  // Try by supabaseId
  let { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('supabaseId', supabaseUser.id)
    .single()

  if (user) return user

  // Fallback: try by email (migration path)
  const byEmail = await supabase
    .from('users')
    .select('*')
    .eq('email', supabaseUser.email)
    .single()

  if (byEmail.data) {
    const updated = await supabase
      .from('users')
      .update({ supabaseId: supabaseUser.id })
      .eq('id', byEmail.data.id)
      .select('*')
      .single()
    return updated.data
  }

  // Create new user
  const metadata: any = supabaseUser.user_metadata || {}
  const name = metadata.full_name || metadata.first_name || supabaseUser.email.split('@')[0]
  const avatar = metadata.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D9488&color=fff`

  const created = await supabase
    .from('users')
    .insert({
      supabaseId: supabaseUser.id,
      email: supabaseUser.email,
      name,
      avatar,
    })
    .select('*')
    .single()

  return created.data
}
