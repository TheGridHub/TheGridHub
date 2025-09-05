#!/usr/bin/env node
/*
  Simple API smoke tests for TheGridHub
  Usage:
    BASE_URL=http://localhost:3000 node scripts/smoke.js
    BASE_URL=https://app.thegridhub.co COOKIE="__session=..." node scripts/smoke.js

  Notes:
  - COOKIE is optional; when provided, authenticated endpoints are tested.
  - This script exits non-zero if any required check fails.
*/

const fetch = global.fetch || ((...args) => import('node-fetch').then(({default: f}) => f(...args)))

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const COOKIE = process.env.COOKIE || ''

async function check(path, { auth = false } = {}) {
  const url = `${BASE_URL}${path}`
  const res = await fetch(url, {
    headers: {
      ...(auth && COOKIE ? { Cookie: COOKIE } : {}),
    },
  })
  const ok = res.ok
  const status = res.status
  return { ok, status }
}

async function main() {
  let failed = false
  const results = []

  async function run(name, fn) {
    try {
      const r = await fn()
      results.push({ name, ...r })
      if (!r.ok) failed = true
    } catch (e) {
      results.push({ name, ok: false, error: e && e.message ? e.message : String(e) })
      failed = true
    }
  }

  const smokeMode = (process.env.SMOKE_MODE || 'auto').toLowerCase()
  const hasCookie = !!COOKIE
  const hasDbEnv = !!process.env.SUPABASE_URL

  // Always check app health
  await run('health:app', () => check('/api/health/app'))

  // DB health only when SUPABASE_URL exists or in full mode
  if (smokeMode === 'full' || hasDbEnv) {
    await run('health:db', () => check('/api/health/db'))
  }

  // Authenticated checks only when COOKIE provided or explicitly requested
  if (smokeMode === 'full' || hasCookie) {
    await run('integrations:slack:status', () => check('/api/integrations/slack/status', { auth: true }))
    await run('projects:list', () => check('/api/projects', { auth: true }))
    await run('tasks:list', () => check('/api/tasks', { auth: true }))
  }

  console.table(results.map(r => ({
    check: r.name,
    ok: r.ok,
    status: r.status || (r.ok ? 200 : 'ERR'),
    error: r.error || ''
  })))

  if (failed) {
    console.error('\nOne or more smoke checks failed.')
    process.exit(1)
  } else {
    console.log('\nAll smoke checks passed.')
  }
}

main().catch(e => {
  console.error('Smoke error:', e)
  process.exit(1)
})

