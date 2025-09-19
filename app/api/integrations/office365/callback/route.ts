import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    if (!code) return NextResponse.redirect(new URL('/dashboard/settings', request.url))

    const tenant = process.env.MICROSOFT_TENANT_ID || 'common'
    const clientId = process.env.MICROSOFT_CLIENT_ID!
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET!
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/office365/callback`

    // Exchange code
    const tokenRes = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    })
    const tokenData = await tokenRes.json()
    if (!tokenRes.ok) throw new Error(tokenData.error_description || 'Office365 token exchange failed')

    const accessToken = tokenData.access_token as string
    const refreshToken = (tokenData.refresh_token || '') as string
    const expiresIn = Number(tokenData.expires_in || 3600)

    // Get user email
    const meRes = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    const me = await meRes.json()
    const email = me.userPrincipalName || me.mail

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
      type: 'office365',
      name: 'Microsoft 365',
      status: 'connected',
      accessToken,
      refreshToken,
      userEmail: email,
      features: { syncTasksToCalendar: true },
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
    } as any

    // Upsert
    const { data: existing } = await supabase
      .from('integrations')
      .select('id')
      .eq('userId', appUser.id)
      .eq('type', 'office365')
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
    console.error('O365 OAuth callback error:', e)
    return NextResponse.redirect(new URL('/dashboard/settings', request.url))
  }
}

