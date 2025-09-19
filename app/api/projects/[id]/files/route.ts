import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([])

  const { data } = await supabase
    .from('project_files')
    .select('id, key, url, size_bytes, created_at')
    .eq('user_id', user.id)
    .eq('project_id', params.id)
    .order('created_at', { ascending: false })

  return NextResponse.json(data || [])
}
