import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supa = createServiceClient()
    const { data, error } = await supa
      .from('team_memberships')
      .select('id, userId, role, createdAt')
      .order('createdAt', { ascending: false })
    if (error) throw error
    return NextResponse.json({ memberships: data || [] })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Failed to list memberships' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(()=>({}))
    const { membershipId } = body
    if (!membershipId) return NextResponse.json({ error: 'Missing membershipId' }, { status: 400 })

    const supa = createServiceClient()
    await supa.from('team_memberships').delete().eq('id', membershipId)
    return NextResponse.json({ ok: true })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Failed to delete membership' }, { status: 500 })
  }
}

