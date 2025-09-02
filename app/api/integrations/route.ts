import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch user's integrations
    const integrations = await db.integration.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        connectedAt: true,
        lastSync: true,
        userEmail: true,
        features: true
      }
    })

    return NextResponse.json(integrations)

  } catch (error) {
    console.error('Error fetching integrations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { type, name, accessToken, refreshToken, userEmail, expiresAt } = body

    if (!type || !name || !accessToken || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if integration already exists
    const existingIntegration = await db.integration.findFirst({
      where: {
        userId,
        type,
        userEmail
      }
    })

    if (existingIntegration) {
      // Update existing integration
      const updatedIntegration = await db.integration.update({
        where: { id: existingIntegration.id },
        data: {
          name,
          accessToken,
          refreshToken,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          status: 'connected',
          connectedAt: new Date(),
          features: {
            calendar: true,
            email: true,
            storage: false,
            chat: false,
            tasks: false,
            ...(type === 'google' && { sheets: false })
          }
        }
      })

      return NextResponse.json(updatedIntegration)
    }

    // Create new integration
    const integration = await db.integration.create({
      data: {
        userId,
        type,
        name,
        accessToken,
        refreshToken,
        userEmail,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        status: 'connected',
        connectedAt: new Date(),
        features: {
          calendar: true,
          email: true,
          storage: false,
          chat: false,
          tasks: false,
          ...(type === 'google' && { sheets: false })
        }
      }
    })

    return NextResponse.json(integration)

  } catch (error) {
    console.error('Error creating integration:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
