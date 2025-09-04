import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { feature, enabled } = await req.json()
    if (!feature || typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'Missing feature or enabled' }, { status: 400 })
    }

    const integration = await db.integration.findFirst({ where: { id: params.id, userId } })
    if (!integration) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const current = (integration.features as any) || {}
    const updated = { ...current, [feature]: enabled }

    const saved = await db.integration.update({ where: { id: integration.id }, data: { features: updated } })
    return NextResponse.json(saved)
  } catch (error) {
    console.error('Features update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

