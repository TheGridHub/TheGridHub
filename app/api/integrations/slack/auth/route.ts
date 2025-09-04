import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID!
const SLACK_REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/slack/callback`

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!SLACK_CLIENT_ID) {
      return NextResponse.json({ error: 'Missing SLACK_CLIENT_ID' }, { status: 500 })
    }

    const scopes = [
      'chat:write',
      'channels:read',
      'users:read',
      'chat:write.public'
    ].join(',')

    const authUrl = `https://slack.com/oauth/v2/authorize?client_id=${encodeURIComponent(
      SLACK_CLIENT_ID
    )}&scope=${encodeURIComponent(scopes)}&user_scope=&redirect_uri=${encodeURIComponent(
      SLACK_REDIRECT_URI
    )}&state=${encodeURIComponent(userId)}`

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error('Error creating Slack auth URL:', error)
    return NextResponse.json({ error: 'Failed to create authorization URL' }, { status: 500 })
  }
}

