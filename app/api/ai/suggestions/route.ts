import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateTaskSuggestions } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = user.id

    const body = await request.json()
    const { projectId, projectDescription } = body

    // Get existing tasks for the project
    const supa = createClient()
    const { data: existingTasks } = await supa
      .from('tasks')
      .select('title, projectId, userId')
      .eq('userId', userId)
      .filter('projectId', projectId ? 'eq' : 'is', projectId || null)

    const taskTitles = (existingTasks || []).map(task => task.title)

    // Generate AI suggestions
    const suggestions = await generateTaskSuggestions(
      projectDescription || 'General project tasks',
      taskTitles
    )

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Error generating task suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    )
  }
}
