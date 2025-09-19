import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { data: appUser } = await supabase
    .from('users')
    .select('id')
    .eq('supabaseId', user.id)
    .maybeSingle()

  if (!appUser?.id) return NextResponse.json({ tasks: [] })

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('userId', appUser.id)
    .order('createdAt', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tasks: data || [] })
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const { title, description, projectId, priority, dueDate } = body
  if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 })

  const { data: appUser } = await supabase
    .from('users')
    .select('id')
    .eq('supabaseId', user.id)
    .maybeSingle()
  if (!appUser?.id) return NextResponse.json({ error: 'User missing' }, { status: 400 })

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title,
      description,
      projectId: projectId || null,
      userId: appUser.id,
      priority: (priority || 'LOW').toUpperCase(),
      dueDate: dueDate ? new Date(dueDate).toISOString() : null
    })
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Calendar sync (best-effort)
  try {
    if (data.dueDate) {
      // Prefer Google if connected; else Office365
      const { data: g } = await supabase
        .from('integrations')
        .select('accessToken, refreshToken, features')
        .eq('userId', appUser.id)
        .eq('type', 'google')
        .eq('status', 'connected')
        .maybeSingle()
      const featuresG = (g as any)?.features || {}
      if (g?.accessToken && featuresG.syncTasksToCalendar !== false) {
        const { createOrUpdateGoogleEvent } = await import('@/lib/integrations/calendar')
        const eventId = await createOrUpdateGoogleEvent({
          accessToken: (g as any).accessToken,
          refreshToken: (g as any).refreshToken,
          calendarId: featuresG.defaultCalendarId || 'primary',
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          eventId: null,
          title: data.title,
          description: data.description || undefined,
          dueDate: data.dueDate
        })
        await supabase.from('tasks').update({ calendar_event_id: eventId, calendar_provider: 'google' }).eq('id', data.id)
      } else {
        const { data: o } = await supabase
          .from('integrations')
          .select('accessToken, features')
          .eq('userId', appUser.id)
          .eq('type', 'office365')
          .eq('status', 'connected')
          .maybeSingle()
        const featuresO = (o as any)?.features || {}
        if (o?.accessToken && featuresO.syncTasksToCalendar !== false) {
          const { createOrUpdateO365Event } = await import('@/lib/integrations/calendar')
          const eventId = await createOrUpdateO365Event({
            accessToken: (o as any).accessToken,
            calendarId: featuresO.defaultCalendarId,
            eventId: null,
            title: data.title,
            description: data.description || undefined,
            dueDate: data.dueDate
          })
          await supabase.from('tasks').update({ calendar_event_id: eventId, calendar_provider: 'office365' }).eq('id', data.id)
        }
      }
    }
  } catch (e) {
    console.warn('Calendar sync skipped:', (e as any)?.message || e)
  }

  // Slack notification (best-effort)
  try {
    const { data: integ } = await supabase
      .from('integrations')
      .select('accessToken, features')
      .eq('userId', appUser.id)
      .eq('type', 'slack')
      .eq('status', 'connected')
      .maybeSingle()

    const token = (integ as any)?.accessToken
    const features = (integ as any)?.features || {}
    const channelId = features?.defaultChannelId || features?.channelId

    if (token && channelId) {
      const { SlackIntegration } = await import('@/lib/integrations/slack')
      const slack = new SlackIntegration({ botToken: token, signingSecret: '' as any })
      await slack.sendTaskNotification(channelId, {
        id: data.id,
        title: data.title,
        description: data.description || undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        priority: (data.priority === 'HIGH' ? 'High' : data.priority === 'MEDIUM' ? 'Medium' : 'Low') as any,
        status: 'pending'
      }, 'created')
    }
  } catch (e) {
    console.warn('Slack notification skipped:', (e as any)?.message || e)
  }

  return NextResponse.json({ task: data })
}

