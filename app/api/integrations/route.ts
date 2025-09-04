import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateUser } from '@/lib/user'

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
    const supa = createClient()
    const { data, error } = await supa
      .from('integrations')
      .select('id, name, type, status, connectedAt, lastSync, userEmail, features')
      .eq('userId', user.id)
    if (error) throw error

    return NextResponse.json(data || [])

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
    const supa = createClient()
    const { data: existingIntegration } = await supa
      .from('integrations')
      .select('id')
      .eq('userId', user.id)
      .eq('type', type)
      .eq('userEmail', userEmail)
      .maybeSingle()

    const baseData: any = {
      userId: user.id,
      type,
      name,
      accessToken,
      refreshToken: refreshToken || null,
      userEmail,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      status: 'connected',
      connectedAt: new Date().toISOString(),
      features: {
        calendar: true,
        email: true,
        storage: false,
        chat: false,
        tasks: false,
        ...(type === 'google' && { sheets: false })
      }
    }

    if (existingIntegration) {
      const { data, error } = await supa
        .from('integrations')
        .update(baseData)
        .eq('id', existingIntegration.id)
        .select('*')
        .single()
      if (error) throw error
      return NextResponse.json(data)
    }

    const { data: created, error } = await supa
      .from('integrations')
      .insert(baseData)
      .select('*')
      .single()

    if (error) throw error

    return NextResponse.json(created)

  } catch (error) {
    console.error('Error creating integration:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

