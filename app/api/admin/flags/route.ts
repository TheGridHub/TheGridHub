import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getOrCreateUser } from '@/lib/user'

export async function GET() {
  try {
    const supa = createServiceClient()
    const { data } = await supa.from('feature_flags').select('key, enabled, description, is_public, updated_at').order('key')
    return NextResponse.json({ flags: data || [] })
  } catch (e) {
    return NextResponse.json({ flags: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supaUserClient = createClient()
    const { data: { user } } = await supaUserClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await getOrCreateUser(user)
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // role check owner/admin
    const { data: roleCheck } = await supaUserClient.from('team_memberships').select('role').eq('userId', dbUser.id).order('createdAt', { ascending: true }).limit(1).maybeSingle()
    const role = String(roleCheck?.role || '').toLowerCase()
    if (!['owner','admin'].includes(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json().catch(()=> ({}))
    const { key, enabled, description, isPublic } = body
    if (!key || typeof key !== 'string') return NextResponse.json({ error: 'Invalid key' }, { status: 400 })

    const service = createServiceClient()
    const { data, error } = await service.from('feature_flags').upsert({ key, enabled: !!enabled, description: description || null, is_public: isPublic === undefined ? true : !!isPublic }).select('*').single()
    if (error) throw error

    return NextResponse.json({ flag: data })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to upsert flag' }, { status: 500 })
  }
}

