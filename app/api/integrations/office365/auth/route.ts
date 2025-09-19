import { NextResponse } from 'next/server'

export async function POST() {
  const clientId = process.env.MICROSOFT_CLIENT_ID
  const tenant = process.env.MICROSOFT_TENANT_ID || 'common'
  const redirect = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/office365/callback`
  const scope = encodeURIComponent('offline_access https://graph.microsoft.com/Calendars.ReadWrite https://graph.microsoft.com/User.Read')
  const params = new URLSearchParams({
    client_id: clientId || '',
    redirect_uri: redirect,
    response_type: 'code',
    response_mode: 'query',
    scope,
  })
  const authUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?${params.toString()}`
  return NextResponse.json({ authUrl })
}

