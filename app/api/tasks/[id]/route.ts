import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateUser } from '@/lib/user'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const dbUser = await getOrCreateUser(supabaseUser)
    if (!dbUser) return NextResponse.json({ error: 'Profile not initialized' }, { status: 400 })

    const updates: any = {
      title: body.title,
      description: body.description ?? null,
      status: body.status,
      priority: body.priority,
      progress: body.progress,
      dueDate: body.dueDate || null,
      projectId: body.projectId ?? null,
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', params.id)
      .eq('userId', dbUser.id)
      .select('*')
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await getOrCreateUser(supabaseUser)
    if (!dbUser) return NextResponse.json({ error: 'Profile not initialized' }, { status: 400 })

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', params.id)
      .eq('userId', dbUser.id)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

