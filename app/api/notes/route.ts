import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// List notes (filterable by entity) and create a note

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const url = new URL(request.url)
  const entityType = url.searchParams.get('entityType') || undefined
  const entityId = url.searchParams.get('entityId') || undefined
  const limit = Math.max(1, Math.min(100, Number(url.searchParams.get('limit') || 50)))
  const offset = Math.max(0, Number(url.searchParams.get('offset') || 0))

  const { data: appUser } = await supabase
    .from('users')
    .select('id')
    .eq('supabaseId', user.id)
    .maybeSingle()

  if (!appUser?.id) return NextResponse.json({ notes: [], count: 0 })

  let query = supabase
    .from('notes')
    .select('*', { count: 'exact' })
    .eq('userId', appUser.id)

  if (entityType) query = query.eq('entityType', entityType)
  if (entityId) query = query.eq('entityId', entityId)

  query = query.order('createdAt', { ascending: false }).range(offset, offset + limit - 1)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ notes: data || [], count: count || 0 })
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const { entityType, entityId, content, pinned } = body || {}
  if (!entityType || !entityId || !content) {
    return NextResponse.json({ error: 'entityType, entityId, and content are required' }, { status: 400 })
  }

  const { data: appUser } = await supabase
    .from('users')
    .select('id')
    .eq('supabaseId', user.id)
    .maybeSingle()
  if (!appUser?.id) return NextResponse.json({ error: 'User missing' }, { status: 400 })

  // Plan check
  const limitRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/subscription/check-limit`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create_note' })
  })
  const limit = await limitRes.json()
  if (!limit.allowed) return NextResponse.json(limit, { status: 200 })

  const insert = {
    entityType,
    entityId,
    content,
    pinned: Boolean(pinned) || false,
    userId: appUser.id as string,
  }

  const { data, error } = await supabase
    .from('notes')
    .insert(insert)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Record activity event (best-effort)
  try {
    await supabase.from('activity_events').insert({
      userId: appUser.id as string,
      type: 'note_added',
      targetType: entityType,
      targetId: entityId,
      metadata: { noteId: (data as any).id }
    } as any)
  } catch {}

  return NextResponse.json({ note: data })
}

