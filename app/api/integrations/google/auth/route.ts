import { NextResponse } from 'next/server'

export async function POST() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirect = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google/callback`
  const scope = encodeURIComponent('https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email')
  const params = new URLSearchParams({
    client_id: clientId || '',
    redirect_uri: redirect,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    scope,
  })
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  return NextResponse.json({ authUrl })
}

