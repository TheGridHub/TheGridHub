import { createBrowserClient } from '@supabase/ssr'

// Create a single browser client instance and reuse it across renders/components.
// Recreating the client causes new auth subscriptions and repeated network calls.
let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY!
    )
  }
  return browserClient
}
