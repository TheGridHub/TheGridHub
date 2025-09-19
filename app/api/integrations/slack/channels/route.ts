import { NextResponse } from 'next/server'

export async function GET() {
  // TODO: fetch real channels via stored Slack token
  return NextResponse.json({ channels: [] })
}

