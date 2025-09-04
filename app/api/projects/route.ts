import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateUser } from '@/lib/user'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await getOrCreateUser(supabaseUser)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const projects = await prisma.project.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const user = await getOrCreateUser(supabaseUser)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const project = await prisma.project.create({
      data: {
        name: body.name,
        description: body.description,
        color: body.color || '#6366f1',
        userId: user.id
      }
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

