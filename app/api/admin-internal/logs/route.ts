import { NextRequest, NextResponse } from 'next/server'
import { ensureInternalAuth } from '@/lib/internal-admin/auth'
import { createServiceClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    ensureInternalAuth()
    const level = (new URL(req.url).searchParams.get('level') || '').toLowerCase()
    const supa = createServiceClient()
    let query = supa.from('app_logs').select('*').order('created_at', { ascending: false }).limit(200)
    if (level) {
      query = query.eq('level', level)
    }
    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ logs: data || [] })
  } catch (e:any) {
    // If table missing, return empty
    return NextResponse.json({ logs: [] })
  }
}

