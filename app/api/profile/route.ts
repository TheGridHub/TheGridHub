import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    // Ensure a user record exists for the Clerk user
    let user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) {
      user = await prisma.user.create({ data: { clerkId: userId, email: body.email || `${userId}@placeholder.local` } })
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: body.name,
        email: body.email,
        avatar: body.avatar
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

