import { NextRequest, NextResponse } from 'next/server'
import { ensureInternalAuth } from '@/lib/internal-admin/auth'
import { canPerform } from '@/lib/internal-admin/permissions'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const auth = ensureInternalAuth()
    if (!canPerform(auth.role, 'integrations.jira.test')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json().catch(()=>({}))
    const userEmail = String(body.userEmail || '').trim()
    const taskId = String(body.taskId || '')
    const projectId = String(body.projectId || '')
    if (!userEmail || !taskId || !projectId) return NextResponse.json({ error: 'Missing userEmail, taskId, or projectId' }, { status: 400 })

    const supa = createServiceClient()
    const { data: user } = await supa.from('users').select('id').eq('email', userEmail).maybeSingle()
    if (!user?.id) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { data: task } = await supa.from('tasks').select('*').eq('id', taskId).eq('userId', user.id).maybeSingle()
    if (!task) return NextResponse.json({ error: 'Task not found for user' }, { status: 404 })

    const { data: project } = await supa.from('projects').select('*').eq('id', projectId).eq('userId', user.id).maybeSingle()
    if (!project) return NextResponse.json({ error: 'Project not found for user' }, { status: 404 })
    if (!(project as any).jiraProjectKey) return NextResponse.json({ error: 'Jira project key not configured on project' }, { status: 400 })

    const { data: jiraIntegration } = await supa
      .from('integrations')
      .select('accessToken')
      .eq('userId', user.id)
      .eq('type', 'jira')
      .eq('status', 'connected')
      .maybeSingle()

    if (!jiraIntegration?.accessToken) return NextResponse.json({ error: 'Jira not connected' }, { status: 400 })

    let creds: { baseUrl: string; email: string; apiToken: string }
    try {
      creds = JSON.parse(jiraIntegration.accessToken as any)
    } catch {
      return NextResponse.json({ error: 'Invalid Jira credentials format' }, { status: 500 })
    }

    const payload = {
      fields: {
        project: { key: (project as any).jiraProjectKey },
        summary: (task as any).title,
        description: (task as any).description || 'Created from TheGridHub (admin-internal)',
        issuetype: { name: 'Task' },
        priority: { name: ((task as any).priority || 'Medium') },
      }
    }

    const authHeader = Buffer.from(`${creds.email}:${creds.apiToken}`).toString('base64')
    const res = await fetch(`${creds.baseUrl.replace(/\/$/, '')}/rest/api/3/issue`, {
      method: 'POST',
      headers: { 'Authorization': `Basic ${authHeader}`, 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      const errText = await res.text().catch(()=> '')
      return NextResponse.json({ error: 'Failed to create Jira issue', details: errText }, { status: res.status })
    }

    const issue = await res.json().catch(()=>null)
    return NextResponse.json({ success: true, issue })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}

