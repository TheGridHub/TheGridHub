import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { ensureInternalAuth } from '@/lib/internal-admin/auth'
import { adminAuditLog } from '@/lib/internal-admin/audit'

export async function GET(req: NextRequest) {
  try {
    ensureInternalAuth()
    const url = new URL(req.url)
    const userId = url.searchParams.get('userId') || ''
    const unreadOnly = url.searchParams.get('unread') === '1'
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const pageSize = Math.min(parseInt(url.searchParams.get('pageSize') || '20', 10), 100)

    const supa = createServiceClient()
    let query = supa.from('notifications')
      .select('id, userId, title, body, read, createdAt')
      .order('createdAt', { ascending: false })
      .range((page-1)*pageSize, (page-1)*pageSize + pageSize - 1)

    if (userId) query = query.eq('userId', userId)
    if (unreadOnly) query = query.eq('read', false)

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ notifications: data || [], page, pageSize })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Failed to list notifications' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = ensureInternalAuth('owner')
    const body = await req.json().catch(()=>({}))
    const ids: string[] = Array.isArray(body?.ids) ? body.ids : []
    if (!ids.length) return NextResponse.json({ error: 'Missing ids' }, { status: 400 })

    const supa = createServiceClient()
    await supa.from('notifications').delete().in('id', ids)

    await adminAuditLog(auth, 'notifications.bulk_delete', { count: ids.length })
    return NextResponse.json({ ok: true })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Failed to delete notifications' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = ensureInternalAuth()
    const body = await req.json().catch(()=>({}))
    const ids: string[] = Array.isArray(body?.ids) ? body.ids : []
    const read = !!body?.read
    if (!ids.length) return NextResponse.json({ error: 'Missing ids' }, { status: 400 })

    const supa = createServiceClient()
    await supa.from('notifications').update({ read }).in('id', ids)

    await adminAuditLog(auth, 'notifications.bulk_update', { count: ids.length, read })
    return NextResponse.json({ ok: true })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Failed to update notifications' }, { status: 500 })
  }
}

