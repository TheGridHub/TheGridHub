import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrCreateUser } from '@/lib/user';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getOrCreateUser(supabaseUser);
    const body = await request.json();
    const { taskId, projectId } = body;

    if (!taskId || !projectId) {
      return NextResponse.json(
        { error: 'Task ID and Project ID are required' },
        { status: 400 }
      );
    }

    // Get the task details
    const supa = createClient();
    const { data: task, error: taskErr } = await supa
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .eq('userId', user.id)
      .single()

    if (taskErr || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Get the project with Jira configuration
    const { data: project, error: projErr } = await supa
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('userId', user.id)
      .single()

    if (projErr || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (!project.jiraProjectKey) {
      return NextResponse.json(
        { error: 'Jira project key not configured for this project' },
        { status: 400 }
      );
    }

    // Fetch Jira credentials from user integration
    const { data: jiraIntegration } = await supa
      .from('integrations')
      .select('accessToken')
      .eq('userId', user.id)
      .eq('type', 'jira')
      .eq('status', 'connected')
      .maybeSingle()

    if (!jiraIntegration?.accessToken) {
      return NextResponse.json({ error: 'Jira not connected' }, { status: 400 })
    }

    let creds: { baseUrl: string; email: string; apiToken: string }
    try {
      creds = JSON.parse(jiraIntegration.accessToken as any)
    } catch {
      return NextResponse.json({ error: 'Invalid Jira credentials format' }, { status: 500 })
    }

    if (!creds.baseUrl || !creds.email || !creds.apiToken) {
      return NextResponse.json({ error: 'Incomplete Jira credentials' }, { status: 400 })
    }

    // Construct Jira issue payload
    const payload = {
      fields: {
        project: { key: project.jiraProjectKey },
        summary: task.title,
        description: task.description || 'Created from TheGridHub',
        issuetype: { name: 'Task' },
        priority: { name: (task.priority || 'Medium') },
        ...(task.dueDate ? { duedate: task.dueDate.toISOString().split('T')[0] } : {}),
        labels: task.tags || []
      }
    }

    const auth = Buffer.from(`${creds.email}:${creds.apiToken}`).toString('base64')
    const res = await fetch(`${creds.baseUrl.replace(/\/$/, '')}/rest/api/3/issue`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      const errText = await res.text().catch(()=> '')
      const status = res.status
      if (status === 401) {
        return NextResponse.json({ error: 'Jira authentication failed. Check email/API token.' }, { status: 401 })
      }
      if (status === 404) {
        return NextResponse.json({ error: 'Project key not found or Jira endpoint invalid.' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to create Jira issue', details: errText }, { status: 500 })
    }

    const issue = await res.json()

    // Update the task with Jira issue link (best-effort; ignore if columns don't exist)
    if (issue?.key) {
      await supa
        .from('tasks')
        .update({ jiraIssueKey: issue.key, jiraIssueUrl: `${creds.baseUrl.replace(/\/$/, '')}/browse/${issue.key}` })
        .eq('id', taskId)
        .eq('userId', user.id)
    }

    return NextResponse.json({
      success: true,
      jiraIssue: {
        key: issue?.key,
        url: `${creds.baseUrl.replace(/\/$/, '')}/browse/${issue?.key}`
      }
    });
  } catch (error) {
    console.error('Error creating Jira issue:', error);
    return NextResponse.json(
      { error: 'Failed to create Jira issue' },
      { status: 500 }
    );
  }
}