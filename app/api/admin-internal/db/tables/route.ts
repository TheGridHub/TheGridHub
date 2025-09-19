import { NextRequest, NextResponse } from 'next/server'
import { ensureInternalAuth } from '@/lib/internal-admin/auth'
import { prisma } from '@/lib/db/prisma'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    ensureInternalAuth()
    
    // Check if database is configured
    if (!process.env.DATABASE_URL && !process.env.SUPABASE_DB_URL) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }
    
    const { searchParams } = new URL(req.url)
    const schema = searchParams.get('schema') || 'public'
    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = $1 ORDER BY table_name`,
      schema
    )
    return NextResponse.json({ tables: rows.map(r => r.table_name) })
  } catch (e: any) {
    console.error('Tables listing error:', e)
    return NextResponse.json({ error: e?.message || 'Failed to list tables' }, { status: 500 })
  }
}

