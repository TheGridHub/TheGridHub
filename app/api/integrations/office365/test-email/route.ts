import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const integration = await db.integration.findFirst({ where: { userId, type: 'office365' } })
    if (!integration) return NextResponse.json({ error: 'Office365 not connected' }, { status: 404 })

    const accessToken = integration.accessToken as unknown as string
    const recipient = integration.userEmail
    if (!recipient) return NextResponse.json({ error: 'Missing userEmail on integration' }, { status: 400 })

    const message = {
      message: {
        subject: 'TheGridHub: Test Email ✅',
        body: { contentType: 'Text', content: 'This is a test email from TheGridHub.' },
        toRecipients: [{ emailAddress: { address: recipient } }]
      }
    }

    const res = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(recipient)}/sendMail`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: 'Failed to send email', details: err }, { status: 500 })
    }

    await db.integration.update({ where: { id: integration.id }, data: { lastSync: new Date() } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Office365 test email error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

