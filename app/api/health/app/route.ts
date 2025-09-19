import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Basic runtime sanity check
    const envOk = !!process.env.NEXT_PUBLIC_APP_URL
    return NextResponse.json({ ok: true, envOk })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'App health failed' }, { status: 500 })
  }
}

