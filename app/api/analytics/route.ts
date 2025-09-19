import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Simple analytics endpoint returning summary counts and 14-day timeseries for tasks
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const url = new URL(request.url)
    const days = Math.max(1, Math.min(90, Number(url.searchParams.get('days') || 14)))

    const { data: appUser } = await supabase
      .from('users')
      .select('id')
      .eq('supabaseId', user.id)
      .maybeSingle()
    if (!appUser?.id) return NextResponse.json({ summary: {}, timeseries: {} })

    const sinceISO = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString()

    const [projectsCount, tasksCount, tasksCompletedCount, companiesCount, contactsCount, notesCount] = await Promise.all([
      supabase.from('projects').select('id', { count: 'exact', head: true }).eq('userId', appUser.id),
      supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('userId', appUser.id),
      supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('userId', appUser.id).eq('status', 'COMPLETED'),
      supabase.from('companies').select('id', { count: 'exact', head: true }).eq('userId', appUser.id),
      supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('userId', appUser.id),
      supabase.from('notes').select('id', { count: 'exact', head: true }).eq('userId', appUser.id),
    ])

    const [recentTasks, recentCompleted] = await Promise.all([
      supabase.from('tasks').select('id, createdAt').eq('userId', appUser.id).gte('createdAt', sinceISO),
      supabase.from('tasks').select('id, completedAt').eq('userId', appUser.id).not('completedAt', 'is', null).gte('completedAt', sinceISO),
    ])

    function toDateKey(dt: string | null | undefined) {
      if (!dt) return null
      const d = new Date(dt)
      const yyyy = d.getUTCFullYear()
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
      const dd = String(d.getUTCDate()).padStart(2, '0')
      return `${yyyy}-${mm}-${dd}`
    }

    function rangeKeys(days: number) {
      const keys: string[] = []
      const now = new Date()
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 3600 * 1000)
        const yyyy = d.getUTCFullYear()
        const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
        const dd = String(d.getUTCDate()).padStart(2, '0')
        keys.push(`${yyyy}-${mm}-${dd}`)
      }
      return keys
    }

    const createdCounts: Record<string, number> = {}
    const completedCounts: Record<string, number> = {}
    for (const row of recentTasks.data || []) {
      const key = toDateKey((row as any).createdAt)
      if (key) createdCounts[key] = (createdCounts[key] || 0) + 1
    }
    for (const row of recentCompleted.data || []) {
      const key = toDateKey((row as any).completedAt)
      if (key) completedCounts[key] = (completedCounts[key] || 0) + 1
    }

    const keys = rangeKeys(days)
    const tasksCreated = keys.map(k => ({ date: k, count: createdCounts[k] || 0 }))
    const tasksCompleted = keys.map(k => ({ date: k, count: completedCounts[k] || 0 }))

    const summary = {
      projects: projectsCount.count || 0,
      tasks: { total: tasksCount.count || 0, completed: tasksCompletedCount.count || 0 },
      companies: companiesCount.count || 0,
      contacts: contactsCount.count || 0,
      notes: notesCount.count || 0,
    }

    return NextResponse.json({ summary, timeseries: { tasksCreated, tasksCompleted } })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load analytics' }, { status: 500 })
  }
}

