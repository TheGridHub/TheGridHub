import { NextRequest, NextResponse } from 'next/server'
import { ensureInternalAuth } from '@/lib/internal-admin/auth'
import { prisma } from '@/lib/db/prisma'

export const runtime = 'nodejs'

function isSafeSelect(sql: string) {
  const s = sql.trim().toLowerCase()
  if (!(s.startsWith('select') || s.startsWith('explain'))) return false
  // Basic blocklist for write operations
  const forbidden = [' insert ', ' update ', ' delete ', ' drop ', ' alter ', ' create ', ' grant ', ' revoke ', ' truncate ', ' vacuum ']
  return !forbidden.some(w => s.includes(w))
}

export async function POST(req: NextRequest) {
  try {
    const auth = ensureInternalAuth('owner')
    
    // Check if database is configured
    if (!process.env.DATABASE_URL && !process.env.SUPABASE_DB_URL) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }
    
    const body = await req.json().catch(()=> ({} as any))
    const sql = String(body.sql || '')
    if (!sql || sql.length > 2000) return NextResponse.json({ error: 'Invalid SQL' }, { status: 400 })
    if (!isSafeSelect(sql)) return NextResponse.json({ error: 'Only SELECT/EXPLAIN allowed' }, { status: 400 })
    
    const rows = await prisma.$queryRawUnsafe<any[]>(sql)
    return NextResponse.json({ rows })
  } catch (e: any) {
    console.error('SQL execution error:', e)
    const status = e?.status || 500
    return NextResponse.json({ error: e?.message || 'SQL failed' }, { status })
  }
}

