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
  const origin = req.nextUrl.origin
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
      CLIENT_SECRET: mask(env.GOOGLE_CLIENT_SECRET)
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

  const [supa, app, db, stripe, slack, google, ms] = await Promise.all([
    checkSupabase(),
    ping(`${origin}/api/health/app`),
    ping(`${origin}/api/health/db`),
    ping(`${origin}/api/health/stripe`),
    ping(`${origin}/api/integrations/slack/status`),
    ping(`${origin}/api/integrations/google/status`),
    ping(`${origin}/api/integrations/office365/status`),
  ])

  return NextResponse.json({
    env: envStatus,
    checks: {
      app,
      db,
      stripe,
      slack,
      google,
      microsoft: ms,
      supabase: supa,
    }
  })
}

