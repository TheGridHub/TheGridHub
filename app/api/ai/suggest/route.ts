import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// Very simple, local heuristic suggestions to avoid external calls
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const prompt = (body?.prompt || '').toString().toLowerCase()

    const suggestions: any[] = []

    if (prompt.includes('priorit') || prompt.includes('urgent')) {
      suggestions.push({
        title: 'Prioritize high-impact tasks first',
        description: 'Focus on items that unblock others or have near deadlines.',
        subtasks: ['Identify top 3 tasks for today', 'Estimate time per task', 'Block calendar time']
      })
    }

    if (prompt.includes('break') || prompt.includes('split')) {
      suggestions.push({
        title: 'Break down large tasks',
        description: 'Create sub-tasks with clear outcomes to maintain momentum.',
        subtasks: ['Define sub-goals', 'Assign rough estimates', 'Set intermediate checkpoints']
      })
    }

    if (prompt.includes('plan') || prompt.includes('week')) {
      suggestions.push({
        title: 'Weekly plan',
        description: 'Draft a weekly plan to align tasks with goals and meetings.',
        subtasks: ['Pick 1-2 goals for the week', 'Map tasks to each goal', 'Schedule reviews mid-week & Friday']
      })
    }

    if (suggestions.length === 0) {
      suggestions.push({
        title: 'Clarify your request',
        description: 'Try asking to prioritize, split tasks, or plan the week.',
        subtasks: ['Example: “Prioritize my tasks”', 'Example: “Break down project X”', 'Example: “Plan my week”']
      })
    }

    return NextResponse.json({ suggestions })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to generate suggestions' }, { status: 500 })
  }
}

