import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateUser } from '@/lib/user'

// Helper function to check if user has admin/owner role (any membership)
async function checkUserRole(supabase: ReturnType<typeof createClient>, userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('team_memberships')
    .select('role')
    .eq('userId', userId)
    .order('createdAt', { ascending: true })
    .limit(1)
    .maybeSingle()
  return data?.role || null
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const currentUser = await getOrCreateUser(supabaseUser)
    if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Get the membership being updated
    const { data: targetMembership } = await supabase
      .from('team_memberships')
      .select('*')
      .eq('id', params.id)
      .single()
    
    if (!targetMembership) {
      return NextResponse.json({ error: 'Membership not found' }, { status: 404 })
    }

    // Check if current user has permission (must be owner or admin)
    const currentUserRole = await checkUserRole(supabase, currentUser.id)
    
    if (currentUserRole !== 'owner' && currentUserRole !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions. Only owners and admins can modify team members.' }, { status: 403 })
    }

    const body = await req.json()
    if (!body || typeof body.role !== 'string') {
      return NextResponse.json({ error: 'Missing role' }, { status: 400 })
    }

    const { data: updated, error } = await supabase
      .from('team_memberships')
      .update({ role: body.role })
      .eq('id', params.id)
      .select('*')
      .single()

    if (error) throw error

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating team member:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const currentUser = await getOrCreateUser(supabaseUser)
    if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Get the membership being deleted
    const { data: targetMembership } = await supabase
      .from('team_memberships')
      .select('*')
      .eq('id', params.id)
      .single()
    
    if (!targetMembership) {
      return NextResponse.json({ error: 'Membership not found' }, { status: 404 })
    }

    // Check if current user has permission (must be owner or admin)
    const currentUserRole = await checkUserRole(supabase, currentUser.id)
    
    if (currentUserRole !== 'owner' && currentUserRole !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions. Only owners and admins can remove team members.' }, { status: 403 })
    }

    const { data: deleted, error } = await supabase
      .from('team_memberships')
      .delete()
      .eq('id', params.id)
      .select('id')
      .single()

    if (error) throw error

    return NextResponse.json({ ok: true, id: deleted?.id })
  } catch (error) {
    console.error('Error deleting team member:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

