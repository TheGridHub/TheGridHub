import { NextRequest, NextResponse } from 'next/server'
import { ensureInternalAuth } from '@/lib/internal-admin/auth'
import { canPerform } from '@/lib/internal-admin/permissions'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const auth = ensureInternalAuth()
    if (!canPerform(auth.role, 'integrations.google.test')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json().catch(()=>({}))
    const userEmail = String(body.userEmail || '').trim()
    if (!userEmail) return NextResponse.json({ error: 'Missing userEmail' }, { status: 400 })

    const supa = createServiceClient()
    const { data: user } = await supa.from('users').select('id').eq('email', userEmail).maybeSingle()
    if (!user?.id) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { data: integration } = await supa
      .from('integrations')
      .select('accessToken')
      .eq('userId', user.id)
      .eq('type', 'google')
      .eq('status', 'connected')
      .maybeSingle()
    if (!integration) return NextResponse.json({ error: 'Google not connected' }, { status: 404 })

    const accessToken = (integration as any).accessToken as string

    const now = new Date()
    const start = new Date(now.getTime() + 5 * 60000)
    const end = new Date(start.getTime() + 30 * 60000)

    const event = {
      summary: 'TheGridHub Test Event',
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
      description: 'Created by admin-internal google.test-calendar',
    }

    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: 'Failed to create calendar event', details: err }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}

