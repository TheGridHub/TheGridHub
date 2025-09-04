import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = user.id

    const [taskCount, projectCount, teamCount] = await Promise.all([
      prisma.task.count({ where: { userId } }),
      prisma.project.count({ where: { userId } }),
      prisma.teamMembership.count({ where: { userId } })
    ])

    // Mock completion rate (could compute from tasks)
    const completionRate = 0

    return NextResponse.json({ taskCount, projectCount, teamCount, completionRate })
  } catch (error) {
    console.error('Analytics summary error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

