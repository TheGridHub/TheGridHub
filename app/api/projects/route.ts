import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { data: appUser } = await supabase
    .from('users')
    .select('id')
    .eq('supabaseId', user.id)
    .maybeSingle()

  if (!appUser?.id) return NextResponse.json({ projects: [] })

  const { data: rows, error } = await supabase
    .from('projects')
    .select('*')
    .eq('userId', appUser.id)
    .order('createdAt', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ projects: rows || [] })
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const name: string = body.name
    const description: string | undefined = body.description
    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })

    // find internal user id
    const { data: appUser } = await supabase
      .from('users')
      .select('id')
      .eq('supabaseId', user.id)
      .maybeSingle()

    if (!appUser?.id) return NextResponse.json({ error: 'User record missing' }, { status: 400 })

    // plan limit check using our API
    const limitRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/subscription/check-limit`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_project' })
    })
    const limit = await limitRes.json()
    if (!limit.allowed) return NextResponse.json(limit, { status: 200 })

    const { data, error } = await supabase
      .from('projects')
      .insert({ name, description, userId: appUser.id })
      .select('*')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ project: data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to create project' }, { status: 500 })
  }
}

