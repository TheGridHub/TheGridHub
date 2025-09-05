#!/usr/bin/env node

/*
  Applies SQL migrations in supabase/migrations during build.
  - Uses DIRECT_URL if present, otherwise DATABASE_URL
  - Creates a tracking table internal_sql_migrations to avoid reapplying identical files
  - Safe to re-run: each migration is wrapped in a transaction
  - Skips gracefully if no DB URL is configured

  Control with APPLY_SQL_MIGRATIONS_ON_BUILD (default: true)
*/

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { Client } = require('pg')

async function main() {
  if ((process.env.APPLY_SQL_MIGRATIONS_ON_BUILD || 'true').toLowerCase() === 'false') {
    console.log('[migrate-supabase-sql] Skipped by APPLY_SQL_MIGRATIONS_ON_BUILD=false')
    return
  }

  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL
  if (!dbUrl) {
    console.warn('[migrate-supabase-sql] No DIRECT_URL or DATABASE_URL set; skipping SQL migrations')
    return
  }

  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations')
  if (!fs.existsSync(migrationsDir)) {
    console.log('[migrate-supabase-sql] No supabase/migrations directory; nothing to do')
    return
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()

  if (files.length === 0) {
    console.log('[migrate-supabase-sql] No .sql files found; nothing to do')
    return
  }

  const client = new Client({ connectionString: dbUrl })
  await client.connect()

  try {
    await client.query(`
      create table if not exists public.internal_sql_migrations (
        filename text primary key,
        checksum text not null,
        applied_at timestamptz not null default now()
      );
    `)

    for (const file of files) {
      const full = path.join(migrationsDir, file)
      const sql = fs.readFileSync(full, 'utf8')
      const checksum = crypto.createHash('sha256').update(sql).digest('hex')

      const res = await client.query('select checksum from public.internal_sql_migrations where filename=$1', [file])
      const existing = res.rows[0]?.checksum
      if (existing === checksum) {
        console.log(`[migrate-supabase-sql] Skipping already applied: ${file}`)
        continue
      }

      console.log(`[migrate-supabase-sql] Applying: ${file}`)
      try {
        await client.query('begin')
        await client.query(sql)
        await client.query(
          `insert into public.internal_sql_migrations (filename, checksum) values ($1,$2)
           on conflict (filename) do update set checksum=excluded.checksum, applied_at=now()`,
          [file, checksum]
        )
        await client.query('commit')
      } catch (e) {
        await client.query('rollback')
        console.error(`[migrate-supabase-sql] FAILED: ${file}`)
        throw e
      }
    }

    console.log('[migrate-supabase-sql] All SQL migrations applied successfully')
  } finally {
    await client.end()
  }
}

main().catch(err => {
  console.error('[migrate-supabase-sql] Error:', err.message || err)
  // Do not hard-fail the build unless explicitly requested
  if ((process.env.FAIL_BUILD_ON_MIGRATION_ERROR || 'false').toLowerCase() === 'true') {
    process.exit(1)
  }
})
