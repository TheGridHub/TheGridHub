import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await db.user.findUnique({ where: { clerkId: userId } })
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const [taskCount, projectCount, teamCount] = await Promise.all([
      db.task.count({ where: { userId: user.id } }),
      db.project.count({ where: { userId: user.id } }),
      db.teamMembership.count({ where: { userId: user.id } })
    ])

    // Mock completion rate (could compute from tasks)
    const completionRate = 0

    return NextResponse.json({ taskCount, projectCount, teamCount, completionRate })
  } catch (error) {
    console.error('Analytics summary error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

