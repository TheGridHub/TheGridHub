import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateUser } from '@/lib/user'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const dbUser = await getOrCreateUser(supabaseUser)
    if (!dbUser) return NextResponse.json({ error: 'Profile not initialized' }, { status: 400 })

    const updates: any = {}
    if (body.name !== undefined) updates.name = body.name
    if (body.description !== undefined) updates.description = body.description
    if (body.color !== undefined) updates.color = body.color
    if (body.slackDefaultChannelId !== undefined) updates.slackDefaultChannelId = body.slackDefaultChannelId
    if (body.jiraProjectKey !== undefined) updates.jiraProjectKey = body.jiraProjectKey

    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', params.id)
      .eq('userId', dbUser.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()
    if (!supabaseUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await getOrCreateUser(supabaseUser)
    if (!dbUser) return NextResponse.json({ error: 'Profile not initialized' }, { status: 400 })

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', params.id)
      .eq('userId', dbUser.id)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

