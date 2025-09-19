import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { maybeRefreshGoogleToken } from '@/lib/integrations/tokens'

export async function POST(_req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: appUser } = await supabase
      .from('users')
      .select('id')
      .eq('supabaseId', user.id)
      .maybeSingle()
    if (!appUser?.id) return NextResponse.json({ error: 'User not found' }, { status: 400 })

    const { data: integ } = await supabase
      .from('integrations')
      .select('id, accessToken, refreshToken, userEmail, expiresAt')
      .eq('userId', appUser.id)
      .eq('type', 'google')
      .eq('status', 'connected')
      .maybeSingle()
    if (!integ) return NextResponse.json({ error: 'Google not connected' }, { status: 400 })

    // Refresh if needed
    const refreshed = await maybeRefreshGoogleToken({
      accessToken: (integ as any).accessToken,
      refreshToken: (integ as any).refreshToken,
      expiresAt: (integ as any).expiresAt || null,
    })

    if (refreshed.accessToken !== (integ as any).accessToken || refreshed.expiresAt !== (integ as any).expiresAt) {
      await supabase
        .from('integrations')
        .update({ accessToken: refreshed.accessToken, expiresAt: refreshed.expiresAt })
        .eq('id', (integ as any).id)
    }

    const to = (integ as any).userEmail || 'me'
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
      headers: { 'Authorization': `Bearer ${refreshed.accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw })
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: 'Failed to send gmail', details: err }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to send test email' }, { status: 500 })
  }
}
