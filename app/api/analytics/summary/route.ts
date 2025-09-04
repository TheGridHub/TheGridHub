import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = user.id

    const supa = createClient()
    const [tasks, projects, team] = await Promise.all([
      supa.from('tasks').select('id', { count: 'exact', head: true }).eq('userId', userId),
      supa.from('projects').select('id', { count: 'exact', head: true }).eq('userId', userId),
      supa.from('team_memberships').select('id', { count: 'exact', head: true }).eq('userId', userId)
    ])
    const taskCount = tasks.count || 0
    const projectCount = projects.count || 0
    const teamCount = team.count || 0

    // Mock completion rate (could compute from tasks)
    const completionRate = 0

    return NextResponse.json({ taskCount, projectCount, teamCount, completionRate })
  } catch (error) {
    console.error('Analytics summary error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

