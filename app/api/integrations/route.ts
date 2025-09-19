import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([])

  const { data: appUser } = await supabase
    .from('users')
    .select('id')
    .eq('supabaseId', user.id)
    .maybeSingle()
  if (!appUser?.id) return NextResponse.json([])

  const { data } = await supabase
    .from('integrations')
    .select('id, type, name, status, userEmail, connectedAt, lastSync, features')
    .eq('userId', appUser.id)
    .order('connectedAt', { ascending: false })

  return NextResponse.json(data || [])
}

