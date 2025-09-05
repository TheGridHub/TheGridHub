import { NextRequest, NextResponse } from 'next/server'
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
      .from('team_memberships')
      .select('*')
      .eq('userId', user.id)

    if (error) throw error
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching team:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const currentUser = await getOrCreateUser(supabaseUser)
    if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Only owners/admins can invite
    const { data: roleCheck } = await supabase
      .from('team_memberships')
      .select('role')
      .eq('userId', currentUser.id)
      .order('createdAt', { ascending: true })
      .limit(1)
      .maybeSingle()
    const currentRole = roleCheck?.role || 'member'
    if (currentRole !== 'owner' && currentRole !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions. Only owners and admins can invite.' }, { status: 403 })
    }

    const body = await req.json()
    if (!body?.email || typeof body.email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    const desiredRole = body.role || 'member'
    if (!['owner','admin','member'].includes(desiredRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Find user by email
    const { data: foundUser, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('email', body.email)
      .single()
    if (findError || !foundUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Prevent duplicate membership
    const { data: existing } = await supabase
      .from('team_memberships')
      .select('id')
      .eq('userId', foundUser.id)
      .maybeSingle()
    if (existing) {
      return NextResponse.json({ error: 'User is already a team member' }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('team_memberships')
      .insert({
        userId: foundUser.id,
        role: desiredRole
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error adding team member:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

