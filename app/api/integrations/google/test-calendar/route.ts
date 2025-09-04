import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const integration = await db.integration.findFirst({ where: { userId, type: 'google' } })
    if (!integration) return NextResponse.json({ error: 'Google not connected' }, { status: 404 })

    const accessToken = integration.accessToken as unknown as string

    const event = {
      summary: 'TheGridHub: Test Event ✅',
      description: 'This is a test calendar event created by TheGridHub.',
      start: { dateTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(), timeZone: 'UTC' },
      end: { dateTime: new Date(Date.now() + 65 * 60 * 1000).toISOString(), timeZone: 'UTC' }
    }

    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: 'Failed to create event', details: err }, { status: 500 })
    }

    await db.integration.update({ where: { id: integration.id }, data: { lastSync: new Date() } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Google test calendar error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

