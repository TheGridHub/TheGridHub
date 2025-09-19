import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { data: appUser } = await supabase
    .from('users')
    .select('id')
    .eq('supabaseId', user.id)
    .maybeSingle()
  if (!appUser?.id) return NextResponse.json({ error: 'User missing' }, { status: 400 })

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', params.id)
    .eq('userId', appUser.id)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ task: data })
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const updates: any = {}
  ;['title','description','status','priority','progress','dueDate','projectId'].forEach(k => {
    if (body[k] !== undefined) updates[k] = body[k]
  })

  const { data: appUser } = await supabase
    .from('users')
    .select('id')
    .eq('supabaseId', user.id)
    .maybeSingle()
  if (!appUser?.id) return NextResponse.json({ error: 'User missing' }, { status: 400 })

  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', params.id)
    .eq('userId', appUser.id)
    .select('*')
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Calendar sync update
  try {
    if (data?.dueDate || data?.title) {
      if (data?.calendar_provider === 'google' && data?.calendar_event_id) {
        const { data: g } = await supabase
          .from('integrations')
          .select('accessToken, refreshToken, features')
          .eq('userId', appUser.id)
          .eq('type', 'google')
          .eq('status', 'connected')
          .maybeSingle()
        const { createOrUpdateGoogleEvent } = await import('@/lib/integrations/calendar')
        if (g?.accessToken) await createOrUpdateGoogleEvent({
          accessToken: (g as any).accessToken,
          refreshToken: (g as any).refreshToken,
          calendarId: ((g as any).features || {}).defaultCalendarId || 'primary',
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          eventId: data.calendar_event_id,
          title: data.title,
          description: data.description || undefined,
          dueDate: data.dueDate || new Date().toISOString()
        })
      } else if (data?.calendar_provider === 'office365' && data?.calendar_event_id) {
        const { data: o } = await supabase
          .from('integrations')
          .select('accessToken, features')
          .eq('userId', appUser.id)
          .eq('type', 'office365')
          .eq('status', 'connected')
          .maybeSingle()
        const { createOrUpdateO365Event } = await import('@/lib/integrations/calendar')
        if (o?.accessToken) await createOrUpdateO365Event({
          accessToken: (o as any).accessToken,
          calendarId: ((o as any).features || {}).defaultCalendarId,
          eventId: data.calendar_event_id,
          title: data.title,
          description: data.description || undefined,
          dueDate: data.dueDate || new Date().toISOString()
        })
      }
    }
  } catch (e) {
    console.warn('Calendar update skipped:', (e as any)?.message || e)
  }

  return NextResponse.json({ task: data })
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { data: appUser } = await supabase
    .from('users')
    .select('id')
    .eq('supabaseId', user.id)
    .maybeSingle()
  if (!appUser?.id) return NextResponse.json({ error: 'User missing' }, { status: 400 })

  // Fetch task first to get calendar info
  const { data: taskRow } = await supabase
    .from('tasks')
    .select('calendar_event_id, calendar_provider')
    .eq('id', params.id)
    .eq('userId', appUser.id)
    .maybeSingle()

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', params.id)
    .eq('userId', appUser.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Delete calendar event best-effort
  try {
    if (taskRow?.calendar_event_id && taskRow?.calendar_provider === 'google') {
      const { data: g } = await supabase
        .from('integrations')
        .select('accessToken, features')
        .eq('userId', appUser.id)
        .eq('type', 'google')
        .eq('status', 'connected')
        .maybeSingle()
      if (g?.accessToken) {
        const { deleteGoogleEvent } = await import('@/lib/integrations/calendar')
        await deleteGoogleEvent((g as any).accessToken, ((g as any).features || {}).defaultCalendarId || 'primary', taskRow.calendar_event_id)
      }
    } else if (taskRow?.calendar_event_id && taskRow?.calendar_provider === 'office365') {
      const { data: o } = await supabase
        .from('integrations')
        .select('accessToken, features')
        .eq('userId', appUser.id)
        .eq('type', 'office365')
        .eq('status', 'connected')
        .maybeSingle()
      if (o?.accessToken) {
        const { deleteO365Event } = await import('@/lib/integrations/calendar')
        await deleteO365Event((o as any).accessToken, ((o as any).features || {}).defaultCalendarId, taskRow.calendar_event_id)
      }
    }
  } catch (e) {
    console.warn('Calendar delete skipped:', (e as any)?.message || e)
  }

  return new NextResponse(null, { status: 204 })
}

