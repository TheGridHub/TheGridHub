import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateUser } from '@/lib/user'
import prisma from '@/lib/prisma'

// Helper function to check if user has admin/owner role
async function checkUserRole(userId: string, teamId?: string): Promise<string | null> {
  // Get the user's membership
  const membership = await prisma.teamMembership.findFirst({
    where: {
      userId: userId,
      // If teamId is provided, check for that specific team
      ...(teamId && { teamId })
    },
    orderBy: {
      createdAt: 'asc' // Get the oldest membership (likely owner)
    }
  })
  
  return membership?.role || null
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const currentUser = await getOrCreateUser(supabaseUser)
    if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Get the membership being updated
    const targetMembership = await prisma.teamMembership.findUnique({
      where: { id: params.id }
    })
    
    if (!targetMembership) {
      return NextResponse.json({ error: 'Membership not found' }, { status: 404 })
    }

    // Check if current user has permission (must be owner or admin)
    const currentUserRole = await checkUserRole(currentUser.id, targetMembership.teamId)
    
    if (currentUserRole !== 'owner' && currentUserRole !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions. Only owners and admins can modify team members.' }, { status: 403 })
    }

    const body = await req.json()
    if (!body || typeof body.role !== 'string') {
      return NextResponse.json({ error: 'Missing role' }, { status: 400 })
    }

    // Prevent demoting the last owner
    if (targetMembership.role === 'owner' && body.role !== 'owner') {
      const ownerCount = await prisma.teamMembership.count({
        where: {
          teamId: targetMembership.teamId,
          role: 'owner'
        }
      })
      
      if (ownerCount <= 1) {
        return NextResponse.json({ error: 'Cannot demote the last owner' }, { status: 400 })
      }
    }

    const updated = await prisma.teamMembership.update({
      where: { id: params.id },
      data: { role: body.role }
    })

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
    const targetMembership = await prisma.teamMembership.findUnique({
      where: { id: params.id }
    })
    
    if (!targetMembership) {
      return NextResponse.json({ error: 'Membership not found' }, { status: 404 })
    }

    // Check if current user has permission (must be owner or admin)
    const currentUserRole = await checkUserRole(currentUser.id, targetMembership.teamId)
    
    if (currentUserRole !== 'owner' && currentUserRole !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions. Only owners and admins can remove team members.' }, { status: 403 })
    }

    // Prevent removing the last owner
    if (targetMembership.role === 'owner') {
      const ownerCount = await prisma.teamMembership.count({
        where: {
          teamId: targetMembership.teamId,
          role: 'owner'
        }
      })
      
      if (ownerCount <= 1) {
        return NextResponse.json({ error: 'Cannot remove the last owner' }, { status: 400 })
      }
    }

    // Prevent self-deletion if user is the last admin/owner
    if (targetMembership.userId === currentUser.id) {
      const adminOwnerCount = await prisma.teamMembership.count({
        where: {
          teamId: targetMembership.teamId,
          role: { in: ['owner', 'admin'] }
        }
      })
      
      if (adminOwnerCount <= 1) {
        return NextResponse.json({ error: 'Cannot remove yourself as the last admin/owner' }, { status: 400 })
      }
    }

    const membership = await prisma.teamMembership.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true, id: membership.id })
  } catch (error) {
    console.error('Error deleting team member:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

