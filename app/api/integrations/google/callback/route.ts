import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    if (!code) return NextResponse.redirect(new URL('/dashboard/settings', request.url))

    const clientId = process.env.GOOGLE_CLIENT_ID!
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google/callback`

    // Exchange code
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    })
    const tokenData = await tokenRes.json()
    if (!tokenRes.ok) throw new Error(tokenData.error_description || 'Google token exchange failed')

    const accessToken = tokenData.access_token as string
    const refreshToken = (tokenData.refresh_token || '') as string
    const expiresIn = Number(tokenData.expires_in || 3600)

    // Get user email
    const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    const userinfo = await userinfoRes.json()
    const email = userinfo.email as string

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(new URL('/sign-in', request.url))

    // Map to internal user id
    const { data: appUser } = await supabase
      .from('users')
      .select('id')
      .eq('supabaseId', user.id)
      .maybeSingle()

    if (!appUser?.id) return NextResponse.redirect(new URL('/dashboard/settings', request.url))

    const row = {
      userId: appUser.id,
      type: 'google',
      name: 'Google Workspace',
      status: 'connected',
      accessToken,
      refreshToken,
      userEmail: email,
      features: { syncTasksToCalendar: true, defaultCalendarId: 'primary' },
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
    } as any

    // Upsert
    const { data: existing } = await supabase
      .from('integrations')
      .select('id')
      .eq('userId', appUser.id)
      .eq('type', 'google')
      .eq('userEmail', email)
      .maybeSingle()

    if (existing?.id) {
      await supabase
        .from('integrations')
        .update(row)
        .eq('id', existing.id)
    } else {
      await supabase
        .from('integrations')
        .insert(row)
    }

    return NextResponse.redirect(new URL('/dashboard/settings', request.url))
  } catch (e: any) {
    console.error('Google OAuth callback error:', e)
    return NextResponse.redirect(new URL('/dashboard/settings', request.url))
  }
}

