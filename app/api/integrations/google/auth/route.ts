import { NextRequest, NextResponse } from 'next/server'
import { GoogleWorkspaceAuth } from '@/lib/integrations/google-workspace'
import { createClient } from '@/lib/supabase/server'

const googleConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google/callback`
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const googleAuth = new GoogleWorkspaceAuth(googleConfig)
    const authUrl = googleAuth.getAuthorizationUrl(userId)

    return NextResponse.json({ authUrl })

  } catch (error) {
    console.error('Error creating Google auth URL:', error)
    return NextResponse.json(
      { error: 'Failed to create authorization URL' },
      { status: 500 }
    )
  }
}

