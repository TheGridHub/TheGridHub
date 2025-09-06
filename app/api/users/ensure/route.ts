import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(_req: NextRequest) {
  try {
    // Get the authenticated user from cookies
    const supa = createClient()
    const { data: { user } } = await supa.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = createServiceClient()

    // 1) Try by supabaseId
    const byId = await service
      .from('users')
      .select('id')
      .eq('supabaseId', user.id)
      .maybeSingle()

    if (byId.data?.id) {
      return NextResponse.json({ id: byId.data.id })
    }

    // 2) Try existing row by email, link supabaseId
    const email = user.email || null
    if (email) {
      const byEmail = await service
        .from('users')
        .select('id, supabaseId')
        .eq('email', email)
        .maybeSingle()

      if (byEmail.data?.id) {
        const updated = await service
          .from('users')
          .update({ supabaseId: user.id })
          .eq('id', byEmail.data.id)
          .select('id')
          .single()
        if (updated.data?.id) {
          return NextResponse.json({ id: updated.data.id })
        }
      }
    }

    // 3) Create a new row
    const md: any = user.user_metadata || {}
    const name = md.full_name || md.first_name || (email ? email.split('@')[0] : 'User')
    const avatar = md.avatar_url || (email ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D9488&color=fff` : null)

    const created = await service
      .from('users')
      .insert({
        supabaseId: user.id,
        email: email,
        name,
        avatar,
      })
      .select('id')
      .single()

    return NextResponse.json({ id: created.data?.id })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to ensure user' }, { status: 500 })
  }
}

