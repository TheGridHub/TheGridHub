import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const today = new Date().toISOString().slice(0,10)
  const { data } = await supabase
    .from('ai_usage')
    .select('count')
    .eq('user_id', user.id)
    .eq('day', today)
    .maybeSingle()

  const used = data?.count || 0
  return NextResponse.json({ used })
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { amount = 1 } = await request.json().catch(() => ({ amount: 1 }))
  const today = new Date().toISOString().slice(0,10)

  // Upsert increment
  const { data, error } = await supabase
    .from('ai_usage')
    .upsert({ user_id: user.id, day: today }, { onConflict: 'user_id,day' })
    .select('*')
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const current = data?.count || 0
  const { data: updated, error: err2 } = await supabase
    .from('ai_usage')
    .update({ count: current + Number(amount || 1) })
    .eq('user_id', user.id)
    .eq('day', today)
    .select('count')
    .maybeSingle()

  if (err2) return NextResponse.json({ error: err2.message }, { status: 500 })

  return NextResponse.json({ used: updated?.count || current + Number(amount || 1) })
}
