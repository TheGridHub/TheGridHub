import { NextResponse, type NextRequest } from 'next/server'

export async function POST(_req: NextRequest) {
  // TODO: send a real message via Slack token; for now return ok
  return NextResponse.json({ ok: true })
}

