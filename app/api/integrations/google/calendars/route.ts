import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { maybeRefreshGoogleToken } from '@/lib/integrations/tokens'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: appUser } = await supabase
      .from('users')
      .select('id')
      .eq('supabaseId', user.id)
      .maybeSingle()
    if (!appUser?.id) return NextResponse.json({ error: 'User not found' }, { status: 400 })

    const { data: integ } = await supabase
      .from('integrations')
      .select('id, accessToken, refreshToken, expiresAt')
      .eq('userId', appUser.id)
      .eq('type', 'google')
      .eq('status', 'connected')
      .maybeSingle()
    if (!integ) return NextResponse.json({ error: 'Google not connected' }, { status: 400 })

    const refreshed = await maybeRefreshGoogleToken({
      accessToken: (integ as any).accessToken,
      refreshToken: (integ as any).refreshToken,
      expiresAt: (integ as any).expiresAt || null,
    })

    if (refreshed.accessToken !== (integ as any).accessToken || refreshed.expiresAt !== (integ as any).expiresAt) {
      await supabase
        .from('integrations')
        .update({ accessToken: refreshed.accessToken, expiresAt: refreshed.expiresAt })
        .eq('id', (integ as any).id)
    }

    const res = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers: { Authorization: `Bearer ${refreshed.accessToken}` }
    })
    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: 'Failed to list calendars', details: data }, { status: 500 })

    const calendars = (data.items || []).map((c: any) => ({ id: c.id, summary: c.summary }))
    return NextResponse.json({ calendars })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to list calendars' }, { status: 500 })
  }
}

