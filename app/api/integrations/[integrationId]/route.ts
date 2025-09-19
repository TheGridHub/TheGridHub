import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(request: NextRequest, { params }: { params: { integrationId: string } }) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const integrationId = params.integrationId
    if (!integrationId) return NextResponse.json({ error: 'Missing integrationId' }, { status: 400 })

    const { data: appUser } = await supabase
      .from('users')
      .select('id')
      .eq('supabaseId', user.id)
      .maybeSingle()
    if (!appUser?.id) return NextResponse.json({ error: 'User not found' }, { status: 400 })

    // Fetch integration to revoke tokens
    const { data: integ } = await supabase
      .from('integrations')
      .select('id, type, accessToken, refreshToken')
      .eq('id', integrationId)
      .eq('userId', appUser.id)
      .maybeSingle()

    if (!integ?.id) return NextResponse.json({ error: 'Integration not found' }, { status: 404 })

    try {
      if ((integ as any).type === 'google') {
        const tokenToRevoke = (integ as any).refreshToken || (integ as any).accessToken
        if (tokenToRevoke) {
          await fetch('https://oauth2.googleapis.com/revoke', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ token: tokenToRevoke })
          }).catch(()=>{})
        }
      } else if ((integ as any).type === 'office365') {
        const tenant = process.env.MICROSOFT_TENANT_ID || 'common'
        const clientId = process.env.MICROSOFT_CLIENT_ID
        const clientSecret = process.env.MICROSOFT_CLIENT_SECRET
        const tokenToRevoke = (integ as any).refreshToken || (integ as any).accessToken
        if (clientId && clientSecret && tokenToRevoke) {
          await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/revoke`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: clientId,
              client_secret: clientSecret,
              token: tokenToRevoke,
              token_type_hint: (integ as any).refreshToken ? 'refresh_token' : 'access_token'
            })
          }).catch(()=>{})
        }
      }
    } catch {}

    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('id', integrationId)
      .eq('userId', appUser.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to disconnect integration' }, { status: 500 })
  }
}

