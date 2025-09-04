import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const slack = await db.integration.findFirst({ where: { userId, type: 'slack' } })
    if (!slack) return NextResponse.json({ error: 'Slack not connected' }, { status: 404 })

    const token = slack.accessToken as unknown as string

    const res = await fetch('https://slack.com/api/conversations.list?exclude_archived=true&types=public_channel,private_channel&limit=200', {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    })
    const json = await res.json()
    if (!json.ok) return NextResponse.json({ error: 'Failed to list channels' }, { status: 500 })

    const channels = (json.channels || []).map((c: any) => ({ id: c.id, name: c.name }))
    return NextResponse.json({ channels })
  } catch (error) {
    console.error('Slack channels error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

