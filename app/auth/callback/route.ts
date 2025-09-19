import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectParam = requestUrl.searchParams.get('redirect') || '/dashboard'

  // Exchange the code for a session
  const supabase = createClient()
  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Get the authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Ensure a users row exists (service role bypasses RLS)
  const service = createServiceClient()

  let internalUserId: string | null = null
  try {
    const byId = await service
      .from('users')
      .select('id')
      .eq('supabaseId', user.id)
      .maybeSingle()
    internalUserId = byId.data?.id || null

    if (!internalUserId) {
      const email = user.email || null
      if (email) {
        const byEmail = await service
          .from('users')
          .select('id')
          .eq('email', email)
          .maybeSingle()
        if (byEmail.data?.id) {
          const updated = await service
            .from('users')
            .update({ supabaseId: user.id })
            .eq('id', byEmail.data.id)
            .select('id')
            .single()
          internalUserId = updated.data?.id || null
        }
      }
    }

    if (!internalUserId) {
      const md: any = user.user_metadata || {}
      const name = md.full_name || md.first_name || (user.email ? user.email.split('@')[0] : 'User')
      const avatar = md.avatar_url || (user.email ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D9488&color=fff` : null)
      const created = await service
        .from('users')
        .insert({ supabaseId: user.id, email: user.email, name, avatar })
        .select('id')
        .single()
      internalUserId = created.data?.id || null
    }
  } catch {}

  // Ensure a profiles row exists for the Supabase auth user (used by middleware and onboarding)
  try {
    const prof = await service
      .from('profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!prof.data?.user_id) {
      await service
        .from('profiles')
        .insert({ user_id: user.id, plan: 'free', onboarding_complete: false, subscription_status: 'pending' })
    }
  } catch {}

  // Route based on profiles.onboarding_complete
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_complete')
      .eq('user_id', user.id)
      .maybeSingle()

    const done = !!profile?.onboarding_complete
    // If onboarding is done, respect redirect (or send to dashboard). Otherwise go to onboarding.
    const dest = done ? (redirectParam || '/dashboard') : '/onboarding'
    return NextResponse.redirect(new URL(dest, request.url))
  } catch {
    // On error, default to onboarding to be safe
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }
}
