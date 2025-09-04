import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: NextRequest) {
  try {
    const RESEND_API_KEY = process.env.RESEND_API_KEY
    if (!RESEND_API_KEY) return NextResponse.json({ error: 'RESEND_API_KEY not set' }, { status: 500 })

    const { to, amount, currency } = await req.json()
    if (!to) return NextResponse.json({ error: 'Missing to' }, { status: 400 })

    const resend = new Resend(RESEND_API_KEY)

    const subject = 'Your TheGridHub Invoice'
    const html = `
      <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji;">
        <h2>Thanks for your purchase ✅</h2>
        <p>We've received your payment.</p>
        <div style="margin-top:12px;padding:12px;border:1px solid #e5e7eb;border-radius:8px">
          <div><strong>Amount:</strong> ${(amount ?? 0) / 100} ${(currency || 'USD').toUpperCase()}</div>
          <div><strong>Date:</strong> ${new Date().toLocaleString()}</div>
        </div>
        <p style="margin-top:16px;">You can manage your subscription anytime in Settings → Billing.</p>
      </div>
    `

    const { data, error } = await resend.emails.send({ from: 'TheGridHub <billing@thegridhub.co>', to, subject, html })
    if (error) return NextResponse.json({ error: 'Failed to send', details: error }, { status: 500 })
    return NextResponse.json({ success: true, id: data?.id })
  } catch (error) {
    console.error('Resend invoice test error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

