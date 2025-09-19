import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { key, url, size } = await request.json()
    if (!key || !size) return NextResponse.json({ error: 'key and size required' }, { status: 400 })

    await supabase.from('project_files').insert({
      user_id: user.id,
      project_id: params.id,
      key,
      url: url || null,
      size_bytes: Number(size)
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to record upload' }, { status: 500 })
  }
}
