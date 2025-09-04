import { NextRequest } from 'next/server'
import { redirect } from 'next/navigation'

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID!
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET!
const SLACK_REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/slack/callback`

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state') // userId
    const error = searchParams.get('error')

    if (error) {
      console.error('Slack OAuth error:', error)
      return redirect('/settings/integrations?error=oauth_failed')
    }

    if (!code || !state) {
      return redirect('/settings/integrations?error=missing_code')
    }

    if (!SLACK_CLIENT_ID || !SLACK_CLIENT_SECRET) {
      console.error('Missing Slack OAuth env vars')
      return redirect('/settings/integrations?error=server_config')
    }

    // Exchange code for access token
    const tokenRes = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: SLACK_CLIENT_ID,
        client_secret: SLACK_CLIENT_SECRET,
        code,
        redirect_uri: SLACK_REDIRECT_URI
      })
    })

    const tokenJson = await tokenRes.json()
    if (!tokenJson.ok) {
      console.error('Slack token exchange failed:', tokenJson)
      return redirect('/settings/integrations?error=token_failed')
    }

    const accessToken: string = tokenJson.access_token
    const teamName: string = tokenJson.team?.name || 'Slack Team'

    // Store integration via our API (sets status=connected)
    const apiRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/integrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'slack',
        name: 'Slack',
        accessToken,
        refreshToken: null,
        userEmail: `${teamName.replace(/\s+/g, '').toLowerCase()}@slack.local`
      })
    })

    if (!apiRes.ok) {
      console.error('Failed to save Slack integration')
      return redirect('/settings/integrations?error=save_failed')
    }

    return redirect('/settings/integrations?success=slack_connected')
  } catch (e) {
    console.error('Slack callback error:', e)
    return redirect('/settings/integrations?error=callback_failed')
  }
}

