import { NextRequest, NextResponse } from 'next/server'
import { ensureInternalAuth } from '@/lib/internal-admin/auth'
import { createServiceClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const auth = ensureInternalAuth('owner')
    const { action } = await req.json().catch(()=> ({ action: '' }))
    const supa = createServiceClient()

    if (action === 'purge_logs') {
      // Delete app_logs older than 30 days if table exists
      try {
        const { error } = await supa.rpc('purge_old_logs', { days: 30 } as any)
        if (error) throw error
      } catch {
        // Fallback: best-effort delete if function not present
        await supa.from('app_logs').delete().lt('created_at', new Date(Date.now() - 30*24*60*60*1000).toISOString())
      }
      return NextResponse.json({ ok: true })
    }

    if (action === 'purge_notifications') {
      // Delete notifications older than 90 days
      await supa.from('notifications').delete().lt('createdAt', new Date(Date.now() - 90*24*60*60*1000).toISOString())
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e:any) {
    const status = e?.status || 500
    return NextResponse.json({ error: e?.message || 'Maintenance failed' }, { status })
  }
}

