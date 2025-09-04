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
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw })
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: 'Failed to send gmail', details: err }, { status: 500 })
    }

    await supabase
      .from('integrations')
      .update({ lastSync: new Date().toISOString() })
      .eq('userEmail', (integration as any).userEmail)
      .eq('type', 'google')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Google test email error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

