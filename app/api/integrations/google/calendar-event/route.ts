import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createOrUpdateGoogleEvent } from '@/lib/integrations/calendar'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { taskId, title, dueDate, description } = await request.json()
    if (!dueDate || !title) return NextResponse.json({ error: 'title and dueDate required' }, { status: 400 })

    const { data: integ } = await supabase
      .from('integrations')
      .select('accessToken, refreshToken, features')
      .eq('type', 'google')
      .eq('status', 'connected')
      .limit(1)
      .maybeSingle()

    if (!integ?.accessToken) return NextResponse.json({ error: 'Google not connected' }, { status: 400 })

    const features = (integ as any).features || {}
    if (features.syncTasksToCalendar === false) return NextResponse.json({ skipped: true })

    const calendarId = features.defaultCalendarId || 'primary'
    const eventId = await createOrUpdateGoogleEvent({
      accessToken: (integ as any).accessToken,
      refreshToken: (integ as any).refreshToken,
      calendarId,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      eventId: null,
      title,
      description,
      dueDate
    })

    if (taskId && eventId) {
      await supabase.from('tasks').update({ calendar_event_id: eventId, calendar_provider: 'google' }).eq('id', taskId)
    }

    return NextResponse.json({ eventId })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to create calendar event' }, { status: 500 })
  }
}
