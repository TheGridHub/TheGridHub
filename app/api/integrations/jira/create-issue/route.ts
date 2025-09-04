import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrCreateUser } from '@/lib/auth/user-mapping';
import { prisma } from '@/lib/prisma';
import { createJiraIssue } from '@/lib/integrations/jira';

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
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId: user.id
      }
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Get the project with Jira configuration
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.id
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (!project.jiraProjectKey) {
      return NextResponse.json(
        { error: 'Jira project key not configured for this project' },
        { status: 400 }
      );
    }

    // Create the Jira issue
    const jiraIssue = await createJiraIssue({
      projectKey: project.jiraProjectKey,
      summary: task.title,
      description: task.description || '',
      issueType: 'Task',
      priority: task.priority || 'Medium',
      labels: task.tags || [],
      dueDate: task.dueDate?.toISOString().split('T')[0],
    });

    // Update the task with Jira issue link
    if (jiraIssue.key) {
      await prisma.task.update({
        where: { id: taskId },
        data: {
          jiraIssueKey: jiraIssue.key,
          jiraIssueUrl: jiraIssue.self,
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json({
      success: true,
      jiraIssue: {
        key: jiraIssue.key,
        url: jiraIssue.self
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