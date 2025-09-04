import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateUser } from '@/lib/user'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()
    
    if (!supabaseUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await getOrCreateUser(supabaseUser)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Fetch user's integrations
    const integrations = await db.integration.findMany({
      where: { userId: user.id },
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
    const supabase = createClient()
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()
    
    if (!supabaseUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await getOrCreateUser(supabaseUser)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
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
        userId: user.id,
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
        userId: user.id,
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

