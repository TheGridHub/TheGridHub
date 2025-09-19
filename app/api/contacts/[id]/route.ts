import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { id } = params

  const { data: appUser } = await supabase
    .from('users')
    .select('id')
    .eq('supabaseId', user.id)
    .maybeSingle()
  if (!appUser?.id) return NextResponse.json({ error: 'User missing' }, { status: 400 })

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('userId', appUser.id)
    .eq('id', id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ contact: data })
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { id } = params
  const body = await request.json().catch(() => ({}))
  const allowed = ['firstName','lastName','email','phone','title','status','tags','companyId','avatarUrl'] as const
  const update: any = {}
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }
  if (Object.keys(update).length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 })

  const { data: appUser } = await supabase
    .from('users')
    .select('id')
    .eq('supabaseId', user.id)
    .maybeSingle()
  if (!appUser?.id) return NextResponse.json({ error: 'User missing' }, { status: 400 })

  const { data, error } = await supabase
    .from('contacts')
    .update(update)
    .eq('userId', appUser.id)
    .eq('id', id)
    .select('*')
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Record activity event (best-effort)
  try {
    await supabase.from('activity_events').insert({
      userId: appUser.id as string,
      type: 'updated',
      targetType: 'contact',
      targetId: id,
      metadata: { fields: Object.keys(update) }
    } as any)
  } catch {}

  return NextResponse.json({ contact: data })
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { id } = params

  const { data: appUser } = await supabase
    .from('users')
    .select('id')
    .eq('supabaseId', user.id)
    .maybeSingle()
  if (!appUser?.id) return NextResponse.json({ error: 'User missing' }, { status: 400 })

  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('userId', appUser.id)
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Record activity event (best-effort)
  try {
    await supabase.from('activity_events').insert({
      userId: appUser.id as string,
      type: 'deleted',
      targetType: 'contact',
      targetId: id,
      metadata: {}
    } as any)
  } catch {}

  return NextResponse.json({ success: true })
}

