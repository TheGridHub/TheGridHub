import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const team = await prisma.teamMembership.findMany({ where: { userId } })
    return NextResponse.json(team)
  } catch (error) {
    console.error('Error fetching team:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    // Find user by email
    const user = await prisma.user.findUnique({ where: { email: body.email } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const membership = await prisma.teamMembership.create({
      data: {
        userId: user.id,
        role: body.role || 'member'
      }
    })

    return NextResponse.json(membership, { status: 201 })
  } catch (error) {
    console.error('Error adding team member:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

