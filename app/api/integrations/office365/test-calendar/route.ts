import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { maybeRefreshMsToken } from '@/lib/integrations/tokens'

export async function POST(_req: NextRequest) {
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
      .select('id, accessToken, refreshToken, features, userEmail, expiresAt')
      .eq('userId', appUser.id)
      .eq('type', 'office365')
      .eq('status', 'connected')
      .maybeSingle()
    if (!integ) return NextResponse.json({ error: 'Office365 not connected' }, { status: 400 })

    const refreshed = await maybeRefreshMsToken({
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

    const features = (integ as any).features || {}
    const calendarId = features.defaultCalendarId // allow undefined to use /me/events

    const now = new Date()
    const start = new Date(now.getTime() + 5 * 60000)
    const end = new Date(start.getTime() + 30 * 60000)

    const event = {
      subject: 'TheGridHub Test Event',
      body: { contentType: 'Text', content: 'Created by user test-calendar endpoint' },
      start: { dateTime: start.toISOString(), timeZone: 'UTC' },
      end: { dateTime: end.toISOString(), timeZone: 'UTC' },
    }

    const url = calendarId
      ? `https://graph.microsoft.com/v1.0/me/calendars/${encodeURIComponent(calendarId)}/events`
      : 'https://graph.microsoft.com/v1.0/me/events'

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${refreshed.accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: 'Failed to create event', details: err }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to create test calendar event' }, { status: 500 })
  }
}
