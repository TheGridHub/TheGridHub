import { NextResponse } from 'next/server'

export interface IntegrationTokens {
  accessToken: string
  refreshToken?: string | null
  expiresAt?: string | null // ISO string
}

export async function maybeRefreshGoogleToken(tokens: IntegrationTokens): Promise<IntegrationTokens> {
  const { accessToken, refreshToken, expiresAt } = tokens
  const now = Date.now()
  const exp = expiresAt ? new Date(expiresAt).getTime() : 0
  const needsRefresh = !!refreshToken && (!!exp ? exp - now < 60_000 : false)
  if (!needsRefresh) return tokens

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) return tokens

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken as string,
    })
  })
  if (!res.ok) return tokens
  const data = await res.json()
  const newAccess = data.access_token as string | undefined
  const newExpiresIn = Number(data.expires_in || 0)
  if (!newAccess) return tokens
  return {
    accessToken: newAccess,
    refreshToken,
    expiresAt: newExpiresIn ? new Date(Date.now() + newExpiresIn * 1000).toISOString() : tokens.expiresAt || null,
  }
}

export async function maybeRefreshMsToken(tokens: IntegrationTokens): Promise<IntegrationTokens> {
  const { accessToken, refreshToken, expiresAt } = tokens
  const now = Date.now()
  const exp = expiresAt ? new Date(expiresAt).getTime() : 0
  const needsRefresh = !!refreshToken && (!!exp ? exp - now < 60_000 : false)
  if (!needsRefresh) return tokens

  const tenant = process.env.MICROSOFT_TENANT_ID || 'common'
  const clientId = process.env.MICROSOFT_CLIENT_ID
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET
  if (!clientId || !clientSecret) return tokens

  const res = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken as string,
      scope: 'offline_access https://graph.microsoft.com/.default'
    })
  })
  if (!res.ok) return tokens
  const data = await res.json()
  const newAccess = data.access_token as string | undefined
  const newExpiresIn = Number(data.expires_in || 0)
  if (!newAccess) return tokens
  return {
    accessToken: newAccess,
    refreshToken,
    expiresAt: newExpiresIn ? new Date(Date.now() + newExpiresIn * 1000).toISOString() : tokens.expiresAt || null,
  }
}

