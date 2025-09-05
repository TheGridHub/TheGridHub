import { NextRequest, NextResponse } from 'next/server'
import { ensureInternalAuth } from '@/lib/internal-admin/auth'
import { prisma } from '@/lib/db/prisma'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    ensureInternalAuth()
    const { searchParams } = new URL(req.url)
    const schema = searchParams.get('schema') || 'public'
    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = $1 ORDER BY table_name`,
      schema
    )
    return NextResponse.json({ tables: rows.map(r => r.table_name) })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Failed to list tables' }, { status: 500 })
  }
}

