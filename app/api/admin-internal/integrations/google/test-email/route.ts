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
      .select('accessToken, userEmail')
      .eq('userId', user.id)
      .eq('type', 'google')
      .eq('status', 'connected')
      .maybeSingle()
    if (!integration) return NextResponse.json({ error: 'Google not connected' }, { status: 404 })

    const accessToken = (integration as any).accessToken as string
    const to = (integration as any).userEmail || 'me'

    const subject = 'TheGridHub: Test Email ✅'
    const textBody = 'This is a test email sent from TheGridHub via your Google integration.'
    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=UTF-8',
      '',
      textBody
    ].join('\n')
    const raw = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_')

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw })
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: 'Failed to send gmail', details: err }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}

