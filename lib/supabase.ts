import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Supabase helper that prefers the new 2025 key scheme and falls back to legacy
// Never import SUPABASE_SECRET_KEY into client bundles.

const getEnv = (key: string) => process.env[key]

// Browser (safe to expose)
export function createBrowserSupabase(): SupabaseClient {
  const url = getEnv('NEXT_PUBLIC_SUPABASE_URL') || getEnv('SUPABASE_URL')
  const key = getEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') || getEnv('SUPABASE_ANON_KEY')
  if (!url || !key) throw new Error('Supabase publishable env not configured')
  return createClient(url, key)
}

// Server-side only (secret)
export function createServerSupabase(): SupabaseClient {
  const url = getEnv('NEXT_PUBLIC_SUPABASE_URL') || getEnv('SUPABASE_URL')
  const secret = getEnv('SUPABASE_SECRET_KEY') || getEnv('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !secret) throw new Error('Supabase secret env not configured')
  return createClient(url, secret)
}

