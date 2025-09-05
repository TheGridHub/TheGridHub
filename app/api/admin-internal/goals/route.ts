import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { ensureInternalAuth } from '@/lib/internal-admin/auth'
import { adminAuditLog } from '@/lib/internal-admin/audit'

export async function GET(req: NextRequest) {
  try {
    ensureInternalAuth()
    const url = new URL(req.url)
    const q = url.searchParams.get('q') || ''
    const userId = url.searchParams.get('userId') || ''
    const projectId = url.searchParams.get('projectId') || ''
    const status = url.searchParams.get('status') || ''
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const pageSize = Math.min(parseInt(url.searchParams.get('pageSize') || '20', 10), 100)

    const supa = createServiceClient()
    let query = supa.from('goals')
      .select('id, title, status, userId, projectId, createdAt')
      .order('createdAt', { ascending: false })
      .range((page-1)*pageSize, (page-1)*pageSize + pageSize - 1)

    if (q) query = query.ilike('title', `%${q}%`)
    if (userId) query = query.eq('userId', userId)
    if (projectId) query = query.eq('projectId', projectId)
    if (status) query = query.eq('status', status)

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ goals: data || [], page, pageSize })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Failed to list goals' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = ensureInternalAuth('owner')
    const body = await req.json().catch(()=>({}))
    const ids: string[] = Array.isArray(body?.ids) ? body.ids : []
    if (!ids.length) return NextResponse.json({ error: 'Missing ids' }, { status: 400 })

    const supa = createServiceClient()
    await supa.from('goals').delete().in('id', ids)

    await adminAuditLog(auth, 'goals.bulk_delete', { count: ids.length })
    return NextResponse.json({ ok: true })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Failed to delete goals' }, { status: 500 })
  }
}

