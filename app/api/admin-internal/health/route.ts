import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

function mask(value?: string) {
  if (!value) return { present: false, value: null }
  return { present: true, value: value.length <= 8 ? '***' : value.slice(0, 2) + '***' + value.slice(-2) }
}

async function checkSupabase() {
  try {
    const supa = createServiceClient()
    const { error } = await supa.from('feature_flags').select('*', { count: 'exact', head: true })
    if (error) throw error
    return { ok: true }
  } catch (e:any) {
    return { ok: false, error: e?.message || String(e) }
  }
}

async function ping(url: string) {
  try {
    const res = await fetch(url, { cache: 'no-store' })
    const ok = res.ok
    return { ok, status: res.status }
  } catch (e:any) {
    return { ok: false, error: e?.message || String(e) }
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const envKey = searchParams.get('env')
  const originOverride = searchParams.get('origin')

  let origin = req.nextUrl.origin
  let slackToken: string | undefined = process.env.SLACK_BOT_TOKEN
  let msCreds: { tenantId?: string, clientId?: string, clientSecret?: string } = {
    tenantId: process.env.MICROSOFT_TENANT_ID,
    clientId: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  }
  let googleSvc: { serviceAccountJson?: string } = {
    serviceAccountJson: process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
  }

  // Load environment preset from ADMIN_ENVIRONMENTS_JSON if envKey is provided
  try {
    const raw = process.env.ADMIN_ENVIRONMENTS_JSON
    if (raw) {
      const list = JSON.parse(raw)
      if (Array.isArray(list) && envKey) {
        const found = list.find((e:any) => String(e.key) === envKey)
        if (found) {
          origin = String(found.origin || origin)
          slackToken = found.slackBotToken || slackToken
          msCreds = found.microsoft || msCreds
          googleSvc = found.google || googleSvc
        }
      }
    }
  } catch {}

  if (originOverride && /^(https?:)\/\//i.test(originOverride)) {
    origin = originOverride
  }

  const env = process.env
  const envStatus = {
    DATABASE_URL: mask(env.DATABASE_URL),
    DIRECT_URL: mask(env.DIRECT_URL),
    SUPABASE_URL: mask(env.SUPABASE_URL),
    SUPABASE_ANON_KEY: mask(env.SUPABASE_ANON_KEY),
    SUPABASE_SERVICE_ROLE_KEY: mask(env.SUPABASE_SERVICE_ROLE_KEY),
    NEXT_PUBLIC_APP_URL: mask(env.NEXT_PUBLIC_APP_URL),
    CLERK: {
      PUBLISHABLE: mask(env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY),
      SECRET: mask(env.CLERK_SECRET_KEY)
    },
    MICROSOFT: {
      CLIENT_ID: mask(env.MICROSOFT_CLIENT_ID),
      CLIENT_SECRET: mask(env.MICROSOFT_CLIENT_SECRET),
      TENANT_ID: mask(env.MICROSOFT_TENANT_ID)
    },
    SLACK: {
      CLIENT_ID: mask(env.SLACK_CLIENT_ID),
      CLIENT_SECRET: mask(env.SLACK_CLIENT_SECRET),
      SIGNING_SECRET: mask(env.SLACK_SIGNING_SECRET),
      BOT_TOKEN: mask(env.SLACK_BOT_TOKEN)
    },
    GOOGLE: {
      CLIENT_ID: mask(env.GOOGLE_CLIENT_ID),
      CLIENT_SECRET: mask(env.GOOGLE_CLIENT_SECRET),
      REDIRECT_URI: mask(env.GOOGLE_REDIRECT_URI),
      SERVICE_ACCOUNT_JSON: mask(env.GOOGLE_SERVICE_ACCOUNT_JSON)
    },
    JIRA: {
      CLIENT_ID: mask(env.JIRA_CLIENT_ID),
      CLIENT_SECRET: mask(env.JIRA_CLIENT_SECRET),
      DOMAIN: mask(env.JIRA_DOMAIN),
      EMAIL: mask(env.JIRA_EMAIL)
    },
    STRIPE: {
      SECRET_KEY: mask(env.STRIPE_SECRET_KEY),
      PUBLISHABLE_KEY: mask(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
      WEBHOOK_SECRET: mask(env.STRIPE_WEBHOOK_SECRET)
    },
    RESEND_API_KEY: mask(env.RESEND_API_KEY),
    NEXTAUTH_URL: mask(env.NEXTAUTH_URL),
    ENCRYPTION_MASTER_KEY: mask(env.ENCRYPTION_MASTER_KEY),
    CSRF_SECRET: mask(env.CSRF_SECRET),
    OPENAI_API_KEY: mask(env.OPENAI_API_KEY),
    SENTRY_DSN: mask(env.SENTRY_DSN),
    LOGTAIL_TOKEN: mask(env.LOGTAIL_TOKEN),
    POSTHOG_KEY: mask(env.NEXT_PUBLIC_POSTHOG_KEY)
  }

  // Service-token-based checks
  async function checkSlack() {
    if (!slackToken) return { ok: false, error: 'No Slack bot token' }
    try {
      const res = await fetch('https://slack.com/api/auth.test', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${slackToken}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({})
      })
      const j = await res.json()
      return { ok: !!j.ok, status: res.status, team: j.team, user: j.user }
    } catch (e:any) {
      return { ok: false, error: e?.message || String(e) }
    }
  }

  async function checkMicrosoft() {
    if (!msCreds?.tenantId || !msCreds?.clientId || !msCreds?.clientSecret) return { ok: false, error: 'No Microsoft app credentials' }
    try {
      const tokenRes = await fetch(`https://login.microsoftonline.com/${msCreds.tenantId}/oauth2/v2.0/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: msCreds.clientId,
          client_secret: msCreds.clientSecret,
          scope: 'https://graph.microsoft.com/.default',
          grant_type: 'client_credentials'
        })
      })
      if (!tokenRes.ok) return { ok: false, status: tokenRes.status }
      const j = await tokenRes.json()
      return { ok: !!j.access_token, status: tokenRes.status }
    } catch (e:any) {
      return { ok: false, error: e?.message || String(e) }
    }
  }

  async function checkGoogle() {
    const hasSvc = !!googleSvc?.serviceAccountJson
    const hasOAuthClient = !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET
    if (hasSvc) return { ok: true, mode: 'service_account' }
    if (hasOAuthClient) return { ok: true, mode: 'oauth_client', note: 'Service account not configured' }
    return { ok: false, error: 'No Google credentials configured' }
  }

  const [supa, app, db, stripe, slackSvc, googleSvcCheck, msSvc] = await Promise.all([
    checkSupabase(),
    ping(`${origin}/api/health/app`),
    ping(`${origin}/api/health/db`),
    ping(`${origin}/api/health/stripe`),
    checkSlack(),
    checkGoogle(),
    checkMicrosoft(),
  ])

  return NextResponse.json({
    env: envStatus,
    target: { origin },
    checks: {
      app,
      db,
      stripe,
      slack: slackSvc,
      google: googleSvcCheck,
      microsoft: msSvc,
      supabase: supa,
    }
  })
}

