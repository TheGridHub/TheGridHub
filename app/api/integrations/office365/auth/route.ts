import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Office365Auth } from '@/lib/integrations/office365'

const office365Config = {
  clientId: process.env.MICROSOFT_CLIENT_ID!,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
  tenantId: process.env.MICROSOFT_TENANT_ID || 'common',
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/office365/callback`
}

export async function POST(req: NextRequest) {
  try {
const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const office365Auth = new Office365Auth(office365Config)
    const authUrl = office365Auth.getAuthorizationUrl(userId)

    return NextResponse.json({ authUrl })

  } catch (error) {
    console.error('Error creating Office 365 auth URL:', error)
    return NextResponse.json(
      { error: 'Failed to create authorization URL' },
      { status: 500 }
    )
  }
}

