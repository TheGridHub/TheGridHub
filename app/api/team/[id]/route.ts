import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateUser } from '@/lib/user'
import prisma from '@/lib/prisma'

// NOTE: This simplistic implementation assumes a single-workspace model.
// Tighten RBAC once team/workspace entities are modeled (e.g., only owner/admin can modify others).

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const currentUser = await getOrCreateUser(supabaseUser)
    if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const body = await req.json()
    if (!body || typeof body.role !== 'string') {
      return NextResponse.json({ error: 'Missing role' }, { status: 400 })
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

    const membership = await prisma.teamMembership.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true, id: membership.id })
  } catch (error) {
    console.error('Error deleting team member:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

