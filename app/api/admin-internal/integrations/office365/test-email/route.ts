import { NextRequest, NextResponse } from 'next/server'
import { ensureInternalAuth } from '@/lib/internal-admin/auth'
import { canPerform } from '@/lib/internal-admin/permissions'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const auth = ensureInternalAuth()
    if (!canPerform(auth.role, 'integrations.microsoft.test')) {
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
      .eq('type', 'office365')
      .eq('status', 'connected')
      .maybeSingle()
    if (!integration) return NextResponse.json({ error: 'Office365 not connected' }, { status: 404 })

    const accessToken = (integration as any).accessToken as string
    const recipient = (integration as any).userEmail
    if (!recipient) return NextResponse.json({ error: 'Missing userEmail on integration' }, { status: 400 })

    const message = {
      message: {
        subject: 'TheGridHub: Test Email ✅',
        body: { contentType: 'Text', content: 'This is a test email from TheGridHub.' },
        toRecipients: [{ emailAddress: { address: recipient } }]
      }
    }

    const res = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(recipient)}/sendMail`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: 'Failed to send email', details: err }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}

