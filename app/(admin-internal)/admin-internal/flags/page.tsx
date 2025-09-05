"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminFlagsPage() {
  const [flags, setFlags] = useState<Array<{key:string, enabled:boolean, description?:string, is_public?: boolean}>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)
  const [busyKey, setBusyKey] = useState<string|null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin-internal/flags', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load flags')
      const j = await res.json()
      setFlags(j.flags || [])
    } catch (e:any) {
      setError(e?.message || 'Failed to load flags')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function toggleFlag(key: string, enabled: boolean) {
    setBusyKey(key)
    setError(null)
    try {
      const res = await fetch('/api/admin-internal/flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, enabled })
      })
      if (!res.ok) throw new Error('Update failed')
      await load()
    } catch (e:any) {
      setError(e?.message || 'Update failed')
    } finally {
      setBusyKey(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Feature Flags</h1>
          <p className="text-slate-600 text-sm">Enable/disable features across environments</p>
        </div>
        <Link href="/admin-internal" className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm">Back</Link>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Key</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Description</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Public</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Enabled</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr><td className="px-4 py-4" colSpan={4}>Loading...</td></tr>
            ) : flags.length === 0 ? (
              <tr><td className="px-4 py-4" colSpan={4}>No flags found</td></tr>
            ) : flags.map(f => (
              <tr key={f.key}>
                <td className="px-4 py-2 font-mono text-xs">{f.key}</td>
                <td className="px-4 py-2 text-sm text-slate-700">{f.description || '—'}</td>
                <td className="px-4 py-2 text-xs">{f.is_public ? 'Yes' : 'No'}</td>
                <td className="px-4 py-2">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!f.enabled}
                      onChange={(e)=>toggleFlag(f.key, e.target.checked)}
                      disabled={busyKey === f.key}
                    />
                    {busyKey === f.key ? 'Updating...' : (f.enabled ? 'On' : 'Off')}
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

