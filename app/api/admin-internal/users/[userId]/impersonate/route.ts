import { NextRequest, NextResponse } from 'next/server'
import { ensureInternalAuth } from '@/lib/internal-admin/auth'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(_req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    ensureInternalAuth('owner')
    const supa = createServiceClient()
    const userId = params.userId

    const { data: user } = await supa
      .from('users')
      .select('email')
      .eq('id', userId)
      .maybeSingle()

    if (!user?.email) return NextResponse.json({ error: 'User email not found' }, { status: 404 })

    const { data: linkData, error } = await (supa as any).auth.admin.generateLink({
      type: 'magiclink',
      email: user.email,
      options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard` }
    })
    if (error) throw error

    return NextResponse.json({ ok: true, action_link: linkData?.action_link })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Failed to generate impersonation link' }, { status: 500 })
  }
}

