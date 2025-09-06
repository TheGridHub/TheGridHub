import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(_req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Resolve internal user row id
    const { data: userRow, error: uErr } = await supabase
      .from('users')
      .select('id, name')
      .eq('supabaseId', user.id)
      .maybeSingle()
    if (uErr) throw uErr
    if (!userRow?.id) return NextResponse.json({ error: 'User row not found' }, { status: 404 })
    const userId = userRow.id as string

    // Check if user already has any projects; if yes, skip seeding
    const { data: existingProjects, error: pErr } = await supabase
      .from('projects')
      .select('id')
      .eq('userId', userId)
      .limit(1)
    if (pErr) throw pErr

    if (existingProjects && existingProjects.length > 0) {
      return NextResponse.json({ ok: true, seeded: false, reason: 'projects-exist' })
    }

    // Create a starter project
    const projectName = 'Getting Started'
    const { data: createdProject, error: cErr } = await supabase
      .from('projects')
      .insert({
        id: crypto.randomUUID(),
        userId,
        name: projectName,
        description: 'Your first project with example tasks',
        color: '#7C3AED',
      })
      .select('id')
      .single()
    if (cErr) throw cErr

    const projectId = createdProject.id as string

    // Seed a few tasks
    const now = new Date()
    const tasks = [
      {
        id: crypto.randomUUID(),
        title: 'Explore your dashboard',
        description: 'Take a quick tour of widgets, charts and lists',
        status: 'UPCOMING',
        priority: 'MEDIUM',
        progress: 0,
        dueDate: new Date(now.getTime() + 3 * 24 * 3600 * 1000).toISOString(),
        userId,
        projectId,
      },
      {
        id: crypto.randomUUID(),
        title: 'Create your first task',
        description: 'Add a task, set priority and assign to a project',
        status: 'UPCOMING',
        priority: 'LOW',
        progress: 0,
        dueDate: new Date(now.getTime() + 5 * 24 * 3600 * 1000).toISOString(),
        userId,
        projectId,
      },
      {
        id: crypto.randomUUID(),
        title: 'Invite a teammate',
        description: 'Collaborate in real-time with comments and mentions',
        status: 'UPCOMING',
        priority: 'LOW',
        progress: 0,
        dueDate: new Date(now.getTime() + 7 * 24 * 3600 * 1000).toISOString(),
        userId,
        projectId,
      },
    ]

    const { error: tErr } = await supabase
      .from('tasks')
      .insert(tasks)
    if (tErr) throw tErr

    // Seed a welcome notification
    await supabase
      .from('notifications')
      .insert({
        id: crypto.randomUUID(),
        userId,
        type: 'info',
        title: 'Welcome to TheGridHub',
        message: 'We created a starter project and a few example tasks to help you begin.',
        read: false,
      })

    return NextResponse.json({ ok: true, seeded: true, projectId })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Seed failed' }, { status: 500 })
  }
}
