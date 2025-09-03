import { NextRequest, NextResponse } from 'next/server'
import { Office365Auth, Office365Integration } from '@/lib/integrations/office365'
import { redirect } from 'next/navigation'

const office365Config = {
  clientId: process.env.MICROSOFT_CLIENT_ID!,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
  tenantId: process.env.MICROSOFT_TENANT_ID || 'common',
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/office365/callback`
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
    const office365Auth = new Office365Auth(office365Config)

    // Exchange code for tokens
    const tokens = await office365Auth.getAccessToken(code)

    // Get user info from Microsoft Graph
    const integration = new Office365Integration(office365Config, tokens.accessToken)
    
    try {
      // Get user profile to store email
      const userResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
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
          type: 'office365',
          name: 'Office 365',
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          userEmail: userInfo.mail || userInfo.userPrincipalName,
          expiresAt: Date.now() + (tokens.expiresIn * 1000)
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save integration')
      }

      return redirect('/settings/integrations?success=office365_connected')

    } catch (error) {
      console.error('Error saving Office 365 integration:', error)
      return redirect('/settings/integrations?error=save_failed')
    }

  } catch (error) {
    console.error('Office 365 callback error:', error)
    return redirect('/settings/integrations?error=callback_failed')
  }
}

