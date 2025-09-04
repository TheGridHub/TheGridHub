import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateUser } from '@/lib/user'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await getOrCreateUser(user)

    const { channelId, text } = await req.json()
    if (!channelId) return NextResponse.json({ error: 'Missing channelId' }, { status: 400 })

    const { data: slack } = await supabase
      .from('integrations')
      .select('*')
      .eq('userId', dbUser?.id)
      .eq('type', 'slack')
      .eq('status', 'connected')
      .maybeSingle()
    if (!slack) return NextResponse.json({ error: 'Slack not connected' }, { status: 404 })

    const token = (slack as any).accessToken as string
    const message = text || 'TheGridHub test message ✅'

    const res = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ channel: channelId, text: message })
    })
    const json = await res.json()
    if (!json.ok) return NextResponse.json({ error: 'Failed to post message' }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Slack test message error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

