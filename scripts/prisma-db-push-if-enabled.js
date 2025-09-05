#!/usr/bin/env node

const { spawnSync } = require('child_process')

function main() {
  const enabled = (process.env.PRISMA_DB_PUSH_ON_BUILD || 'false').toLowerCase() === 'true'
  if (!enabled) {
    console.log('[prisma-db-push-if-enabled] Skipping (set PRISMA_DB_PUSH_ON_BUILD=true to enable on build)')
    return
  }

  // Prefer IPv4 during this execution
  process.env.NODE_OPTIONS = [process.env.NODE_OPTIONS || '', '--dns-result-order=ipv4first'].filter(Boolean).join(' ')

  // Allow fallback to SUPABASE_DB_URL if DATABASE_URL is not provided
  if (!process.env.DATABASE_URL && process.env.SUPABASE_DB_URL) {
    process.env.DATABASE_URL = process.env.SUPABASE_DB_URL
    console.log('[prisma-db-push-if-enabled] Using SUPABASE_DB_URL as DATABASE_URL')
  }

  const res = spawnSync('npx', ['--yes', 'prisma', 'db', 'push'], { stdio: 'inherit', shell: true })
  if (res.status !== 0) {
    console.error('[prisma-db-push-if-enabled] prisma db push failed')
    process.exit(res.status || 1)
  }
}

main()

