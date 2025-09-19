import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { size, contentType, ext } = await request.json()
    if (!size || !contentType) return NextResponse.json({ error: 'size and contentType required' }, { status: 400 })

    // Enforce plan
    const chk = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/subscription/check-limit`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'upload_file', fileSize: size })
    })
    const allow = await chk.json()
    if (!allow.allowed) return NextResponse.json(allow, { status: 200 })

    // Get a presigned URL
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/storage/presign`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contentType, folder: 'projects', ext })
    })
    const data = await res.json()

    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to presign' }, { status: 500 })
  }
}
