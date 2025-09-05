import { NextRequest, NextResponse } from 'next/server'
import { ensureInternalAuth } from '@/lib/internal-admin/auth'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { Client } from 'pg'
import { promises as dns } from 'dns'

export const runtime = 'nodejs'

function getDbUrl() {
  return process.env.DIRECT_URL || process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || ''
}

async function connectPg(url: string) {
  const u = new URL(url)
  const host = u.hostname
  let ipv4Host = host
  try {
    const a = await dns.resolve4(host)
    if (a && a.length > 0) ipv4Host = a[0]
  } catch {}

  const ssl = u.searchParams.get('sslmode') === 'disable' ? false : { rejectUnauthorized: false }
  const client = new Client({
    host: ipv4Host,
    port: Number(u.port || 5432),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\/+/, '') || 'postgres',
    ssl,
  })
  await client.connect()
  return client
}

export async function POST(req: NextRequest) {
  try {
    ensureInternalAuth('owner')

    const { dryRun } = await req.json().catch(() => ({ dryRun: false }))

    const dbUrl = getDbUrl()
    if (!dbUrl) {
      return NextResponse.json({ error: 'DATABASE_URL/DIRECT_URL/SUPABASE_DB_URL not configured' }, { status: 500 })
    }

    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations')
    if (!fs.existsSync(migrationsDir)) {
      return NextResponse.json({ error: 'No migrations directory found at supabase/migrations' }, { status: 404 })
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort()

    if (files.length === 0) {
      return NextResponse.json({ ok: true, applied: [], skipped: [], note: 'No .sql files to apply' })
    }

    const client = await connectPg(dbUrl)

    try {
      await client.query(`
        create table if not exists public.internal_sql_migrations (
          filename text primary key,
          checksum text not null,
          applied_at timestamptz not null default now()
        );
      `)

      const applied: string[] = []
      const skipped: string[] = []

      for (const file of files) {
        const full = path.join(migrationsDir, file)
        const sql = fs.readFileSync(full, 'utf8')
        const checksum = crypto.createHash('sha256').update(sql).digest('hex')

        const res = await client.query('select checksum from public.internal_sql_migrations where filename=$1', [file])
        const existing = res.rows[0]?.checksum
        if (existing === checksum) {
          skipped.push(file)
          continue
        }

        if (dryRun) {
          applied.push(`${file} (dry-run)`) // report but don’t execute
          continue
        }

        await client.query('begin')
        try {
          await client.query(sql)
          await client.query(
            `insert into public.internal_sql_migrations (filename, checksum) values ($1,$2)
             on conflict (filename) do update set checksum=excluded.checksum, applied_at=now()`,
            [file, checksum]
          )
          await client.query('commit')
          applied.push(file)
        } catch (e) {
          await client.query('rollback')
          throw Object.assign(new Error(`Migration failed: ${file}`), { cause: e })
        }
      }

      return NextResponse.json({ ok: true, applied, skipped })
    } finally {
      await client.end()
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Migration apply failed' }, { status: 500 })
  }
}

