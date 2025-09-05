import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateUser } from '@/lib/user'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await getOrCreateUser(supabaseUser)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('userId', user.id)
      .order('createdAt', { ascending: false })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching goals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await getOrCreateUser(supabaseUser)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const body = await req.json()

    const { data, error } = await supabase
      .from('goals')
      .insert({
        title: body.title,
        description: body.description || null,
        target: body.target ?? 100,
        current: body.current ?? 0,
        type: body.type || 'CUSTOM',
        deadline: body.deadline || null,
        userId: user.id
      })
      .select('*')
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating goal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

