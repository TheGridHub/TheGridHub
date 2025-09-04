import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateUser } from '@/lib/user'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await getOrCreateUser(supabaseUser)
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    return NextResponse.json(dbUser)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    const dbUser = await getOrCreateUser(supabaseUser)
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { data, error } = await supabase
      .from('users')
      .update({
        name: body.name ?? dbUser.name,
        email: body.email ?? dbUser.email,
        avatar: body.avatar ?? dbUser.avatar,
      })
      .eq('id', dbUser.id)
      .select('*')
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

