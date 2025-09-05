import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const q = url.searchParams.get('q') || ''
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const pageSize = Math.min(parseInt(url.searchParams.get('pageSize') || '20', 10), 100)

    const supa = createServiceClient()
    let query = supa
      .from('projects')
      .select('id, name, description, color, userId, createdAt')
      .order('createdAt', { ascending: false })
      .range((page-1)*pageSize, (page-1)*pageSize + pageSize - 1)

    if (q) {
      query = query.ilike('name', `%${q}%`)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ projects: data || [], page, pageSize })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Failed to list projects' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(()=>({}))
    const { projectId } = body
    if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })

    const supa = createServiceClient()

    // Delete child content first
    await supa.from('tasks').delete().eq('projectId', projectId)
    await supa.from('goals').delete().eq('projectId', projectId)

    await supa.from('projects').delete().eq('id', projectId)

    return NextResponse.json({ ok: true })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Failed to delete project' }, { status: 500 })
  }
}

