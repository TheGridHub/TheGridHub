import { NextRequest, NextResponse } from 'next/server'
import { ensureInternalAuth } from '@/lib/internal-admin/auth'
import { canPerform } from '@/lib/internal-admin/permissions'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const auth = ensureInternalAuth()
    if (!canPerform(auth.role, 'integrations.slack.test')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json().catch(()=>({}))
    const userEmail = String(body.userEmail || '').trim()
    const channelId = String(body.channelId || '')
    const text = String(body.text || 'TheGridHub test message ✅')
    if (!userEmail || !channelId) return NextResponse.json({ error: 'Missing userEmail or channelId' }, { status: 400 })

    const supa = createServiceClient()
    const { data: user } = await supa.from('users').select('id').eq('email', userEmail).maybeSingle()
    if (!user?.id) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { data: slack } = await supa.from('integrations').select('*').eq('userId', user.id).eq('type', 'slack').eq('status', 'connected').maybeSingle()
    if (!slack) return NextResponse.json({ error: 'Slack not connected' }, { status: 404 })
    const token = (slack as any).accessToken as string

    const res = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ channel: channelId, text })
    })
    const json = await res.json().catch(()=>({}))
    if (!json?.ok) return NextResponse.json({ error: 'Failed to post message', details: json }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}

