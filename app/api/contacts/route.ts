import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// List contacts (filters & pagination) and create a contact

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const url = new URL(request.url)
  const q = url.searchParams.get('q')?.trim()
  const companyId = url.searchParams.get('companyId') || undefined
  const status = url.searchParams.get('status') || undefined
  const tag = url.searchParams.get('tag') || undefined
  const limit = Math.max(1, Math.min(100, Number(url.searchParams.get('limit') || 25)))
  const offset = Math.max(0, Number(url.searchParams.get('offset') || 0))

  const { data: appUser } = await supabase
    .from('users')
    .select('id')
    .eq('supabaseId', user.id)
    .maybeSingle()

  if (!appUser?.id) return NextResponse.json({ contacts: [], count: 0 })

  let query = supabase
    .from('contacts')
    .select('*', { count: 'exact' })
    .eq('userId', appUser.id)

  if (companyId) query = query.eq('companyId', companyId)
  if (status) query = query.eq('status', status)
  if (tag) query = query.contains('tags', [tag])
  if (q) {
    const pattern = `%${q}%`
    query = query.or(`firstName.ilike.${pattern},lastName.ilike.${pattern},email.ilike.${pattern}`)
  }

  query = query.order('createdAt', { ascending: false }).range(offset, offset + limit - 1)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ contacts: data || [], count: count || 0 })
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const { firstName, lastName, email, phone, title, status, tags, companyId, avatarUrl } = body || {}
  if (!email && !firstName && !lastName) {
    return NextResponse.json({ error: 'At least one of email or name is required' }, { status: 400 })
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
    body: JSON.stringify({ action: 'create_contact' })
  })
  const limit = await limitRes.json()
  if (!limit.allowed) return NextResponse.json(limit, { status: 200 })

  const insert = {
    firstName: firstName || null,
    lastName: lastName || null,
    email: email || null,
    phone: phone || null,
    title: title || null,
    status: (status || 'active').toLowerCase(),
    tags: Array.isArray(tags) ? tags : [],
    companyId: companyId || null,
    avatarUrl: avatarUrl || null,
    userId: appUser.id as string,
  }

  const { data, error } = await supabase
    .from('contacts')
    .insert(insert)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Record activity event (best-effort)
  try {
    await supabase.from('activity_events').insert({
      userId: appUser.id as string,
      type: 'created',
      targetType: 'contact',
      targetId: (data as any).id,
      metadata: { email: (data as any).email }
    } as any)
  } catch {}

  return NextResponse.json({ contact: data })
}

