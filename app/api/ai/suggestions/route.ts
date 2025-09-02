import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { generateTaskSuggestions } from '@/lib/ai'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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