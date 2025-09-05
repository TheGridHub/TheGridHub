"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'

function StatusBadge({ ok }: { ok?: boolean }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {ok ? 'OK' : 'FAIL'}
    </span>
  )
}

type Health = any

export default function AdminInternalHome() {
  const [envs, setEnvs] = useState<Array<{key:string,label:string,origin:string,tokens:any}>>([])
  const [selected, setSelected] = useState<string>('')
  const [health, setHealth] = useState<Health|null>(null)
  const [loading, setLoading] = useState(false)

  // DB migrations UI state
  const [migRunning, setMigRunning] = useState(false)
  const [migResult, setMigResult] = useState<any|null>(null)
  const [migError, setMigError] = useState<string|null>(null)

  async function loadEnvs() {
    try {
      const res = await fetch('/api/admin-internal/envs', { cache: 'no-store' })
      const j = await res.json()
      setEnvs(j.envs || [])
      if ((j.envs || []).length > 0 && !selected) setSelected(j.envs[0].key)
    } catch {}
  }

  async function loadHealth(key?: string) {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (key) params.set('env', key)
      const res = await fetch(`/api/admin-internal/health?${params.toString()}`, { cache: 'no-store' })
      const j = await res.json()
      setHealth(j)
    } catch {
      setHealth(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadEnvs() }, [])
  useEffect(() => { loadHealth(selected || undefined) }, [selected])

  async function applyMigrations(dryRun: boolean = false) {
    setMigRunning(true)
    setMigError(null)
    setMigResult(null)
    try {
      const res = await fetch('/api/admin-internal/db/apply-migrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dryRun }),
        cache: 'no-store'
      })
      const j = await res.json()
      if (!res.ok || j.error) {
        throw new Error(j.error || `HTTP ${res.status}`)
      }
      setMigResult(j)
    } catch (e: any) {
      setMigError(e?.message || 'Migration failed')
    } finally {
      setMigRunning(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">System Health</h1>
          <p className="text-slate-600 text-sm">Aggregated checks across app, db, integrations and envs (masked)</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">Environment</label>
          <select
            className="text-sm border border-slate-300 rounded-lg px-2 py-1"
            value={selected}
            onChange={e=> setSelected(e.target.value)}
          >
            {envs.length === 0 ? (
              <option value="">Current</option>
            ) : envs.map((e) => (
              <option key={e.key} value={e.key}>{e.label}</option>
            ))}
          </select>
          <Link href="/admin-internal/users" className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm">Users</Link>
          <Link href="/admin-internal/flags" className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm">Feature Flags</Link>
          <Link href="/admin-internal/logs" className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm">Logs</Link>
          <Link href="/admin-internal/errors" className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm">Errors</Link>
          <Link href="/admin-internal/db/explorer" className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm">DB</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <h2 className="font-semibold text-slate-900 mb-3">Runtime Checks</h2>
          {loading ? (
            <div className="text-sm text-slate-600">Loading...</div>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between"><div>App</div><StatusBadge ok={health?.checks?.app?.ok || health?.checks?.app?.status === 200} /></div>
              <div className="flex items-center justify-between"><div>Database</div><StatusBadge ok={health?.checks?.db?.ok || health?.checks?.db?.status === 200} /></div>
              <div className="flex items-center justify-between"><div>Stripe</div><StatusBadge ok={health?.checks?.stripe?.ok || health?.checks?.stripe?.status === 200} /></div>
              <div className="flex items-center justify-between"><div>Slack (service)</div><StatusBadge ok={health?.checks?.slack?.ok} /></div>
              <div className="flex items-center justify-between"><div>Google (service)</div><StatusBadge ok={health?.checks?.google?.ok} /></div>
              <div className="flex items-center justify-between"><div>Microsoft (service)</div><StatusBadge ok={health?.checks?.microsoft?.ok} /></div>
              <div className="flex items-center justify-between"><div>Supabase</div><StatusBadge ok={health?.checks?.supabase?.ok} /></div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <h2 className="font-semibold text-slate-900 mb-3">Environment</h2>
          <div className="text-xs mb-2 text-slate-600">Target: {health?.target?.origin || 'current'}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {health ? Object.entries(health.env).map(([k, v]: any) => (
              <div key={k} className="flex items-center justify-between border rounded-lg p-2">
                <div className="text-slate-600 mr-2 truncate">{k}</div>
                <div className="font-mono text-slate-900 truncate">{typeof v === 'object' && 'present' in v ? (v.present ? v.value : '—') : '[group]'}</div>
              </div>
            )) : <div className="text-slate-600">Unable to fetch health</div>}
          </div>
        </div>
      </div>

      {/* Database Utilities */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-900">Database Utilities</h2>
          <div className="flex items-center gap-2">
            <button
              disabled={migRunning}
              onClick={()=> applyMigrations(true)}
              className={`px-3 py-1.5 rounded-lg border text-sm ${migRunning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'} border-slate-300`}
            >
              Dry Run Migrations
            </button>
            <button
              disabled={migRunning}
              onClick={()=> applyMigrations(false)}
              className={`px-3 py-1.5 rounded-lg text-sm ${migRunning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-600'} bg-purple-500 text-white`}
            >
              {migRunning ? 'Applying…' : 'Apply Migrations'}
            </button>
          </div>
        </div>
        <div className="text-xs text-slate-600">
          <div>Runs SQL files from <code className="px-1 py-0.5 bg-slate-100 rounded">supabase/migrations</code> idempotently.</div>
          <div className="mt-2">
            {migError && (
              <div className="text-red-600">Error: {migError}</div>
            )}
            {migResult && (
              <div className="space-y-1">
                <div className="text-green-700">Applied: {Array.isArray(migResult.applied) && migResult.applied.length > 0 ? migResult.applied.join(', ') : '—'}</div>
                <div className="text-slate-700">Skipped: {Array.isArray(migResult.skipped) && migResult.skipped.length > 0 ? migResult.skipped.join(', ') : '—'}</div>
                {migResult.note && <div className="text-slate-500">{migResult.note}</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

