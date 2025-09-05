import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const q = url.searchParams.get('q') || ''
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const pageSize = Math.min(parseInt(url.searchParams.get('pageSize') || '20', 10), 100)

    // Supabase auth admin users list is not directly exposed via supabase-js in SSR cookies API,
    // so we list from our own 'users' table and include email from profile if available.
    const supa = createServiceClient()

    let query = supa.from('users')
      .select('id, email, name, createdAt')
      .order('createdAt', { ascending: false })
      .range((page-1)*pageSize, (page-1)*pageSize + pageSize - 1)

    if (q) {
      query = query.ilike('email', `%${q}%`)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ users: data || [], page, pageSize })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Failed to list users' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(()=>({}))
    const { userId } = body
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    const supa = createServiceClient()

    // Look up Supabase Auth user id (supabaseId)
    const { data: userRow } = await supa.from('users').select('supabaseId').eq('id', userId).maybeSingle()
    const supabaseId = userRow?.supabaseId as string | undefined

    // Danger zone: cascade delete user-related data
    const tables = [
      'notifications', 'tasks', 'goals', 'team_memberships', 'user_onboarding', 'projects'
    ]
    for (const t of tables) {
      await supa.from(t).delete().eq('userId', userId)
    }
    await supa.from('users').delete().eq('id', userId)

    // Delete Supabase Auth user (if available)
    if (supabaseId) {
      try {
        await (supa as any).auth.admin.deleteUser(supabaseId)
      } catch (e) {
        // Non-fatal: log only on server
        console.error('[admin-internal] Failed to delete auth user', supabaseId, e)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Failed to delete user' }, { status: 500 })
  }
}

