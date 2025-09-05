import { NextResponse } from 'next/server'
import { ensureInternalAuth } from '@/lib/internal-admin/auth'
import { createServiceClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET() {
  try {
    ensureInternalAuth()
    const supa = createServiceClient()
    const { data } = await supa
      .from('feature_flags')
      .select('key, enabled, description, is_public, updated_at')
      .order('key')
    return NextResponse.json({ flags: data || [] })
  } catch (e:any) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(req: Request) {
  try {
    const auth = ensureInternalAuth('owner')
    const body = await req.json().catch(()=> ({} as any))
    const { key, enabled, description, isPublic } = body
    if (!key || typeof key !== 'string') return NextResponse.json({ error: 'Invalid key' }, { status: 400 })

    const service = createServiceClient()
    const { data, error } = await service
      .from('feature_flags')
      .upsert({ 
        key, 
        enabled: !!enabled, 
        description: description || null, 
        is_public: isPublic === undefined ? true : !!isPublic 
      })
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json({ flag: data })
  } catch (e:any) {
    const status = e?.status || 500
    return NextResponse.json({ error: 'Failed to upsert flag' }, { status })
  }
}

