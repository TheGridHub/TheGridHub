import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// List companies (with optional search & pagination) and create a company

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const url = new URL(request.url)
  const q = url.searchParams.get('q')?.trim()
  const limit = Math.max(1, Math.min(100, Number(url.searchParams.get('limit') || 25)))
  const offset = Math.max(0, Number(url.searchParams.get('offset') || 0))

  const { data: appUser } = await supabase
    .from('users')
    .select('id')
    .eq('supabaseId', user.id)
    .maybeSingle()

  if (!appUser?.id) return NextResponse.json({ companies: [], count: 0 })

  let query = supabase
    .from('companies')
    .select('*', { count: 'exact' })
    .eq('userId', appUser.id)

  if (q) {
    const pattern = `%${q}%`
    query = query.or(`name.ilike.${pattern},domain.ilike.${pattern},website.ilike.${pattern}`)
  }

  query = query.order('createdAt', { ascending: false }).range(offset, offset + limit - 1)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ companies: data || [], count: count || 0 })
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const { name, domain, website, industry, size, tags, description } = body || {}
  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
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
    body: JSON.stringify({ action: 'create_company' })
  })
  const limit = await limitRes.json()
  if (!limit.allowed) return NextResponse.json(limit, { status: 200 })

  const insert = {
    name,
    domain: domain || null,
    website: website || null,
    industry: industry || null,
    size: size || null,
    tags: Array.isArray(tags) ? tags : [],
    description: description || null,
    userId: appUser.id as string,
  }

  const { data, error } = await supabase
    .from('companies')
    .insert(insert)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Record activity event (best-effort)
  try {
    await supabase.from('activity_events').insert({
      userId: appUser.id as string,
      type: 'created',
      targetType: 'company',
      targetId: (data as any).id,
      metadata: { name: (data as any).name }
    } as any)
  } catch {}

  return NextResponse.json({ company: data })
}

