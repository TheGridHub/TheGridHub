import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { data: rows, error } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      description,
      status,
      priority,
      due_date,
      workspace_id,
      created_by,
      created_at,
      updated_at
    `)
    .eq('created_by', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ projects: rows || [] })
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const { 
      name,
      description, 
      status = 'planning',
      priority = 'medium',
      due_date,
      workspace_id
    } = body
    
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 })
    }

    // Get user's workspace if not provided
    let finalWorkspaceId = workspace_id
    if (!finalWorkspaceId) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('workspace_id')
        .eq('user_id', user.id)
        .single()
      
      finalWorkspaceId = profile?.workspace_id
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        status,
        priority,
        due_date: due_date || null,
        workspace_id: finalWorkspaceId,
        created_by: user.id
      })
      .select(`
        id,
        name,
        description,
        status,
        priority,
        due_date,
        workspace_id,
        created_by,
        created_at,
        updated_at
      `)
      .single()
      
    if (error) {
      console.error('Error creating project:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ project: data })
  } catch (e: any) {
    console.error('Error in POST /api/projects:', e)
    return NextResponse.json({ error: e?.message || 'Failed to create project' }, { status: 500 })
  }
}

