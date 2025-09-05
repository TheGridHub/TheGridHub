import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateUser } from '@/lib/user'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await getOrCreateUser(user)

    // Get Google integration for this user
    const { data: integration } = await supabase
      .from('integrations')
      .select('accessToken')
      .eq('userId', dbUser?.id)
      .eq('type', 'google')
      .eq('status', 'connected')
      .maybeSingle()

    if (!integration) {
      return NextResponse.json({ error: 'Google not connected' }, { status: 404 })
    }

    const accessToken = (integration as any).accessToken as string

    // Attempt to create a small test spreadsheet using Google Sheets API
    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: { title: 'TheGridHub Test Sheet' }
      })
    })

    if (!createRes.ok) {
      const errText = await createRes.text().catch(()=>'')
      if (createRes.status === 403 || createRes.status === 401) {
        return NextResponse.json({
          error: 'Insufficient permissions or expired token',
          details: errText || 'Add Sheets scope to your Google integration and reconnect.'
        }, { status: 400 })
      }
      return NextResponse.json({ error: 'Sheets API request failed', details: errText }, { status: 500 })
    }

    const sheet = await createRes.json().catch(()=> ({}))

    // Best-effort cleanup: delete file via Drive API (requires drive.file or drive scope)
    try {
      const spreadsheetId = sheet?.spreadsheetId
      if (spreadsheetId) {
        await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(spreadsheetId)}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${accessToken}` },
        })
      }
    } catch {}

    return NextResponse.json({ success: true, message: 'Created and cleaned up a test spreadsheet.' })
  } catch (error) {
    console.error('Google Sheets smoke test error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

