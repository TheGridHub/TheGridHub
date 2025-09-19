import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { data, error } = await supabase
    .from('tasks')
    .select(`
      id,
      title,
      description,
      status,
      priority,
      due_date,
      estimated_hours,
      project_id,
      assigned_to,
      created_by,
      created_at,
      updated_at,
      completed_at,
      calendar_event_id,
      calendar_provider
    `)
    .eq('created_by', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ tasks: data || [] })
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const { 
    title, 
    description, 
    project_id, 
    priority = 'medium', 
    status = 'todo',
    due_date,
    estimated_hours,
    assigned_to
  } = body
  
  if (!title?.trim()) {
    return NextResponse.json({ error: 'Task title is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: title.trim(),
      description: description?.trim() || null,
      project_id: project_id || null,
      created_by: user.id,
      priority: priority.toLowerCase(),
      status: status.toLowerCase(),
      due_date: due_date || null,
      estimated_hours: estimated_hours || null,
      assigned_to: assigned_to || user.id
    })
    .select(`
      id,
      title,
      description,
      status,
      priority,
      due_date,
      estimated_hours,
      project_id,
      assigned_to,
      created_by,
      created_at,
      updated_at
    `)
    .single()
    
  if (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // TODO: Add calendar sync and integrations in the future

  return NextResponse.json({ task: data })
}

