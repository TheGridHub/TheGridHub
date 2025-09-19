import { NextRequest, NextResponse } from 'next/server'
import { ensureInternalAuth } from '@/lib/internal-admin/auth'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(_req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    ensureInternalAuth('owner')
    const supa = createServiceClient()
    const userId = params.userId

    const { data: user } = await supa
      .from('users')
      .select('supabaseId, email')
      .eq('id', userId)
      .maybeSingle()

    const supabaseId = (user as any)?.supabaseId
    if (!supabaseId) return NextResponse.json({ error: 'Missing supabaseId' }, { status: 400 })

    const { error } = await (supa as any).auth.admin.invalidateRefreshTokens(supabaseId)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to invalidate sessions' }, { status: 500 })
  }
}

