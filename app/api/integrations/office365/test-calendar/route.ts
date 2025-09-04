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
      .select('accessToken, userEmail')
      .eq('userId', dbUser?.id)
      .eq('type', 'office365')
      .eq('status', 'connected')
      .maybeSingle()
    if (!integration) return NextResponse.json({ error: 'Office365 not connected' }, { status: 404 })

    const accessToken = (integration as any).accessToken as string
    const recipient = (integration as any).userEmail
    if (!recipient) return NextResponse.json({ error: 'Missing userEmail on integration' }, { status: 400 })

    const start = new Date(Date.now() + 5 * 60 * 1000).toISOString()
    const end = new Date(Date.now() + 65 * 60 * 1000).toISOString()

    const event = {
      subject: 'TheGridHub: Test Event ✅',
      start: { dateTime: start, timeZone: 'UTC' },
      end: { dateTime: end, timeZone: 'UTC' },
      body: { contentType: 'Text', content: 'This is a test calendar event from TheGridHub.' }
    }

    const res = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(recipient)}/events`, {
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
      .eq('type', 'office365')
      .eq('userEmail', recipient)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Office365 test calendar error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

