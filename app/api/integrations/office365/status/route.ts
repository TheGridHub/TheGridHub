import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateUser } from '@/lib/user'

export async function GET(_req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ connected: false }, { status: 200 })

    const dbUser = await getOrCreateUser(user)
    if (!dbUser) return NextResponse.json({ connected: false }, { status: 200 })

    const { data: integration } = await supabase
      .from('integrations')
      .select('userEmail, status')
      .eq('userId', dbUser.id)
      .eq('type', 'office365')
      .eq('status', 'connected')
      .maybeSingle()

    return NextResponse.json({
      connected: !!integration,
      userEmail: (integration as any)?.userEmail || null
    })
  } catch (error) {
    console.error('Office365 status error:', error)
    return NextResponse.json({ connected: false }, { status: 200 })
  }
}

