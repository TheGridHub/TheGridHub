import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateUser } from '@/lib/user'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { action } = await req.json().catch(() => ({ action: 'sync' }))

    const dbUser = await getOrCreateUser(supabaseUser)
    const { data: integration } = await supabase
      .from('integrations')
      .select('*')
      .eq('id', params.id)
      .eq('userId', dbUser?.id)
      .single()
    if (!integration) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    let ok = true
    const type = integration.type as string

    try {
      if (type === 'google') {
        // Basic check: userinfo with access token
        const token = integration.accessToken as unknown as string
        const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store'
        })
        ok = res.ok
      } else if (type === 'office365') {
        const token = integration.accessToken as unknown as string
        const res = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store'
        })
        ok = res.ok
      } else if (type === 'jira') {
        // accessToken contains JSON with baseUrl, email, apiToken
        const cfg = JSON.parse(integration.accessToken as unknown as string)
        const authHeader = 'Basic ' + Buffer.from(`${cfg.email}:${cfg.apiToken}`).toString('base64')
        const res = await fetch(`${cfg.baseUrl}/rest/api/3/myself`, {
          headers: { Authorization: authHeader, Accept: 'application/json' },
          cache: 'no-store'
        })
        ok = res.ok
        if (ok && action === 'syncIssues') {
          // Pull a few issues to validate
          await fetch(`${cfg.baseUrl}/rest/api/3/search?maxResults=1`, {
            headers: { Authorization: authHeader, Accept: 'application/json' },
            cache: 'no-store'
          })
        }
      } else if (type === 'slack') {
        const token = integration.accessToken as unknown as string
        const res = await fetch('https://slack.com/api/auth.test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ token })
        })
        const json = await res.json()
        ok = !!json.ok
      }
    } catch (e) {
      ok = false
    }

    if (ok) {
      await supabase
        .from('integrations')
        .update({ lastSync: new Date().toISOString() })
        .eq('id', integration.id)
    }

    return NextResponse.json({ success: ok })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

