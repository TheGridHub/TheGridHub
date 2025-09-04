import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateUser } from '@/lib/user'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await getOrCreateUser(user)

    const { data: integration } = await supabase
      .from('integrations')
      .select('accessToken')
      .eq('userId', dbUser?.id)
      .eq('type', 'google')
      .eq('status', 'connected')
      .maybeSingle()
    if (!integration) return NextResponse.json({ error: 'Google not connected' }, { status: 404 })

    const accessToken = (integration as any).accessToken as string

    const event = {
      summary: 'TheGridHub: Test Event ✅',
      description: 'This is a test calendar event created by TheGridHub.',
      start: { dateTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(), timeZone: 'UTC' },
      end: { dateTime: new Date(Date.now() + 65 * 60 * 1000).toISOString(), timeZone: 'UTC' }
    }

    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: 'Failed to create event', details: err }, { status: 500 })
    }

    await supabase
      .from('integrations')
      .update({ lastSync: new Date().toISOString() })
      .eq('type', 'google')
      .eq('accessToken', accessToken)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Google test calendar error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

