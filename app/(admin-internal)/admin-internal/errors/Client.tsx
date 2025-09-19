"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ErrorsClient() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin-internal/logs?level=error', { cache: 'no-store' })
      const j = await res.json()
      setLogs(j.logs || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Error Dashboard</h1>
          <p className="text-slate-600 text-sm">Recent errors (from app_logs)</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm">Refresh</button>
          <Link href="/admin-internal" className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm">Back</Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left">Time</th>
              <th className="px-3 py-2 text-left">Message</th>
              <th className="px-3 py-2 text-left">Context</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr><td className="px-3 py-3" colSpan={3}>Loading...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td className="px-3 py-3" colSpan={3}>No errors found</td></tr>
            ) : logs.map((l, i) => (
              <tr key={i}>
                <td className="px-3 py-2 text-xs text-slate-500">{l.created_at ? new Date(l.created_at).toLocaleString() : '—'}</td>
                <td className="px-3 py-2">{l.message || '—'}</td>
                <td className="px-3 py-2 font-mono text-[11px] text-slate-700 whitespace-pre-wrap">{l.context ? JSON.stringify(l.context) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
