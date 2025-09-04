import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateTaskSuggestions } from '@/lib/ai'
import prisma from '@/lib/prisma'

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
    const existingTasks = await prisma.task.findMany({
      where: { 
        userId,
        projectId: projectId || null
      },
      select: { title: true }
    })

    const taskTitles = existingTasks.map(task => task.title)

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
