import { NextRequest, NextResponse } from 'next/server'
import { GoogleWorkspaceAuth, GoogleWorkspaceIntegration } from '@/lib/integrations/google-workspace'
import { redirect } from 'next/navigation'

const googleConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google/callback`
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state') // This contains the userId
    const error = searchParams.get('error')

    if (error) {
      console.error('OAuth error:', error)
      return redirect('/settings/integrations?error=oauth_failed')
    }

    if (!code || !state) {
      return redirect('/settings/integrations?error=missing_code')
    }

    const userId = state
    const googleAuth = new GoogleWorkspaceAuth(googleConfig)

    // Exchange code for tokens
    const tokens = await googleAuth.getTokens(code)

    // Get user info from Google
    try {
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`
        }
      })
      
      const userInfo = await userResponse.json()

      // Store integration in database
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/integrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': req.headers.get('cookie') || ''
        },
        body: JSON.stringify({
          type: 'google',
          name: 'Google Workspace',
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          userEmail: userInfo.email,
          expiresAt: tokens.expiryDate
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save integration')
      }

      return redirect('/settings/integrations?success=google_connected')

    } catch (error) {
      console.error('Error saving Google integration:', error)
      return redirect('/settings/integrations?error=save_failed')
    }

  } catch (error) {
    console.error('Google callback error:', error)
    return redirect('/settings/integrations?error=callback_failed')
  }
}

