import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Verifies presence of key tables/columns the app expects
export async function GET() {
  const supa = createServiceClient()
  const checks: Record<string, any> = {}
  const results: Array<{ table: string; ok: boolean; note?: string; error?: string }> = []

  async function check(table: string, columns: string[]) {
    try {
      const sel = columns.join(',')
      const { error } = await supa.from(table).select(sel, { head: true, count: 'exact' }).limit(1)
      if (error) {
        results.push({ table, ok: false, note: 'Selection failed', error: error.message })
      } else {
        results.push({ table, ok: true })
      }
    } catch (e: any) {
      results.push({ table, ok: false, error: e?.message || String(e) })
    }
  }

  await check('users', ['id','email'])
  await check('user_onboarding', ['id','userId','companyName','language'])
  await check('projects', ['id','userId','name','slackDefaultChannelId','jiraProjectKey'])
  await check('tasks', ['id','userId','title','projectId'])
  await check('goals', ['id','userId','title','target'])
  await check('notifications', ['id','userId','read'])
  await check('team_memberships', ['id','userId','role'])
  await check('integrations', ['id','userId','type','status','accessToken'])
  await check('subscriptions', ['userId','plan','status'])
  await check('stripe_webhook_events', ['event_id','type','status','created_at'])

  const ok = results.every(r => r.ok)
  return NextResponse.json({ ok, results })
}

