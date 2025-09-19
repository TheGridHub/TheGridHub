import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createOrUpdateO365Event } from '@/lib/integrations/calendar'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { taskId, title, dueDate, description } = await request.json()
    if (!dueDate || !title) return NextResponse.json({ error: 'title and dueDate required' }, { status: 400 })

    const { data: integ } = await supabase
      .from('integrations')
      .select('accessToken, features')
      .eq('type', 'office365')
      .eq('status', 'connected')
      .limit(1)
      .maybeSingle()

    if (!integ?.accessToken) return NextResponse.json({ error: 'Office365 not connected' }, { status: 400 })

    const features = (integ as any).features || {}
    if (features.syncTasksToCalendar === false) return NextResponse.json({ skipped: true })

    const calendarId = features.defaultCalendarId // may be undefined → /me/events
    const eventId = await createOrUpdateO365Event({
      accessToken: (integ as any).accessToken,
      calendarId,
      eventId: null,
      title,
      description,
      dueDate
    })

    if (taskId && eventId) {
      await supabase.from('tasks').update({ calendar_event_id: eventId, calendar_provider: 'office365' }).eq('id', taskId)
    }

    return NextResponse.json({ eventId })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to create calendar event' }, { status: 500 })
  }
}
