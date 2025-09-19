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
    const table = (searchParams.get('table') || '').trim()
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10) || 100, 500)
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10) || 0, 0)
    
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table)) {
      return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
    }
    
    const rows = await prisma.$queryRawUnsafe<any[]>(`SELECT * FROM "${table}" LIMIT ${limit} OFFSET ${offset}`)
    return NextResponse.json({ rows, limit, offset })
  } catch (e: any) {
    console.error('Database query error:', e)
    return NextResponse.json({ error: e?.message || 'Query failed' }, { status: 500 })
  }
}

