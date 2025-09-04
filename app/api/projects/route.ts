import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) user = await prisma.user.create({ data: { clerkId: userId, email: `${userId}@placeholder.local` } })

    const projects = await prisma.project.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    let user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) user = await prisma.user.create({ data: { clerkId: userId, email: `${userId}@placeholder.local` } })

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

