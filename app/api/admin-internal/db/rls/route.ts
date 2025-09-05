import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Use app endpoints without auth to check that RLS prevents data leakage
    const endpoints = [
      '/api/projects',
      '/api/tasks',
      '/api/goals',
      '/api/notifications'
    ]
    const base = process.env.NEXT_PUBLIC_APP_URL || ''

    const results: Record<string, any> = {}
    await Promise.all(endpoints.map(async (p) => {
      try {
        const res = await fetch(`${base}${p}`, { cache: 'no-store' })
        results[p] = { status: res.status, ok: res.ok }
      } catch (e:any) {
        results[p] = { error: e?.message || String(e) }
      }
    }))

    return NextResponse.json({ ok: true, results })
  } catch (e:any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}

